
function compress(
  track,
  { keepLastPoint = true, compressFunction, path } = {}
) {
  if (!track || track.length === 0) return track;

  if(path && !track[0][path]) throw `No path "${path}"in object`;

  return track
    .filter((pt, i, arr) => {
      if (i === 0) return true; // track with just point cannot be compressed
      if (keepLastPoint && i === arr.length - 1) return true; // never remove last

      const p0 = path ? arr[i - 1][path] : arr[i - 1];
      const p1 = path ? pt[path] : pt;
      const p2 =
        i < arr.length - 1 ? (path ? arr[i + 1][path] : arr[i + 1]) : undefined;

      const ptCurr = p1;
      const ptPrev = p0;
      const ptNext = p2 ? p2 : undefined;

      // check that distance between previous and next is normal but current is far away from previous
      return compressFunction(ptPrev, ptCurr, ptNext);
    })
}

module.exports = compress;

function compress1(
  track,
  { keepLastPoint = true, compressFunction, path } = {}
) {
  if (!track || track.length === 0) return track;

  return track
    .filter((pt, i, arr) => {
      if (i === 0) return true; // track with just point cannot be compressed
      if (keepLastPoint && i === arr.length - 1) return true; // never remove last

      const ptCurr = pt;
      const ptPrev = arr[i - 1];
      const ptNext =
        i < arr.length - 1
          ? arr[i + 1]
          : undefined;

      // check that distance between previous and next is normal but current is far away from previous
      return compressFunction(ptPrev, ptCurr, ptNext);
    });
}
