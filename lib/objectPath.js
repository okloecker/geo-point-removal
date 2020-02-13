/**
 * Object path module.
 * @module lib/objectPath
 */

/** Access a deeply nested object by path.
@param p - the path as an array of strings (keys)
@param o - root object
*/
const objectPath = (p, o) => p.reduce((xs, x) => xs && xs[x], o);

/* Curried function to access deeply nested key.
 * @param p - path as above
 * @param o - object as above
 * @param f - field key
 *
 * Usage e.g.:
 * const name = fieldOf(["person"], "name");
 * expect(name({person:{name:"Jane"}}).toEqual("Jane");
 */
const fieldOf = (p, f) => o => objectPath(p, o)[f];

module.exports = {
  objectPath,
  fieldOf
};
