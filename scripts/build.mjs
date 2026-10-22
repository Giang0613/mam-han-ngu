import {spawnSync} from 'node:child_process';
const result=spawnSync(process.execPath,['node_modules/next/dist/bin/next','build',...process.argv.slice(2)],{stdio:'inherit',env:{...process.env,SUPERWEB_DIST_DIR:'.next-production'}});process.exit(result.status??1);
