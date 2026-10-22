import {z} from 'zod';
import {sqlite} from '@/db';
import {getProfile, readBody, respond, handleError, setLearnerSession, StudyError} from '@/lib/study-server';
import {createRecoveryCode, recoverProfile} from '@/lib/server/profile-access';
import {reserveRecoveryAttempt} from '@/lib/server/study-guards';

const schema = z.discriminatedUnion('action', [
  z.object({action: z.literal('create')}).strict(),
  z.object({action: z.literal('restore'), code: z.string().trim().max(100)}).strict(),
]);

export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await readBody(req, 1000));
    if (!parsed.success) throw new StudyError(400, 'Yêu cầu khôi phục chưa hợp lệ.');
    if (parsed.data.action === 'create') {
      const profile = await getProfile();
      return respond({code: createRecoveryCode(sqlite, profile)});
    }
    reserveRecoveryAttempt(sqlite, req);
    await setLearnerSession(recoverProfile(sqlite, parsed.data.code));
    return respond({recovered: true});
  } catch (error) { return handleError(error); }
}
