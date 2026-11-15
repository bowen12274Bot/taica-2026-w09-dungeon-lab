import type { Facing } from '../player/movement.ts';

// Original, code-authored 16px knight. Each direction has three distinct limb poses.
// '.' transparent; dark outline, steel armour, gold trim, red cloth, skin and visor.
export const KNIGHT_PALETTE: Record<string, string> = {
  o: '#25303e', s: '#788da6', h: '#d3dfeb', g: '#c8a65d',
  r: '#9f4650', f: '#e5b78e', v: '#17202d',
};
const heads: Record<'down' | 'up' | 'right', string[]> = {
  down: [
    '......oooo......', '.....oshhso.....', '....oshhhsho....',
    '....osssssso....', '....ovvsvvvo....', '.....ofgfo......',
    '.....ooroo......',
  ],
  up: [
    '......oooo......', '.....oshhso.....', '....oshhhsho....',
    '....oshhhsho....', '....ossssso.....', '.....osso.......',
    '.....ooroo......',
  ],
  right: [
    '......oooo......', '.....oshhso.....', '.....oshhhso....',
    '.....osssvvo....', '.....osvvvfo....', '......osffo.....',
    '......orro......',
  ],
};
// Upper bodies stay anchored; arms and boots change silhouette in each pose.
const legs: Record<'down' | 'up' | 'right', string[][]> = {
  down: [
    ['....oshhhso.....','...ososhhsoso...','...ofohggsofo...','....oossssoo....','.....ososo......','.....ososo......','.....oo.oo......'],
    ['...osshhhso.....','...ofohhssoso...','....oohggsofo...','.....ossssoo....','.....os.oso.....','....oso..oo.....','....ooo.........'],
    ['....oshhhsso....','...ososhhsofo...','...ofohggsoo....','....oosssso.....','....oso.so......','....oo..oso.....','........ooo.....'],
  ],
  up: [
    ['....osrrrso.....','...ososrrsoso...','...ofosrrsofo...','....oosrrsoo....','.....ososo......','.....ososo......','.....oo.oo......'],
    ['...ossrrrso.....','...ofosrrsoso...','....oosrrsofo...','.....osrrsoo....','.....os.oso.....','....oso..oo.....','....ooo.........'],
    ['....osrrrsso....','...ososrrsofo...','...ofosrrsoo....','....oosrrso.....','....oso.so......','....oo..oso.....','........ooo.....'],
  ],
  right: [
    ['.....orsso......','.....orshso.....','.....orssfo.....','.....oggsoo.....','......osso......','......osso......','......oooo......'],
    ['.....orsso......','.....orshso.....','.....orssofo....','.....oggsoo.....','.....osooso.....','....oso..oso....','....ooo..ooo....'],
    ['.....orsso......','.....orohso.....','.....ofosso.....','.....oggsoo.....','......osso......','.......oso......','.......oooo.....'],
  ],
};

function makeFrames(direction: 'down' | 'up' | 'right'): string[][] {
  return legs[direction].map(pose => [
    '................', ...heads[direction], ...pose, '................',
  ].map(row => row.padEnd(16, '.')));
}
export const KNIGHT_FRAMES: Record<Facing, string[][]> = {
  down: makeFrames('down'), up: makeFrames('up'), right: makeFrames('right'),
  left: makeFrames('right').map(frame => frame.map(row => [...row].reverse().join(''))),
};
export const KNIGHT_DIRECTIONS: Facing[] = ['down', 'up', 'left', 'right'];
