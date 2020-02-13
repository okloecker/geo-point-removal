const debug = require("debug")("geo-point-removal");
const { toRad, toDeg } = require("./math");

/**
 * Centroid module.
 * @module lib/centroid
 */

/** Find center of gravity of locations.
 * @param {array} locations - array of WGS84 coordinates
 */
function centroid(locations) {
  let num_coords = locations.length;
  let X = 0.0;
  let Y = 0.0;
  let Z = 0.0;

  for (i = 0; i < num_coords; i++) {
    const latitude = toRad(locations[i].latitude);
    const longitude = toRad(locations[i].longitude);
    const a = Math.cos(latitude) * Math.cos(longitude);
    const b = Math.cos(latitude) * Math.sin(longitude);
    const c = Math.sin(latitude);

    X += a;
    Y += b;
    Z += c;
  }

  X /= num_coords;
  Y /= num_coords;
  Z /= num_coords;

  const longitude = Math.atan2(Y, X);
  const hyp = Math.sqrt(X * X + Y * Y);
  const latitude = Math.atan2(Z, hyp);

  let finalLat = toDeg(latitude);
  let finalLng = toDeg(longitude);

  return { latitude: toDeg(latitude), longitude: toDeg(longitude)};
}

module.exports = {
  centroid
};

