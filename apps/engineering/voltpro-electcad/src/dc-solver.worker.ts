import {runDcOperatingPoint, type DcResult} from './dc-solver.mjs';
import type {Sheet} from './editor-model';

type SolverReply={ok:true;result:DcResult}|{ok:false;error:string};
const workerScope=self as unknown as {
  onmessage:((event:MessageEvent<Sheet>)=>void)|null;
  postMessage:(reply:SolverReply)=>void;
};

workerScope.onmessage=event=>{
  try{
    workerScope.postMessage({ok:true,result:runDcOperatingPoint(event.data)});
  }catch(error){
    workerScope.postMessage({ok:false,error:error instanceof Error?error.message:'Simulation failed'});
  }
};
