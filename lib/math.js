/**
 * Degree conversion module.
 * @module lib/math
 */

/** Convert 360° degree to radians.
 * @param {number} deg - degree 0..360
 * @returns {number} radians
 */
const toRad = deg => (deg * Math.PI) / 180.0;

/** Convert radians to 360°.
 * @param {number} rad - radians 0..2*PI
 * @returns {number} degrees
 */
const toDeg = rad => (rad * 180) / Math.PI;

module.exports = {
  toRad,
  toDeg
};
