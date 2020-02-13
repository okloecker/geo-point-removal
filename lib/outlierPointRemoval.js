const geo = require("node-geo-distance");
const { HAVERSINE, VINCENTY } = require("./constants");
const compress = require("./compress");

/**
 * Outlier Point Removal module.
 * @module lib/outlierPointRemoval
 */

/**
 * Algorithm for detecting far away points to delete.
 * Only checks distance to previous point, not any earlier point.
 * @param {array} track - array of location points
 * @param {object} options - object of options
 * @param {number} threshold - value in metres, any point which is further away than that to the previous point will not be returned
 * @param {boolean} keepLastPoint - if true, the last location in array will always be returned, even if further away to last but one than threshold
 * @param {function} func - distance function, either 'haversine' or 'vincenty'
 */
function outlierPointRemoval(
  track,
  {
    threshold = 50 /*metre*/,
    distanceFunction = "haversine",
    keepLastPoint = false,
    path = ""
  } = {}
) {
  if (![HAVERSINE, VINCENTY].includes(distanceFunction))
    throw `Unknown distance function ${distanceFunction}, expected ${HAVERSINE} or ${VINCENTY}`;
  return compress(track, {
    keepLastPoint,
    path,
    compressFunction: (ptPrev, ptCurr, ptNext) => {
      const distance =
        distanceFunction === "vincenty" ? geo.vincentySync : geo.haversineSync;
      const distCurrToPrev = ptNext ? distance(ptCurr, ptNext) : 0;
      const distPrevToNext = ptNext ? distance(ptPrev, ptNext) : 0;
      return !(distCurrToPrev > threshold && distPrevToNext <= threshold);
    }
  });
}

module.exports = outlierPointRemoval;
