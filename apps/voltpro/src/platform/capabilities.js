(()=>{'use strict';
const capabilities={browser:true,pwa:true,offlineProjects:true,desktopWrapper:true,androidWrapper:true,cloudRequired:false};
function available(feature){return Boolean(capabilities[feature])}
window.VoltProPlatform={capabilities,available};
})();