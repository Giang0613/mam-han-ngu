import {spawn} from 'node:child_process';
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start',...process.argv.slice(2)],{stdio:'inherit',env:{...process.env,SUPERWEB_DIST_DIR:'.next-production'}});child.on('exit',code=>process.exit(code??1));
