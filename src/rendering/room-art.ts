import type { Cell, Visual } from '../map/room.ts';

// Original Kenney Tiny Dungeon packed sheet: 12 columns, 16 px frames, no gaps.
export const DUNGEON_TEXTURE = 'tiny-dungeon';
export const DUNGEON_SHEET = 'assets/dungeon/tilemap_packed.png';

const styles: Record<Visual, { frame: number; tint: number }> = {
  // Tint the original floor warm gray-brown; the scene adds fine slab joints.
  'stone-floor': { frame: 48, tint: 0x839de0 },
  'stone-wall': { frame: 14, tint: 0xffffff },
  'stone-block': { frame: 40, tint: 0xe0e5ef },
  'closed-door': { frame: 46, tint: 0xffffff },
};

export function tileArt(cell: Cell): { frame: number; tint: number } {
  const style = styles[cell.visual];
  if (cell.visual === 'stone-floor' && (cell.col * 7 + cell.row * 11) % 23 === 0) {
    return { ...style, frame: 49 };
  }
  if (cell.visual === 'closed-door') {
    return { ...style, frame: cell.col === 9 ? 46 : 47 };
  }
  return style;
}
