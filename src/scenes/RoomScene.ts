import Phaser from 'phaser';
import { ROOM, ROOM_CELLS, getCell, gridToWorld, worldToRender } from '../map/room.ts';
import { DUNGEON_SHEET, DUNGEON_TEXTURE, tileArt } from '../rendering/room-art.ts';
import { Player } from '../player/Player.ts';
import { roomCollisionRects } from '../map/collision.ts';

export class RoomScene extends Phaser.Scene {
  player?: Player;
  constructor() {
    super('room');
  }

  preload(): void {
    this.load.on('loaderror', () => {
      const status = document.querySelector<HTMLElement>('#status');
      if (status) {
        status.textContent = '地圖素材載入失敗，請重新整理頁面。';
        status.hidden = false;
      }
    });
    this.load.spritesheet(DUNGEON_TEXTURE, `${import.meta.env.BASE_URL}${DUNGEON_SHEET}`, {
      frameWidth: ROOM.tileSize,
      frameHeight: ROOM.tileSize,
    });
  }

  create(): void {
    if (!this.textures.exists(DUNGEON_TEXTURE)) return;
    const size = ROOM.tileSize;
    const edges = this.add.graphics().setDepth(1);
    const blockers: Phaser.GameObjects.Zone[] = [];

    for (const row of ROOM_CELLS) {
      for (const cell of row) {
        const center = worldToRender(gridToWorld(cell.col, cell.row));
        const art = tileArt(cell);
        this.add.image(center.x, center.y, DUNGEON_TEXTURE, art.frame).setTint(art.tint);
        const x = cell.col * size;
        const y = cell.row * size;

        if (cell.terrain === 'floor') {
          // Fine inset joints distinguish flat stone slabs from raised masonry.
          edges.fillStyle(0x807365);
          edges.fillRect(x, y, size - 1, 1);
          edges.fillStyle(0x514a43);
          edges.fillRect(x, y + size - 1, size, 1);
          edges.fillRect(x + size - 1, y, 1, size);
        }

        // Raised stone edges stay inside their blocked cells.
        if (cell.terrain === 'wall' || cell.terrain === 'obstacle') {
          const same = (col: number, row: number) => getCell(col, row)?.terrain === cell.terrain;
          edges.fillStyle(0xb2c0d2);
          if (!same(cell.col, cell.row - 1)) edges.fillRect(x, y, size, 2);
          if (!same(cell.col - 1, cell.row)) edges.fillRect(x, y, 2, size);
          edges.fillStyle(0x303744);
          if (!same(cell.col, cell.row + 1)) edges.fillRect(x, y + size - 2, size, 2);
          if (!same(cell.col + 1, cell.row)) edges.fillRect(x + size - 2, y, 2, size);
        }
      }
    }

    for (const rect of roomCollisionRects()) {
      const center = worldToRender(gridToWorld(
        rect.col + (rect.columns - 1) / 2, rect.row + (rect.rows - 1) / 2,
      ));
      const blocker = this.add.zone(center.x, center.y, rect.columns * size, rect.rows * size);
      this.physics.add.existing(blocker, true);
      blockers.push(blocker);
    }
    this.player = new Player(this, blockers);
    this.cameras.main.setScroll(0, 0).setZoom(1);
    const status = document.querySelector<HTMLElement>('#status');
    if (status) status.hidden = true;
    this.game.canvas.setAttribute('role', 'img');
    this.game.canvas.setAttribute('aria-label', '20 × 12 格地下城房間：四周石牆、上方中央封閉雙門，以及兩組石製障礙。');
  }
}
