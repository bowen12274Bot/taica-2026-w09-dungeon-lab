import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import assert from 'node:assert/strict';

// Usage: node scripts/verify-browser.mjs PAGE_ID [ORCA_EXECUTABLE]
// Requires the existing Vite server and an Orca browser tab at its URL.
const page = process.argv[2];
const cli = process.argv[3] || process.env.ORCA_CLI_COMMAND || 'orca';
if (!page) throw new Error('Supply the Orca development page ID');
const output = 'docs/evidence/round-02';
mkdirSync(output, { recursive: true });
function call(...args) {
  const proc = spawnSync(cli, [...args, '--json'], { encoding: 'utf8', timeout: 60000, windowsHide: true });
  if (proc.error) throw proc.error;
  const response = JSON.parse(proc.stdout);
  if (!response.ok) throw new Error(JSON.stringify(response.error));
  return response.result;
}
const evaluate = expression => JSON.parse(call('eval', '--page', page, '--expression', expression).result);
const loadGame = `const {game}=await import([...document.scripts].find(s=>s.src.includes('/src/main.ts')).src); const scene=game.scene.getScene('room'); const player=scene.player;`;
const shot = name => copyFileSync(call('screenshot', '--page', page).path, `${output}/${name}.png`);
call('tab', 'switch', '--page', page);
call('reload', '--page', page);
call('capture', 'start', '--page', page);
const gameplay = evaluate(readFileSync('tests/browser-round02.js', 'utf8'));
writeFileSync(`${output}/gameplay-checks.json`, JSON.stringify(gameplay, null, 2) + '\n');
console.log(`${gameplay.passed} deterministic Phaser integration checks passed`);

const live = evaluate(`(async()=>{${loadGame}
  const key=(type)=>window.dispatchEvent(new KeyboardEvent(type,{key:'d',code:'KeyD',keyCode:68,which:68,bubbles:true,cancelable:true}));
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const initial={...player.state.world}; const frames=new Set();
  const sample=()=>frames.add(player.sprite.frame.name); scene.events.on('postupdate',sample);
  const start=performance.now(); key('keydown'); await wait(500); key('keyup');
  const elapsed=performance.now()-start; const after={...player.state.world}; await wait(160);
  scene.events.off('postupdate',sample);
  return {initial,after,stopped:{...player.state.world},elapsed,frames:[...frames],moving:player.state.moving,playing:player.sprite.anims.isPlaying};
})()`);
assert.ok(live.after.x > live.initial.x + 15 && live.after.x < live.initial.x + 48, 'real-time RAF movement');
assert.deepEqual(live.after, live.stopped, 'real-time release stop');
assert.ok(live.frames.length >= 3 && !live.playing && !live.moving, 'real-time animation and idle');
console.log('Live RAF keyboard movement, frame playback and release: PASS');
const sizes = [['desktop',1440,1000],['compact',1024,768],['narrow',390,844],['small',320,640],['landscape',844,390]];
const layouts = [];
for (const [name,width,height] of sizes) {
  call('viewport','--page',page,'--width',String(width),'--height',String(height),'--scale','1');
  const state = evaluate(`(async()=>{${loadGame}
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    const canvas=game.canvas, container=document.querySelector('#map-viewport');
    return {world:player.state.world,body:[player.sprite.body.width,player.sprite.body.height],camera:[scene.cameras.main.scrollX,scene.cameras.main.scrollY,scene.cameras.main.zoom],
      canvas:canvas.getBoundingClientRect().toJSON(),container:container.getBoundingClientRect().toJSON(),native:[canvas.width,canvas.height],count:document.querySelectorAll('#game canvas').length,
      imageRendering:getComputedStyle(canvas).imageRendering,scrollWidth:document.documentElement.scrollWidth,ready:document.querySelector('#status').hidden};})()`);
  assert.deepEqual(state.world,live.stopped,'resize preserves world coordinates');
  assert.deepEqual(state.body,[10,8]); assert.deepEqual(state.camera,[0,0,1]);
  assert.deepEqual(state.native,[320,192]); assert.equal(state.count,1); assert.equal(state.ready,true);
  assert.equal(state.imageRendering,'pixelated'); assert.ok(state.scrollWidth<=width);
  const c=state.canvas,p=state.container;
  assert.ok(c.left>=p.left-1 && c.right<=p.right+1 && c.top>=p.top-1 && c.bottom<=p.bottom+1,'canvas fits');
  assert.ok(Math.abs(c.width/c.height-20/12)<0.001,'aspect ratio');
  layouts.push({name,width,height,...state}); shot(name);
  // Exercise real collisions again at every CSS scale, using the same body and actual game step.
  const collision=evaluate(`(async()=>{${loadGame}
    game.loop.stop();
    try {
      const b=player.sprite.body;b.reset(299,144);player.state={world:{x:139,y:48},facing:'down',moving:false};scene.physics.world._elapsed=0;
      const key=type=>window.dispatchEvent(new KeyboardEvent(type,{key:'d',code:'KeyD',keyCode:68,which:68,bubbles:true,cancelable:true}));
      key('keydown');for(let i=0;i<60;i++)game.step(game.loop.time+i*1000/60,1000/60);key('keyup');
      const result={world:{...player.state.world},moving:player.state.moving};
      b.reset(${live.stopped.x}+160,${live.stopped.y}+96);player.state={world:${JSON.stringify(live.stopped)},facing:'right',moving:false};
      game.step(game.loop.time+1100,1000/60);return result;
    } finally {game.loop.start(game.step.bind(game));}
  })()`);
  assert.equal(collision.world.x,139); assert.equal(collision.world.y,48); assert.equal(collision.moving,false);
  console.log(`T16 ${name}: coordinates, collision, layout PASS`);
}
call('reload','--page',page);
const reload=evaluate(`(async()=>{${loadGame}return {state:player.state,playing:player.sprite.anims.isPlaying,count:document.querySelectorAll('#game canvas').length}})()`);
assert.deepEqual(reload.state,{world:{x:8,y:56},facing:'down',moving:false});assert.equal(reload.playing,false);assert.equal(reload.count,1);
call('viewport','--page',page,'--width','1440','--height','1000','--scale','1');
evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(true))))');
shot('spawn');
const consoleLog=call('console','--page',page,'--limit','100');
const network=call('network','--page',page,'--limit','100');
assert.equal(consoleLog.entries.filter(e=>e.level==='error').length,0,'browser errors');
assert.equal(network.entries.filter(e=>e.status>=400).length,0,'network errors');
writeFileSync(`${output}/browser-checks.json`,JSON.stringify({live,layouts,reload,console:consoleLog,network},null,2)+'\n');
console.log('T17 reload spawn, console and requests: PASS');
