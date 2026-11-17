import type {Data} from './types';
import {initialData} from './types';
import {supabase} from './supabase';
const CACHE='rgpb-founder-cache-v1';
const PRE_UPGRADE_BACKUP='rgpb-founder-cache-v1-pre-daily-checks';
export function readCache():Data{
 const raw=localStorage.getItem(CACHE);
 if(raw===null)return initialData();
 // Never silently overwrite an existing but malformed or unsupported snapshot.
 let parsed:unknown;
 try{parsed=JSON.parse(raw)}catch{throw new Error('Сохранённый JSON повреждён')}
 if(!validData(parsed))throw new Error('Сохранённый формат не поддерживается');
 const obj=parsed as Data;
 if(!obj.dailyChecks){
  try{if(localStorage.getItem(PRE_UPGRADE_BACKUP)===null)localStorage.setItem(PRE_UPGRADE_BACKUP,raw)}catch{/* Original remains in CACHE. */}
  return {...obj,dailyChecks:{}};
 }
 return obj;
}
export function writeCache(data:Data){localStorage.setItem(CACHE,JSON.stringify(data))}
export function validData(v:unknown):v is Data{if(!v||typeof v!=='object')return false;const d=v as Partial<Data>;return Array.isArray(d.categories)&&Array.isArray(d.tasks)&&Array.isArray(d.sessions)&&!!d.settings&&typeof d.settings.work_minutes==='number'&&d.categories.every(c=>typeof c.id==='string'&&typeof c.minutes==='number')&&d.tasks.every(t=>typeof t.id==='string'&&typeof t.title==='string'&&typeof t.due_date==='string')&&(d.dailyChecks===undefined||validDailyChecks(d.dailyChecks))}
function validDailyChecks(v:unknown):boolean{return !!v&&typeof v==='object'&&!Array.isArray(v)&&Object.entries(v).every(([date,flags])=>/^\d{4}-\d{2}-\d{2}$/.test(date)&&!!flags&&typeof flags==='object'&&!Array.isArray(flags)&&Object.values(flags).every(value=>typeof value==='boolean'))}
export async function loadCloud(userId:string):Promise<Data|null>{const db=supabase();if(!db)return null;const {data,error}=await db.from('user_data').select('payload').eq('user_id',userId).maybeSingle();if(error)throw error;return data?.payload&&validData(data.payload)?data.payload:null}
export async function saveCloud(userId:string,payload:Data){const db=supabase();if(!db)throw Error('Облако не настроено');const {error}=await db.from('user_data').upsert({user_id:userId,payload,updated_at:new Date().toISOString()},{onConflict:'user_id'});if(error)throw error}
export function download(name:string,content:string,mime:string){const blob=new Blob([content],{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)}
export function csv(data:Data){const esc=(v:unknown)=>'"'+String(v??'').replaceAll('"','""')+'"';return [['id','title','date','status','priority','category','planned_minutes','actual_minutes'],...data.tasks.map(t=>[t.id,t.title,t.due_date,t.status,t.priority,data.categories.find(c=>c.id===t.category_id)?.name??'',t.planned_minutes,t.actual_minutes])].map(r=>r.map(esc).join(',')).join('\n')}
