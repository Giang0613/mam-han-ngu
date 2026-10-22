import {spawn,spawnSync} from 'node:child_process';
const migration=spawnSync(process.execPath,['scripts/migrate-study.mjs'],{stdio:'inherit'});
if(migration.status!==0)process.exit(migration.status??1);
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','0.0.0.0','--port','3000'],{stdio:'inherit'});
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.kill(signal));
server.on('exit',code=>process.exit(code??1));
