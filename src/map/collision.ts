import { ROOM, ROOM_CELLS } from './room.ts';

// Join touching blocked cells into rectangles. Individual tile bodies can catch a
// sliding character on internal seams; these rectangles cover exactly the same cells.
export function roomCollisionRects() {
  const rects: { col: number; row: number; columns: number; rows: number }[] = [];
  for (let row = 0; row < ROOM.rows; row++) {
    let col = 0;
    while (col < ROOM.columns) {
      if (ROOM_CELLS[row]?.[col]?.walkable) { col++; continue; }
      const start = col;
      while (col < ROOM.columns && !ROOM_CELLS[row]?.[col]?.walkable) col++;
      const columns = col - start;
      const above = rects.find(rect => rect.col === start && rect.columns === columns && rect.row + rect.rows === row);
      if (above) above.rows++;
      else rects.push({ col: start, row, columns, rows: 1 });
    }
  }
  return rects;
}
