/** Fixed founder-level daily schedule. This does not track actual hours. */
export const PLAN_BLOCKS = [
 {id:'sales',name:'Поиск клиентов и продажи',minutes:150},
 {id:'offers',name:'Коммерческие предложения и переговоры',minutes:90},
 {id:'delivery',name:'Продукт и выполнение заказов',minutes:75},
 {id:'management',name:'Управление и аналитика',minutes:45},
] as const;
export const PLAN_MINUTES = 360;
export type DailyChecks = Record<string,Record<string,boolean>>;

/** Calendar date of Moldova, independent of the device time zone. */
export function chisinauDate(at:Date=new Date()):string{
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Chisinau',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(at);
 const find=(key:string)=>parts.find(p=>p.type===key)?.value??'';
 return `${find('year')}-${find('month')}-${find('day')}`;
}

/** Calendar arithmetic in UTC avoids locale and DST-dependent date shifts. */
export function shiftDate(date:string,days:number):string{
 const [year,month,day]=date.split('-').map(Number);
 const d=new Date(Date.UTC(year,month-1,day+days,12,0,0));
 return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
}
export function formatPlanDate(date:string,short=false):string{
 const dateObject=new Date(date+'T12:00:00Z');
 return dateObject.toLocaleDateString('ru-RU',{timeZone:'Europe/Chisinau',day:'numeric',month:short?'short':'long',year:'numeric',...(short?{}:{weekday:'long'})});
}
export function dailyProgress(checks:DailyChecks|undefined,date:string){
 const flags=checks?.[date];
 const completed=PLAN_BLOCKS.filter(block=>flags?.[block.id]===true);
 const doneMinutes=completed.reduce((sum,block)=>sum+block.minutes,0);
 return {doneMinutes,remainingMinutes:PLAN_MINUTES-doneMinutes,completedCount:completed.length,percent:doneMinutes/PLAN_MINUTES*100};
}
export function toggleDailyCheck(checks:DailyChecks|undefined,date:string,id:string):DailyChecks{
 const previous=checks?.[date]??{};
 return {...checks,[date]:{...previous,[id]:previous[id]!==true}};
}
export function resetDailyChecks(checks:DailyChecks|undefined,date:string):DailyChecks{
 return {...checks,[date]:{}};
}
