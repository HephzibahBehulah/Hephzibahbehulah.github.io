/* Studio catalogue searching runs away from the editor UI thread. */
importScripts('./studio-bank.js');self.onmessage=({data})=>{try{self.postMessage({request:data.request,result:self.HBStudioBank.query(data.options)});}catch(error){self.postMessage({request:data.request,error:error.message});}};
