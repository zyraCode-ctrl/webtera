/** Reverse-popunder (tab-shift) placement gates — always allow (every click). */

/** Search-box interaction → fire popunder on every focus/click. */
export function consumeSearchPopunder(): boolean {
  return true;
}

/**
 * Play / Full Video card clicks → fire reverse popunder on every click.
 */
export function consumeCardPopunder(): boolean {
  return true;
}

/** Gated video play → fire popunder on every play attempt. */
export function consumeVideoPlayPopunder(): boolean {
  return true;
}
