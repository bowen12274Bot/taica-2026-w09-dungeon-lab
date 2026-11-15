import { ROOM } from '../map/room.ts';

/** Prefer 3×, 2×, 1×; use a fractional scale only below the native size. */
export function fitRoomScale(availableWidth: number, availableHeight: number): number {
  const fit = Math.min(3, availableWidth / ROOM.width, availableHeight / ROOM.height);
  return fit >= 1 ? Math.floor(fit) : Math.max(0, fit);
}
