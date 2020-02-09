const geo = require("node-geo-distance");
const debug = require("debug")("geo-point-removal");

module.exports = outlierPointRemoval;

/**
 * Algorithm for detecting far away points to delete.
 * Only checks distance to previous point, not any earlier point.
 * @param track - array of location points
 * @param options - object of options
 * @param threshold - value in metres, any point which is further away than that to the previous point will not be returned
 * @param keepLastPoint - if true, the last location in array will always be returned, even if further away to last but one than threshold
 * @param func - distance function, either 'haversine' or 'vincenty'
 */
function outlierPointRemoval(
  track,
  { threshold = 50 /*metre*/, func = "haversine", keepLastPoint = true }
) {
  if (!track || track.length === 0) return track;
  if (!["haversine", "vincenty"].includes(func))
    throw `Unknown distance function ${func}, expected 'haversine' or 'vincenty'`;
  debug("params:", threshold, func, keepLastPoint);

  const hasShortKey = track[0].lat; // geo-point-removal lib expects long keys "latitude" etc
  return track
    .filter((pt, i, arr) => {
      if (i === 0) return true; // track with just point cannot be compressed
      if (keepLastPoint && i === arr.length - 1) return true; // never remove last

      const ptCurr = hasShortKey ? toLongKey(pt) : pt;
      const ptPrev = hasShortKey ? toLongKey(arr[i - 1]) : arr[i - 1];
      const dist =
        func === "vincenty"
          ? geo.vincentySync(ptPrev, ptCurr)
          : geo.haversineSync(ptPrev, ptCurr);

      return dist >= threshold;
    })
    .map(
      // revert back if necessary
      pt => (hasShortKey ? toShortKey(pt) : toLongKey(pt))
    );
}

// changes object keys from "lat" to "latitude" etc
const toLongKey = pt => {
  let pt1 = {
    ...pt,
    latitude: pt.latitude || pt.lat,
    longitude: pt.longitude || pt.lon
  };
  delete pt1.lat;
  delete pt1.lon;
  return pt1;
};

// changes object keys from "lattude" to "lat" etc
const toShortKey = pt => {
  let pt1 = {
    ...pt,
    lat: pt.latitude || pt.lat,
    lon: pt.longitude || pt.lon
  };
  delete pt1.latitude;
  delete pt1.longitude;
  return pt1;
};

