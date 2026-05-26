/** Tab session flag: show the paginated post list on `/go` after user opens a post/help from this tab. */
export const GO_FULL_LIST_STORAGE_KEY = "webtera_go_allow_full_list";

export function unlockGoFullListForSession() {
  try {
    sessionStorage.setItem(GO_FULL_LIST_STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function resetGoFullListUnlock() {
  try {
    sessionStorage.removeItem(GO_FULL_LIST_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
