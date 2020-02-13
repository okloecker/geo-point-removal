const { fieldOf, objectPath } = require("./objectPath");

/**
 * Track compression module.
 * Internal usage for outlierRemoval and NearPointRemoval.
 * @module lib/compress
 */

/**
 * Filter track by calling functions that provide the filtering algorithm.
 * Identifies for each location the previous, current and next locations for subordinate function.
 * @param {array} track - locations
 * @param {Object} options - options for filtering
 * @param {boolean} options.keepLastPoint - if true, last location in track will never be filtered out (default: true)
 * @param {function} options.compressFunction - will be called with arguments prevPoint, currPoint and nextPoint
 * @param {string[]} path - object path to identify object which contains the location
 * @param {string} path[].latitude - WGS84 latitude
 * @param {string} path[].longitude - WGS84 longitude
 */
function compress(
  track,
  { keepLastPoint = true, compressFunction, path = [] } = {}
) {
  if (!track || track.length === 0) return track;

  return track.filter((pt, i, arr) => {
    if (i === 0) return true; // track with just point cannot be compressed
    if (keepLastPoint && i === arr.length - 1) return true; // never remove last

    const p0 = objectPath(path, arr[i - 1]);
    const p1 = objectPath(path, pt);
    const p2 = i < arr.length - 1 ? objectPath(path, arr[i + 1]) : undefined;

    const ptCurr = p1;
    const ptPrev = p0;
    const ptNext = p2 ? p2 : undefined;

    // check that distance between previous and next is normal but current is far away from previous
    return compressFunction(ptPrev, ptCurr, ptNext);
  });
}

module.exports = compress;
