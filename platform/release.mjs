import {spawnSync} from 'node:child_process';
const run=(args)=>{const result=spawnSync(process.execPath,args,{stdio:'inherit'});if(result.status!==0)process.exit(result.status||1);};
run(['platform/check-browser-scripts.mjs']);
run(['--test','platform/access.test.mjs','platform/router.test.mjs','platform/engineering-ai.test.mjs','platform/app-archives.test.mjs']);
run(['platform/fetch-apps.mjs']);
run(['platform/build.mjs','platform-source/engineering','platform-source/cyber']);
run(['platform/prepare-config.mjs']);
