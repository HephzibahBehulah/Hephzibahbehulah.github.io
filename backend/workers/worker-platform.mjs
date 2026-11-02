import legacy, {Sandbox} from './worker-public-v2.js';
import {verifyCloudflareAccessJwt} from '../../platform/access.mjs';
import {createPlatform} from '../../platform/router.mjs';
import cyberAI from '../../platform/cyber-ai.mjs';
import {accountGateway} from '../../platform/admin-accounts.mjs';
export {Sandbox};
export default createPlatform({legacy,verifyAdmin:verifyCloudflareAccessJwt,cyberAI,accountAdmin:accountGateway});
