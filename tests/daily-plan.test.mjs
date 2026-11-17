import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PLAN_BLOCKS,PLAN_MINUTES,chisinauDate,shiftDate,formatPlanDate,dailyProgress,toggleDailyCheck,resetDailyChecks} from '../src/lib/daily-plan.ts';

test('fixed workday schedule stays at 360 minutes',()=>{
 assert.deepEqual(PLAN_BLOCKS.map(b=>b.minutes),[150,90,75,45]);
 assert.equal(PLAN_BLOCKS.reduce((s,b)=>s+b.minutes,0),PLAN_MINUTES);
});
test('weighted completion: 0, 41.7, 66.7, 100',()=>{
 const date='2026-11-17';
 let c={};
 assert.equal(dailyProgress(c,date).percent,0);
 c=toggleDailyCheck(c,date,'sales');
 assert.ok(Math.abs(dailyProgress(c,date).percent-41.6666666667)<1e-6);
 c=toggleDailyCheck(c,date,'offers');
 assert.ok(Math.abs(dailyProgress(c,date).percent-66.6666666667)<1e-6);
 c=toggleDailyCheck(toggleDailyCheck(c,date,'delivery'),date,'management');
 assert.deepEqual(dailyProgress(c,date),{doneMinutes:360,remainingMinutes:0,completedCount:4,percent:100});
});
test('double toggle uses freshest state and preserves original history',()=>{
 const date='2026-11-17', initial={};
 const once=toggleDailyCheck(initial,date,'sales');
 const twice=toggleDailyCheck(once,date,'sales');
 assert.equal(dailyProgress(once,date).completedCount,1);
 assert.equal(dailyProgress(twice,date).completedCount,0);
 assert.deepEqual(initial,{});
});
test('date separation, reset only selected date',()=>{
 let c={};
 c=toggleDailyCheck(c,'2026-11-16','sales');
 c=toggleDailyCheck(c,'2026-11-17','offers');
 assert.equal(dailyProgress(c,'2026-11-18').completedCount,0);
 const reset=resetDailyChecks(c,'2026-11-17');
 assert.equal(dailyProgress(reset,'2026-11-16').doneMinutes,150);
 assert.equal(dailyProgress(reset,'2026-11-17').doneMinutes,0);
 assert.equal(dailyProgress(c,'2026-11-17').doneMinutes,90);
});
test('JSON export and restore preserve dated checks',()=>{
 const checks={'2026-11-16':{sales:true},'2026-11-17':{offers:true}};
 assert.deepEqual(JSON.parse(JSON.stringify(checks)),checks);
});
test('Chisinau date at midnight and DST, independent of runtime TZ',()=>{
 assert.equal(chisinauDate(new Date('2026-11-16T21:59:59Z')),'2026-11-16');
 assert.equal(chisinauDate(new Date('2026-11-16T22:00:00Z')),'2026-11-17');
 assert.equal(chisinauDate(new Date('2026-07-01T20:59:59Z')),'2026-07-01');
 assert.equal(chisinauDate(new Date('2026-07-01T21:00:00Z')),'2026-07-02');
});
test('shifting dates across months, years and DST',()=>{
 assert.equal(shiftDate('2026-03-28',1),'2026-03-29');
 assert.equal(shiftDate('2026-03-29',1),'2026-03-30');
 assert.equal(shiftDate('2026-12-31',1),'2027-01-01');
 assert.equal(shiftDate('2026-01-01',-1),'2025-12-31');
 assert.match(formatPlanDate('2026-11-17'),/17/);
});
