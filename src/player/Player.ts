import Phaser from 'phaser';
import { PLAYER_SPAWN, renderToWorld, worldToRender } from '../map/room.ts';
import { createKnightTexture, showPlayerState } from '../rendering/player-view.ts';
import { createMovementInput } from './input.ts';
import { motionState, PLAYER_BODY, type PlayerState } from './movement.ts';

export class Player {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  state: PlayerState = { world: { ...PLAYER_SPAWN.world }, facing: 'down', moving: false };

  constructor(scene: Phaser.Scene, blockers: Phaser.GameObjects.Zone[]) {
    const keyboard = scene.input.keyboard;
    if (!keyboard) throw new Error('Keyboard plugin required');
    const input = createMovementInput(keyboard);
    const spawn = worldToRender(this.state.world);
    this.sprite = scene.physics.add.sprite(spawn.x, spawn.y, createKnightTexture(scene), 0)
      .setOrigin(0.5, 0.75).setDepth(2);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(PLAYER_BODY.width, PLAYER_BODY.height).setOffset(3, 8);
    body.updateFromGameObject();
    scene.physics.add.collider(this.sprite, blockers);

    // PRE_UPDATE precedes Arcade's UPDATE, so release takes effect before integration.
    const beforeStep = () => {
      const velocity = input.velocity();
      body.setVelocity(velocity.x, velocity.y);
    };
    const afterStep = () => {
      this.state = motionState(this.state.world, renderToWorld(body.center), this.state.facing);
      showPlayerState(this.sprite, this.state);
    };
    const stop = () => {
      input.reset();
      body.stop();
      this.state.moving = false;
      showPlayerState(this.sprite, this.state);
    };
    scene.events.on(Phaser.Scenes.Events.PRE_UPDATE, beforeStep);
    scene.physics.world.on(Phaser.Physics.Arcade.Events.WORLD_STEP, afterStep);
    scene.game.events.on(Phaser.Core.Events.BLUR, stop);
    scene.game.events.on(Phaser.Core.Events.HIDDEN, stop);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.events.off(Phaser.Scenes.Events.PRE_UPDATE, beforeStep);
      scene.physics.world.off(Phaser.Physics.Arcade.Events.WORLD_STEP, afterStep);
      scene.game.events.off(Phaser.Core.Events.BLUR, stop);
      scene.game.events.off(Phaser.Core.Events.HIDDEN, stop);
    });
  }
}
