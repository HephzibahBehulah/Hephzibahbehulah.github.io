import legacy, {Sandbox,ContainerProxy} from './worker-public-v2.js';
import {verifyCloudflareAccessJwt} from './platform/access.mjs';
import engineeringAI from './platform/engineering-ai.mjs';
import {createPlatform} from './platform/router.mjs';
import cyberAI from './platform/cyber-ai.mjs';
import {accountGateway} from './platform/admin-accounts.mjs';
export {Sandbox,ContainerProxy};
export default createPlatform({legacy,verifyAdmin:verifyCloudflareAccessJwt,engineeringAI,cyberAI,accountAdmin:accountGateway});
