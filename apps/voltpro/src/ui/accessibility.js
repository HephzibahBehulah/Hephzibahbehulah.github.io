(()=>{'use strict';
const shortcuts={Delete:'delete',Backspace:'delete','Ctrl+Z':'undo','Ctrl+Y':'redo','Ctrl+C':'copy','Ctrl+V':'paste','Ctrl+S':'save','Ctrl+O':'open','Ctrl+Shift+F':'fit','R':'rotate','M':'mirror','W':'wire','Escape':'cancel'};
function commandFor(event){const key=(event.ctrlKey?'Ctrl+':'')+(event.shiftKey?'Shift+':'')+(event.key.length===1?event.key.toUpperCase():event.key);return shortcuts[key]||shortcuts[event.key]||null}
window.VoltProAccessibility={shortcuts,commandFor};
})();