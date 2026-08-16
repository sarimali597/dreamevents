// Central manifest of event imagery staged in /public/events.
// These are real photos (venues, catering, photography, decor, celebrations)
// saved by the project owner. Per project direction they are reused freely
// across the UI wherever an image is needed — topical match is not required.
const EVENT_IMAGES = Array.from({ length: 13 }, (_, i) => `/events/event-${i + 1}.jpg`);

/** Deterministic pick so a given key always maps to the same image (stable UI). */
export function eventImage(seed = 0) {
  const n = Number(seed) || 0;
  return EVENT_IMAGES[Math.abs(Math.trunc(n)) % EVENT_IMAGES.length];
}

/** Random-ish pick from a string key (e.g. a seller id) for variety. */
export function eventImageFromKey(key = '') {
  let h = 0;
  for (let i = 0; i < String(key).length; i++) h = (h * 31 + String(key).charCodeAt(i)) | 0;
  return eventImage(h);
}

export default EVENT_IMAGES;
