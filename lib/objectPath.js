/**
 * Object path module.
 * @module lib/objectPath
 */

/** Access a deeply nested object by path.
@param {string[]} p - the path as an array of strings (keys)
@param {Object} o - root object
 * @example
 * const level3Object = { company: { person: { name: "Jane" } } };
 * const name = objectPath(["company", "person", "name"], level3Object).toEqual("Jane")
*/
const objectPath = (p, o) => p.reduce((xs, x) => xs && xs[x], o);

/** Curried function to access deeply nested key.
 * @param {string[]} p - path as in objectPath
 * @param {Object} o - object as in objectPath
 * @param {string} f - field key
 *
 * @example
 * Usage e.g.:
 * const name = fieldOf(["person"], "name");
 * expect(name({person:{name:"Jane"}}).toEqual("Jane");
 */
const fieldOf = (p, f) => o => objectPath(p, o)[f];

module.exports = {
  objectPath,
  fieldOf
};
