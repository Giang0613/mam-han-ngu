# Profile recovery, budgets and runtime

## Recover a learner profile

In Settings, choose **Create / replace recovery code**, then save the code in a
private place. On another browser connected to the same installation, enter it
under **Restore profile**. A restore opens the original profile and preserves its
cards and learning history. It does not merge the other browser's profile.

The code is a separate 256-bit random credential, not the HttpOnly session cookie.
Only its SHA-256 digest is stored. Replacing a code invalidates the old code;
restoring issues an independent random session. Existing cookies remain valid.
Someone who possesses the code can access that profile, so do not put it in an
issue, screenshot or repository. Recovery responses are private and not cached.

This recovers access to data still present on that server. It is not cross-server
sync, a replacement for a database backup, or an import of the exported progress
JSON. A profile whose cookie was already lost before a recovery code was created
needs explicit manual recovery by the database owner; the server never guesses
which profile a visitor should own.

The database owner can run **npm run db:migrate**, then
**node scripts/recover-profile.mjs --list** locally to identify the intended
profile. **node scripts/recover-profile.mjs --profile PROFILE_ID** issues a new
code for that exact profile. Its output is a private credential; do not paste it
into logs, issues or chat. No web route lists other learners' identities.

## Request budgets and proxies

AI requests and Azure token requests reserve counters atomically for the profile,
the client scope, and the entire installation. By default, an installation can
reserve 30 tutor requests and 20 speech tokens per UTC day. New profiles, cleared
cookies, and changed addresses do not reset the installation counter.
Rejected reservations roll back every counter. Existing usage totals are adopted
when the new guard tables are first migrated. Failed provider calls remain
reserved so retries cannot turn provider failures into an unlimited request loop.

AI_INSTANCE_DAILY_LIMIT and SPEECH_INSTANCE_DAILY_LIMIT override installation
caps; 0 disables a service. IP caps use AI_IP_DAILY_LIMIT and SPEECH_IP_DAILY_LIMIT.
Empty values use defaults. These are request/token-issuance caps, not a currency
budget: a short-lived Azure token can authorize multiple provider operations.
Configure provider-side spending and resource limits as well.

Behind a TLS proxy, set APP_ORIGIN to the exact public origin, for example
https://learn.example. The server uses this configured origin for CSRF checking
instead of trusting forwarded host/protocol headers. Direct local use works
without it. Cookie security follows the configured HTTP/HTTPS origin; retain HTTPS
for a public server.

Forwarded addresses are ignored unless TRUST_PROXY=1. Enable that setting only if
the proxy strips incoming forwarding headers and writes exactly one verified
client address into X-Forwarded-For. Missing, malformed or multi-address values
then fail closed. Without trusted addresses, the app uses a shared direct-client
bucket in addition to the installation budget. Raw addresses are not stored by
the quota layer. Recovery attempts also have a shared hourly cap.

## Backups and storage

**npm run dev** and **npm run start** migrate before starting. Migration creates
an online SQLite backup before changing an existing schema, including committed
WAL data. It stops if backup fails. **npm run db:backup** makes another snapshot.
Snapshots use unique filenames and are never overwritten automatically.

Defaults are local.db and .cache/backups/. Set STUDY_DATABASE_PATH and
STUDY_BACKUP_DIR for another server-local location. Backups contain private learner
data and recovery digests; copy them to protected independent storage as part of
your backup policy. There is no automatic retention deletion.

For a full database restore: stop the app, preserve the current database and its
WAL/SHM files together, then restore the chosen snapshot at the configured database
path. Do not combine a restored snapshot with WAL/SHM files from another database.
Restart and use the original cookie or a recovery code present in that snapshot.
Never replace an active database with a plain filesystem copy.

## Audio scheduling

The streaming Mandarin worker processes one request at a time with a FIFO backlog
of at most 24 jobs including the active job. The 85-second deadline includes time
in the queue. A full queue returns an unavailable state. A hung or exited worker
rejects the affected backlog; the next request can start a fresh worker. Cached
audio and identical in-flight requests remain deduplicated.

Diagnostics log fixed event codes and validated exception class names, not raw
stderr, lesson text, recordings or provider credentials.

## Deploy with Docker

Use Node 24 directly, or Node 22 after installing dependencies for that Node major.
Node 20 is unsupported by the locked better-sqlite3 version. CI runs source and
API checks on both supported majors.

With Docker and Compose installed:

    cp .env.example .env
    docker compose up --build -d

The image contains Node 24, Python 3.13, native SQLite and the current streaming
voice dependencies. Source text synthesis still needs the external voice service.
Compose binds the site to 127.0.0.1:3000; the named volume study-data holds the
database, backups and generated voice clips. Ordinary container replacement keeps
that volume. Do not delete it when updating. Filled environment files, databases,
caches and recordings are excluded from the image build context.

This is a persistent self-hosted deployment. Ephemeral serverless filesystems are
not supported; they require a separate durable database and worker design.

References: [official Node image](https://hub.docker.com/_/node),
[official Python image](https://hub.docker.com/_/python), and
[Docker volume lifecycle](https://docs.docker.com/engine/storage/volumes/).
