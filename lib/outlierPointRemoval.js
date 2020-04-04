const geo = require("node-geo-distance");
const { HAVERSINE, VINCENTY } = require("./constants");
const compress = require("./compress");

/**
 * Outlier Point Removal module.
 * @module lib/outlierPointRemoval
 */

/**
 * Algorithm for detecting far single away points to delete.
 * Only checks distance to previous and next points and distance between previous and next. So this is only useful for single outliers pt2, who are far away from pt1 but where pt1 and pt2 are reasonably near to each other.
 * @param {array} track - array of location points
 * @param {object} options - object of options
 * @param {number} threshold - value in metres, any point which is further away than that to the previous point AND whose distance between its previous point and its next point is over the threshold will not be returned
 * @param {boolean} keepLastPoint - if true, the last location in array will always be returned, even if further away to last but one than threshold
 * @param {function} func - distance function, either 'haversine' or 'vincenty'
 */
function outlierPointRemoval(
  track,
  {
    threshold = 50 /*metre*/,
    distanceFunction = "haversine",
    keepLastPoint = false,
    path = []
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

/**
 * Outlier Point Removal module, alternative algorithm.
 * @module lib/outlierPointRemoval
 */

/**
 * Algorithm for detecting far away points to delete.
 * Only checks distance to previous point, not next point. So any point pt2 which is further away from pt1 than threshold will not be returned; if this function is applied repeatedly to its own output, this should remove multiple outliers from the main track. 
 * @param {array} track - array of location points
 * @param {object} options - object of options
 * @param {number} threshold - value in metres, any point which is further away than that to the previous point will not be returned
 * @param {boolean} keepLastPoint - if true, the last location in array will always be returned, even if further away to last but one than threshold
 * @param {function} func - distance function, either 'haversine' or 'vincenty'
 */
function outlierPointRemovalMultiple(
  track,
  {
    threshold = 50 /*metre*/,
    distanceFunction = "haversine",
    keepLastPoint = false,
    path = []
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
      return distCurrToPrev <= threshold;
    }
  });
}

module.exports = {
  outlierPointRemoval,
  outlierPointRemovalMultiple
}
