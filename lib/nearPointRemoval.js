const geo = require("node-geo-distance");
const debug = require("debug")("geo-point-removal");
const {HAVERSINE, VINCENTY} = require ("./constants");
const compress = require("./compress");

/**
 * Near Point Removal module.
 * @module lib/nearPointRemoval
 */

/**
 * Algorithm for detecting close points to compress.
 * Only checks distance to previous point, not any earlier point.
 * @param {array} track - array of location points
 * @param {object} options - object of options
 * @param {number} threshold - value in metres, any point which is nearer than that to the previous point will not be returned
 * @param {boolean} keepLastPoint - if true, the last location in array will always be returned, even if nearer to last but one than threshold
 * @param {function} distanceFunction - distance function, either 'haversine' or 'vincenty'
 */
function nearPointRemoval(
  track,
  {
    threshold = 1 /*metre*/,
    distanceFunction = "haversine",
    keepLastPoint = true,
		path = []
  } = {}
) {
  if (![HAVERSINE, VINCENTY].includes(distanceFunction))
    throw `Unknown distance function ${distanceFunction}, expected ${HAVERSINE} or ${VINCENTY}`;
  return compress(track, {
    keepLastPoint,
		path,
    compressFunction: (ptPrev, ptCurr, ptNext) => {
      const distToPrev = distanceFunction === "vincenty"
          ? geo.vincentySync(ptPrev, ptCurr)
          : geo.haversineSync(ptPrev, ptCurr)

      return distToPrev >= threshold;
    }
  });
}

module.exports = nearPointRemoval;
