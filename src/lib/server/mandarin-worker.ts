import {spawn, type ChildProcessWithoutNullStreams} from 'node:child_process';
import {createInterface} from 'node:readline';

type Task = {
  key: string; text: string; rate: number; reading: string;
  resolve: () => void; reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};
type Options = {
  executable: string; args: string[]; cwd: string;
  capacity?: number; timeoutMs?: number;
  diagnostic?: (code: string) => void;
};

// The Python protocol processes one line at a time. Keep the backlog in Node
// so queued jobs can expire without leaving more work in the Python stdin pipe.
export class MandarinWorker {
  readonly revision = 'bounded-fifo-v1';
  child: ChildProcessWithoutNullStreams | null = null;
  private active: Task | null = null;
  private waiting: Task[] = [];
  constructor(private options: Options) {}
  get size() { return this.waiting.length + (this.active ? 1 : 0); }
  private report(code: string) {
    if (this.options.diagnostic) this.options.diagnostic(code);
    else console.warn('[MandarinWorker] ' + code);
  }
  private start() {
    if (this.child) return;
    const child = spawn(this.options.executable, this.options.args, {cwd: this.options.cwd, windowsHide: true, stdio: 'pipe'});
    this.child = child;
    let reportedStderr = false;
    child.stderr.on('data', chunk => {
      if (!reportedStderr && /error|exception|traceback/i.test(chunk.toString())) {
        reportedStderr = true;
        // Do not log stderr contents: a provider may include private text.
        this.report('runtime_error');
      }
    });
    createInterface({input: child.stdout}).on('line', line => {
      if (this.child !== child) return;
      try {
        const response = JSON.parse(line);
        const job = this.active;
        if (!job || response.key !== job.key) return;
        if (response.ok === true) this.finish(job);
        else {
          const code = typeof response.error === 'string' && /^[A-Za-z][A-Za-z0-9_]{0,39}$/.test(response.error) ? response.error : 'unknown';
          this.report('synthesis_failed:' + code);
          this.finish(job, Error('Mandarin synthesis failed'));
        }
      } catch { /* Non-protocol progress messages are ignored. */ }
    });
    child.on('error', () => this.fail(child, 'worker_start_failed'));
    child.stdin.on('error', () => this.fail(child, 'worker_write_failed'));
    child.on('exit', code => this.fail(child, 'worker_exit:' + (code ?? 'signal')));
  }
  private finish(job: Task, error?: Error) {
    if (this.active !== job && !this.waiting.includes(job)) return;
    clearTimeout(job.timer);
    if (this.active === job) this.active = null;
    else this.waiting.splice(this.waiting.indexOf(job), 1);
    if (error) job.reject(error); else job.resolve();
    this.pump();
  }
  private fail(child: ChildProcessWithoutNullStreams, code: string) {
    if (this.child !== child) return;
    this.child = null;
    const jobs = [...(this.active ? [this.active] : []), ...this.waiting];
    this.active = null; this.waiting = [];
    this.report(code);
    child.kill();
    for (const job of jobs) {
      clearTimeout(job.timer);
      job.reject(Error('Mandarin worker unavailable'));
    }
  }
  private pump() {
    if (this.active || !this.waiting.length) return;
    this.start();
    const job = this.waiting.shift()!;
    this.active = job;
    const child = this.child!;
    child.stdin.write(JSON.stringify({key: job.key, text: job.text, rate: job.rate, reading: job.reading}) + '\n', error => {
      if (error) this.fail(child, 'worker_write_failed');
    });
  }
  create(key: string, text: string, rate: number, reading: string) {
    if (this.size >= (this.options.capacity ?? 24)) return Promise.reject(Error('Mandarin voice busy'));
    return new Promise<void>((resolve, reject) => {
      const job: Task = {key, text, rate, reading, resolve, reject, timer: setTimeout(() => {
        if (this.active === job && this.child) this.fail(this.child, 'worker_timeout');
        else this.finish(job, Error('Mandarin synthesis queue timeout'));
      }, this.options.timeoutMs ?? 85000)};
      this.waiting.push(job);
      this.pump();
    });
  }
  close() {
    if (this.child) this.fail(this.child, 'worker_closed');
  }
}
