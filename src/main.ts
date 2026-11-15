import Phaser from 'phaser';
import { ROOM } from './map/room.ts';
import { fitRoomScale } from './rendering/fit-room.ts';
import { RoomScene } from './scenes/RoomScene.ts';
import './style.css';

const viewport = document.querySelector<HTMLElement>('#map-viewport');
if (!viewport) throw new Error('Missing map viewport');

const resize = () => {
  const scale = fitRoomScale(viewport.clientWidth, viewport.clientHeight);
  if (scale > 0) game.scale.setZoom(scale);
};
const observer = new ResizeObserver(resize);

export const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: ROOM.width,
  height: ROOM.height,
  backgroundColor: '#171c25',
  pixelArt: true,
  roundPixels: true,
  banner: false,
  audio: { noAudio: true },
  input: { keyboard: true, mouse: false, touch: false, gamepad: false },
  physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, fixedStep: true, fps: 60 } },
  scale: { mode: Phaser.Scale.NONE, autoRound: false },
  scene: [RoomScene],
  callbacks: {
    postBoot: () => {
      observer.observe(viewport);
      resize();
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    observer.disconnect();
    game.destroy(true);
  });
}
