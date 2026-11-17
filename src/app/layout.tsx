import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata:Metadata={title:'RGPB Founder Command Center',description:'Личная система управления бизнесом RGPB',applicationName:'RGPB Command Center',manifest:`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/manifest.webmanifest`,icons:{icon:`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/rgpb-logo.jpg`,apple:`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/rgpb-logo.jpg`}};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#111c35'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="ru"><body>{children}</body></html>}
