(()=>{'use strict';
function audit(manifest={},files=[]){const errors=[];if(manifest.license!=='Apache-2.0')errors.push('project licence mismatch');for(const required of ['ASSET_ATTRIBUTIONS.md','THIRD_PARTY_LICENSES.md'])if(!files.includes(required))errors.push('missing '+required);return {passed:errors.length===0,errors}}
window.VoltProProvenance={audit};
})();