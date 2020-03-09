const geo = require("node-geo-distance");

/**
 * @typedef {Object} Point
 * @property {number} latitude
 * @property {number} longitude
 */

/** Calculate all distances between a single point (e.g. center of gravity) and
 * a list of points.
 * @param {Point} center - a single point
 * @param {Point[]} points - an array of points
 */
const distancesFromCenter = (points, center) => points.map(p => {
  const distFromCog = geo.haversineSync(
    { latitude: p.latitude, longitude: p.longitude },
    { latitude: center.latitude, longitude: center.longitude }
  );
  p.distance = +distFromCog;
  return { distance: distFromCog, ...p };
});

/**
 * Calculates root of mean squares.
 * @param {number[]} - array of values
*/
const drms = values => Math.sqrt(
  values.reduce((sum, d) => ((sum += Math.pow(d, 2)), sum), 0) /
    values.length
);

module.exports = {
  distancesFromCenter,
  drms
};
