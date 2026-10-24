import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import '../voltpro-engineering-source/workspace-engineering-theme.css';

if(new URLSearchParams(window.location.search).has('vp_embed'))document.documentElement.classList.add('vp-electcad-embed');

class EditorErrorBoundary extends React.Component<{children:React.ReactNode},{error:string|null}>{
  state={error:null as string|null};
  static getDerivedStateFromError(error:Error){return {error:error.message||'Unexpected application error'};}
  componentDidCatch(error:Error,info:React.ErrorInfo){console.error('VoltPro rendering error',error,info.componentStack);}
  render(){if(this.state.error)return <main role="alert" style={{minHeight:'100vh',background:'#101820',color:'#e7f1f5',fontFamily:'system-ui',padding:'3rem'}}><h1>VoltPro ElectCAD</h1><h2>The editor could not start</h2><p>{this.state.error}</p><button onClick={()=>window.location.reload()} style={{padding:12}}>Reload editor</button><p>If this persists, please report the error text on GitHub.</p></main>;return this.props.children;}
}

const root=document.getElementById('root');
if(!root)throw new Error('VoltPro application mount point is missing');
createRoot(root).render(<React.StrictMode><EditorErrorBoundary><App /></EditorErrorBoundary></React.StrictMode>);
