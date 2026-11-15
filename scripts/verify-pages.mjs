import { mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { KNIGHT_FRAMES, KNIGHT_PALETTE } from '../src/rendering/knight-art.ts';
import { installPixelProbe } from '../tests/pages-probe.js';
import { openPagesBrowser } from './pages-browser.mjs';

// node scripts/verify-pages.mjs CHROME_EXECUTABLE
const chrome = process.argv[2] || process.env.CHROME_PATH;
if (!chrome) throw new Error('Supply the installed Chrome executable path');
const url = 'https://bowen12274bot.github.io/taica-2026-w09-dungeon-lab/';
const output = 'docs/evidence/deployment';
mkdirSync(output, { recursive: true });
const browser = await openPagesBrowser(chrome);
const evaluate = browser.evaluate;
const templates = Object.entries(KNIGHT_FRAMES).flatMap(([direction, frames]) => frames.map((rows, pose) => ({
  direction, pose, pixels: rows.flatMap((row, y) => [...row].flatMap((pixel, x) => {
    const color = KNIGHT_PALETTE[pixel];
    return color ? [[x, y, ...[1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16))]] : [];
  })),
})));
const install = () => evaluate(`(${installPixelProbe.toString()})(${JSON.stringify(templates)})`);
const sample = () => evaluate('window.__dungeonAcceptance.sample()');
const move = (keys, ms) => evaluate(`window.__dungeonAcceptance.move(${JSON.stringify(keys)},${ms})`);
const shot = name => browser.screenshot(`${output}/${name}.png`);
const records = [];
function record(name, data) { records.push({ name, pass: true, ...data }); console.log(name + ': PASS'); }
async function reset() {
  await browser.navigate(url);
  await browser.viewport(1440, 1000);
  await install();
  const state = await sample();
  assert.equal(state.x, 8); assert.equal(state.y, 56); assert.equal(state.direction, 'down');
}
function speed(result) { return Math.hypot(result.after.x - result.before.x, result.after.y - result.before.y) / (result.elapsed / 1000); }
try {
  await reset(); await shot('public-spawn'); record('public-load', await install());
  for (const [name, keys, direction] of [['WASD-right', ['D'], 'right'], ['arrows-up', ['ArrowUp'], 'up']]) {
    await reset(); const result = await move(keys, 600);
    assert.ok(Math.abs(speed(result) - 64) < 6, `${name} speed ${speed(result)}`);
    assert.ok(result.frames.filter(f => f.startsWith(direction)).length >= 3, name + ' three animation poses');
    assert.ok(result.prevented.every(Boolean));
    const stopped = await sample(); assert.equal(stopped.pose, 0); assert.equal(stopped.direction, direction);
    assert.ok(Math.abs(stopped.x - result.after.x) <= 1 && Math.abs(stopped.y - result.after.y) <= 1, 'release stops');
    record(name, { ...result, measuredSpeed: speed(result), stopped });
  }
  await reset(); const diagonal = await move(['W', 'D'], 450);
  assert.ok(Math.abs(speed(diagonal) - 64) < 6, 'diagonal normalization');
  assert.equal(diagonal.after.direction, 'up'); record('diagonal-speed', { ...diagonal, measuredSpeed: speed(diagonal) });
  await reset(); const opposed = await move(['W', 'S'], 300);
  assert.equal(opposed.before.x, opposed.after.x); assert.equal(opposed.before.y, opposed.after.y); record('opposite-keys', opposed);
  await reset(); const wall = await move(['S'], 900);
  assert.equal(wall.after.y, 76); assert.ok(wall.samples.slice(-10).every(s => s.y === 76 && s.pose === 0)); record('outer-wall-and-idle', wall); await shot('public-wall');
  await reset(); await move(['D'], 800); // Approach below the right-hand obstacle using only real input.
  const obstacle = await move(['W'], 900);
  assert.equal(obstacle.after.y, 36); assert.ok(obstacle.after.x >= 48 && obstacle.after.x <= 80); record('stone-obstacle', obstacle); await shot('public-obstacle');
  await reset(); const door = await move(['W'], 2400);
  assert.equal(door.after.y, -76); assert.equal(door.after.x, 8); record('closed-door', door); await shot('public-door');
  const slide = await move(['W', 'D'], 500);
  assert.equal(slide.after.y, -76); assert.ok(slide.after.x > slide.before.x + 15); assert.equal(slide.after.direction, 'right'); record('wall-slide', slide);
  const down = await move(['S'], 600);
  assert.ok(down.frames.filter(f=>f.startsWith('down')).length>=3);record('down-animation',down);
  await reset(); const left = await move(['A'], 1100);
  assert.ok(left.frames.filter(f=>f.startsWith('left')).length>=3);record('left-animation',left);
  await move(['W'], 500); // Approach below the left-hand obstacle.
  const leftObstacle = await move(['W'], 1200);
  assert.equal(leftObstacle.after.y, -12); assert.ok(leftObstacle.after.x > -80 && leftObstacle.after.x < -48); record('left-obstacle', leftObstacle);
  for (const [key,dx,dy] of [['ArrowLeft',-1,0],['ArrowRight',1,0],['ArrowDown',0,1]]) {
    await reset(); const r=await move([key],150);
    assert.equal(Math.sign(r.after.x-r.before.x),dx);assert.equal(Math.sign(r.after.y-r.before.y),dy);record(key,r);
  }
  await reset(); const beforeResize = await sample();
  for (const [name,width,height] of [['desktop',1440,1000],['narrow',390,844],['small',320,640]]) {
    await browser.viewport(width,height);
    const layout = await evaluate(`new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
      const c=document.querySelector('#game canvas'),p=document.querySelector('#map-viewport');
      resolve({url:location.href,canvas:c.getBoundingClientRect().toJSON(),container:p.getBoundingClientRect().toJSON(),native:[c.width,c.height],scrollWidth:document.documentElement.scrollWidth,imageRendering:getComputedStyle(c).imageRendering});
    })))`);
    const c=layout.canvas,p=layout.container;
    assert.ok(c.left>=p.left-1&&c.right<=p.right+1&&c.top>=p.top-1&&c.bottom<=p.bottom+1);
    assert.ok(Math.abs(c.width/c.height-20/12)<0.001);assert.ok(layout.scrollWidth<=width);
    assert.deepEqual(await sample(),beforeResize); assert.deepEqual(layout.native,[320,192]);
    record('resize-'+name,layout);await shot('public-'+name);
  }
  await reset();
  const consoleLog=browser.consoleLog;
  const network=browser.network;
  assert.equal(consoleLog.filter(e=>e.level==='error').length,0,'console errors');
  assert.equal(network.filter(e=>e.status>=400 || (e.failed && !e.canceled)).length,0,'failed resources');
  const details=await evaluate('({url:location.href,userAgent:navigator.userAgent,resources:performance.getEntriesByType("resource").map(r=>({url:r.name,transferSize:r.transferSize,duration:r.duration})),scripts:[...document.scripts].map(s=>s.src)})');
  assert.ok(details.resources.some(r=>r.url.endsWith('/assets/dungeon/tilemap_packed.png')));
  writeFileSync(`${output}/public-browser-checks.json`,JSON.stringify({checkedAt:new Date().toISOString(),url,passed:records.length,records,details,console:consoleLog,network},null,2)+'\n');
  console.log('Public URL acceptance completed');
} catch (error) {
  writeFileSync(`${output}/public-browser-partial.json`,JSON.stringify({url,records,error:String(error)},null,2)+'\n');
  throw error;
} finally { await browser.close(); }
