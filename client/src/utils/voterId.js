const STORAGE_KEY = 'neighbouralert_voter_id';

export function getVoterId() {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
