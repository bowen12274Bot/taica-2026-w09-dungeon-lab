/** Approved Round 01 layout. Grid indices start at the upper-left corner. */
export const ROOM_LAYOUT = [
  '#########DD#########',
  '#..................#',
  '#..................#',
  '#....XX............#',
  '#....XX............#',
  '#..................#',
  '#............XX....#',
  '#............XX....#',
  '#..................#',
  '#.........S........#',
  '#..................#',
  '####################',
] as const;

export const ROOM = {
  columns: 20, rows: 12, tileSize: 16, width: 320, height: 192,
} as const;

export const TERRAIN = {
  floor: { walkable: true, visual: 'stone-floor' },
  wall: { walkable: false, visual: 'stone-wall' },
  obstacle: { walkable: false, visual: 'stone-block' },
  door: { walkable: false, visual: 'closed-door' },
} as const;

export type Terrain = keyof typeof TERRAIN;
export type Visual = (typeof TERRAIN)[Terrain]['visual'];
export type Point = Readonly<{ x: number; y: number }>;
export type GridPosition = Readonly<{ col: number; row: number }>;
export type Cell = GridPosition & Readonly<{
  terrain: Terrain;
  walkable: boolean;
  visual: Visual;
}>;

const symbolTerrain: Readonly<Record<string, Terrain>> = {
  '.': 'floor', S: 'floor', '#': 'wall', X: 'obstacle', D: 'door',
};

export const ROOM_CELLS: readonly (readonly Cell[])[] = ROOM_LAYOUT.map((line, row) =>
  Array.from(line, (symbol, col): Cell => {
    const terrain = symbolTerrain[symbol];
    if (!terrain) throw new Error(`Unknown terrain at ${col}, ${row}`);
    return { col, row, terrain, ...TERRAIN[terrain] };
  }),
);

export function getCell(col: number, row: number): Cell | undefined {
  if (!Number.isInteger(col) || !Number.isInteger(row)) return undefined;
  return ROOM_CELLS[row]?.[col];
}

export function isWalkable(col: number, row: number): boolean {
  return getCell(col, row)?.walkable ?? false;
}

/** World (0, 0) is the room's geometric center; positions stay continuous. */
export function gridToWorld(col: number, row: number): Point {
  return {
    x: (col + 0.5) * ROOM.tileSize - ROOM.width / 2,
    y: (row + 0.5) * ROOM.tileSize - ROOM.height / 2,
  };
}

/** Bounds are half-open: [-160, 160) × [-96, 96). */
export function worldToGrid({ x, y }: Point): GridPosition | undefined {
  const col = Math.floor((x + ROOM.width / 2) / ROOM.tileSize);
  const row = Math.floor((y + ROOM.height / 2) / ROOM.tileSize);
  return getCell(col, row) ? { col, row } : undefined;
}

/** Phaser draws in positive coordinates; this offset never depends on zoom. */
export function worldToRender({ x, y }: Point): Point {
  return { x: x + ROOM.width / 2, y: y + ROOM.height / 2 };
}

export function renderToWorld({ x, y }: Point): Point {
  return { x: x - ROOM.width / 2, y: y - ROOM.height / 2 };
}

export const PLAYER_SPAWN = {
  grid: { col: 10, row: 9 },
  world: gridToWorld(10, 9),
} as const;
