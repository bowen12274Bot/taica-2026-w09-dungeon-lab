import Phaser from 'phaser';
import './style.css';

// This empty canvas verifies engine startup only; no experiment is implemented.
const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 640,
  height: 360,
  backgroundColor: '#171b24',
  banner: false,
  audio: { noAudio: true },
  scene: [],
  callbacks: {
    postBoot: () => {
      const status = document.querySelector<HTMLParagraphElement>('#status');
      if (status) {
        status.textContent = '工程環境已就緒。等待第一輪正式需求。';
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => game.destroy(true));
}
