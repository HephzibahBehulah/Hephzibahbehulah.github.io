import {createAccountService} from './admin-accounts-core.mjs';
Deno.serve(createAccountService({readEnv:(name:string)=>Deno.env.get(name)}));
