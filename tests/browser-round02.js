// Run through Orca eval, on the Vite development page; never imported by the app.
(async () => {
  const { game } = await import([...document.scripts].find(s => s.src.includes('/src/main.ts')).src);
  const scene = game.scene.getScene('room');
  const player = scene.player;
  const sprite = player.sprite;
  const body = sprite.body;
  const world = scene.physics.world;
  const records = [];
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const near = (a, b, message) => assert(Math.abs(a - b) < 1e-6, `${message}: ${a} != ${b}`);
  const snapshot = () => ({ ...player.state, world: { ...player.state.world }, frame: sprite.frame.name,
    animation: sprite.anims.currentAnim?.key, playing: sprite.anims.isPlaying });
  const keys = { W: 87, A: 65, S: 83, D: 68, ArrowUp: 38, ArrowDown: 40, ArrowLeft: 37, ArrowRight: 39 };
  let held = [];
  function key(type, name) {
    const event = new KeyboardEvent(type, { key: name, code: name.length === 1 ? `Key${name}` : name,
      keyCode: keys[name], which: keys[name], bubbles: true, cancelable: true });
    window.dispatchEvent(event);
    return event.defaultPrevented;
  }
  function hold(names) {
    for (const name of held) key('keyup', name);
    held = names;
    return names.map(name => key('keydown', name));
  }
  function reset(x = 8, y = 56) {
    hold([]);
    body.reset(x + 160, y + 96);
    player.state = { world: { x, y }, facing: 'down', moving: false };
    world._elapsed = 0;
  }
  let time = game.loop.time;
  const blockers = [...world.staticBodies];
  function checkBody() {
    near(body.center.x, sprite.x, 'sprite/collider X');
    near(body.center.y, sprite.y, 'sprite/collider Y');
    near(player.state.world.x, body.center.x - 160, 'world X');
    near(player.state.world.y, body.center.y - 96, 'world Y');
    assert(body.width === 10 && body.height === 8, '10×8 collision body');
    for (const block of blockers) {
      assert(!(body.right > block.left + 1e-7 && body.left < block.right - 1e-7 &&
        body.bottom > block.top + 1e-7 && body.top < block.bottom - 1e-7),
      `overlap at ${JSON.stringify(player.state.world)} vs ${block.x},${block.y}`);
    }
  }
  function advance(frames, fps = 60) {
    const seen = new Set();
    for (let i = 0; i < frames; i++) {
      time += 1000 / fps;
      game.step(time, 1000 / fps);
      checkBody();
      seen.add(sprite.frame.name);
    }
    return [...seen];
  }
  function record(id, details = {}) { records.push({ id, pass: true, ...details, result: snapshot() }); }
  game.loop.stop();
  try {
    near(player.state.world.x, 8, 'initial spawn X'); near(player.state.world.y, 56, 'initial spawn Y');
    assert(!player.state.moving && player.state.facing === 'down', 'initial idle down');
    assert(blockers.reduce((area, b) => area + b.width * b.height, 0) === 68 * 16 * 16, 'all map blockers');
    assert(document.querySelectorAll('#game canvas').length === 1, 'one game canvas');
    record('initialization');
    for (const [id, name, dx, dy, facing] of [
      ['T01', 'W', 0, -12.8, 'up'], ['T02', 'A', -12.8, 0, 'left'],
      ['T03', 'S', 0, 12.8, 'down'], ['T04', 'D', 12.8, 0, 'right'],
    ]) {
      reset(0, 0); hold([name]); advance(12);
      near(player.state.world.x, dx, id); near(player.state.world.y, dy, id);
      assert(player.state.facing === facing && player.state.moving, id + ' animation'); record(id);
    }
    reset(-120, 56); hold(['W', 'D']); advance(60);
    near(Math.hypot(player.state.world.x + 120, player.state.world.y - 56), 64, 'diagonal speed');
    assert(player.state.facing === 'up', 'diagonal tie'); record('T05');
    reset(); hold(['W', 'S']); advance(30); near(player.state.world.y, 56, 'opposing W/S'); record('T06');
    hold(['W', 'S', 'D']); advance(12); near(player.state.world.x, 20.8, 'other axis continues');
    hold(['A', 'D']); const x = player.state.world.x; advance(12); near(player.state.world.x, x, 'opposing A/D');
    record('opposing-axes');
    hold(['D']); advance(10); hold([]); const stopped = { ...player.state.world }; advance(30);
    near(player.state.world.x, stopped.x, 'release stop'); assert(!player.state.moving && !sprite.anims.isPlaying, 'idle'); record('T07');
    for (const [name, x, y, expectedX, expectedY] of [
      ['A', -120, 56, -139, 56], ['D', 120, 56, 139, 56], ['W', -120, -60, -120, -76], ['S', 8, 56, 8, 76],
    ]) {
      reset(x, y); hold([name]); advance(180);
      near(player.state.world.x, expectedX, 'wall X'); near(player.state.world.y, expectedY, 'wall Y');
      assert(!player.state.moving && !sprite.anims.isPlaying, 'pushing wall idle'); record('T08-' + name);
    }
    for (const [bx, by] of [[-80, -48], [48, 0]]) {
      for (const [name, x, y, ex, ey] of [
        ['D', bx - 15, by + 16, bx - 5, by + 16], ['A', bx + 47, by + 16, bx + 37, by + 16],
        ['S', bx + 16, by - 14, bx + 16, by - 4], ['W', bx + 16, by + 46, bx + 16, by + 36],
      ]) {
        reset(x, y); hold([name]); advance(120);
        near(player.state.world.x, ex, 'block X'); near(player.state.world.y, ey, 'block Y');
        assert(!player.state.moving, 'block idle'); record(`T09-${bx}-${name}`);
      }
    }
    reset(139, 48); hold(['W', 'D']); advance(60);
    near(player.state.world.x, 139, 'slide X'); near(player.state.world.y, 48 - 64 / Math.sqrt(2), 'slide Y');
    assert(player.state.facing === 'up' && sprite.anims.isPlaying, 'slide animation'); record('T10');
    reset(8, -76); hold(['W', 'D']); advance(30);
    near(player.state.world.y, -76, 'horizontal slide'); assert(player.state.facing === 'right', 'actual slide facing'); record('T10-horizontal');
    for (const x of [-8, 8]) {
      reset(x, -60); hold(['W']); advance(120); near(player.state.world.y, -76, 'closed door'); record('T11-' + x);
    }
    reset(8, 56); hold(['A']); advance(20); assert(player.state.world.x < 0, 'negative X'); record('T12');
    reset(8, 56); hold(['W']); advance(60); assert(player.state.world.y < 0, 'negative Y'); record('T13');
    for (const [name, facing, x, y] of [['W','up',8,56],['S','down',0,-60],['A','left',0,56],['D','right',0,56]]) {
      reset(x,y); hold([name]); const frames = advance(60);
      assert(frames.length === 3 && sprite.anims.currentAnim.key === `walk-${facing}`, 'three animated poses ' + facing);
      assert(sprite.anims.currentAnim.frameRate === 8 && sprite.anims.currentAnim.repeat === -1, '8 FPS loop');
      record('T14-' + facing, { frames });
      hold([]); advance(2); assert(!sprite.anims.isPlaying && !player.state.moving && player.state.facing === facing, 'directional idle'); record('T15-' + facing);
    }
    const distances = [];
    for (const fps of [30, 60, 120]) {
      reset(0,56); hold(['D']); advance(fps, fps); near(player.state.world.x, 64, 'FPS distance'); distances.push({ fps, distance: player.state.world.x });
    }
    record('frame-rate-independence', { distances });
    for (const names of [['W','A'],['W','D'],['S','A'],['S','D'],['ArrowUp'],['ArrowDown'],['ArrowLeft'],['ArrowRight'],['W','ArrowRight']]) {
      reset(0,0); const prevented = hold(names); advance(12);
      near(Math.hypot(player.state.world.x, player.state.world.y),12.8,'eight-way / arrows / mixed');
      assert(prevented.every(Boolean), 'captured movement keys prevent scrolling'); record('keys-' + names.join('+'));
    }
    for (const [x,y,names] of [[-139,-76,['W','A']],[139,-76,['W','D']],[-139,76,['S','A']],[139,76,['S','D']]]) {
      reset(x,y); hold(names); advance(180); near(player.state.world.x,x,'corner X'); near(player.state.world.y,y,'corner Y');
      assert(!player.state.moving,'corner idle'); hold(names.map(k=>({W:'S',S:'W',A:'D',D:'A'})[k])); advance(12);
      assert(player.state.moving,'leave corner'); record('corner-' + names.join('+'));
    }
    // Sweep diagonals past each obstacle corner; every intermediate body must remain outside blockers.
    for (const [bx,by] of [[-80,-48],[48,0]]) for (const [x,y,names] of [
      [bx-12,by-12,['S','D']],[bx+44,by-12,['S','A']],[bx-12,by+44,['W','D']],[bx+44,by+44,['W','A']],
    ]) { reset(x,y); hold(names); advance(120); record('obstacle-corner-' + [bx,x,y].join(',')); }
    reset(); hold(['D']); advance(10); game.events.emit('blur'); const before = player.state.world.x; advance(30);
    near(player.state.world.x,before,'blur clears input'); record('blur');
    reset(); advance(2);
    return { passed: records.length, records, userAgent: navigator.userAgent };
  } finally { hold([]); game.loop.start(game.step.bind(game)); }
})()
