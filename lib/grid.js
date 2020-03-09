const debug = require("debug")("grid");
const { toRad, toDeg } = require("./math");
const geo = require("node-geo-distance");

/**
 * Equidistant grid creation module.
 * @module lib/grid
 */

/**
 * Calculates a bounding box whose north west corner and distance to east and south is given.
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} distance in metres
 * @returns {Array} north west latitude, north west longitude,
 *      south east latitude, south east longitude
 */
const createBoundingBoxWithDistance = (
  latitude,
  longitude,
  distanceInMeters
) => {
  const latRadian = toRad(latitude);

  const degLatKm = 110.574235; // degree of latitude to km conversion factor at the equator
  const degLongKm = 110.572833 * Math.cos(latRadian);
  const deltaLat = distanceInMeters / 1000.0 / degLatKm;
  const deltaLong = distanceInMeters / 1000.0 / degLongKm;

  const maxLatitude = latitude;
  const maxLongitude = longitude + deltaLong;
  const minLatitude = latitude - deltaLat;
  const minLongitude = longitude;

  return [maxLatitude, maxLongitude, minLatitude, minLongitude];
};

/**
 * @typedef {Object} Point
 * @property {number} latitude
 * @property {number} longitude
 */

/**
 * @typedef {Object} BoundingBox
 * @property {Point} nw - The north west corner.
 * @property {Point} se - The south east corner.
 */

/** Creates and initialize array of rows, columns ([y,x])
 * with optional cell value through function which gets (y, x)
 * cell indices.
 * @param {number} rows - number of array rows
 * @param {number} columns - number of array columns
 * @param {function} initialValueFunc - function which will be called for each
 * cell and whose return value will be the cell value; if not provided, cell
 * will be initialized with "undefined"
 */
const createArray = (rows, columns, initialValueFunc) => {
  let matrix = [];
  for (let y = 0; y < rows; y++) {
    matrix[y] = [];
    for (let x = 0; x < columns; x++) {
      matrix[y][x] = initialValueFunc ? initialValueFunc(y, x) : undefined;
    }
  }
  return matrix;
};

/**
 * Creates 2D array of bounding boxes of equidistant widths out of
 * bigger bounding box.
 * It doesn't matter which latitude/longitude comes first, internally they are
 * ordered by max/min.
 * @param {number} lat1 - first latitude value of bounding box
 * @param {number} lng1 - first longitude value of bounding box
 * @param {number} lat2 - second latitude value of bounding box
 * @param {number} lng2 - second longitude value of bounding box
 * @returns {Point[]} grid - array of rows of columns of bounding boxes,
 * starting at north west corner described by "higher latitude/lower longitude"
 * down to "lower latitude/higher longitude"
 */
const createGrid = (lat1, lng1, lat2, lng2, distance) => {
  // make sure the given latitude/longitude values are ordered according to
  // higher/lower values
  const maxLatitude = Math.max(lat1, lat2);
  const maxLongitude = Math.max(lng1, lng2);
  const minLatitude = Math.min(lat1, lat2);
  const minLongitude = Math.min(lng1, lng2);

  // horizontal extent of initial bounding box
  const hdist = geo.vincentySync(
    { latitude: maxLatitude, longitude: maxLongitude },
    { latitude: maxLatitude, longitude: minLongitude }
  );
  // vertical extent of initial bounding box
  const vdist = geo.vincentySync(
    { latitude: maxLatitude, longitude: maxLongitude },
    { latitude: minLatitude, longitude: maxLongitude }
  );

  // compute number of grid cells:
  const vsize = Math.ceil(vdist / distance);
  const hsize = Math.ceil(hdist / distance);
  debug("vsize: %s %s", vsize, vdist);
  debug("hsize: %s %s", hsize, hdist);

  let matrix = createArray(vsize, hsize, () => ({ nw: {}, se: {} }));

  // fill matrix with back to back sub bounding boxes
  let y = 0;
  for (let currLatitude = maxLatitude; y < vsize; ) {
    let x = 0;
    for (let currLongitude = minLongitude; x < hsize; ) {
      const [y2, x2, y1, x1] = createBoundingBoxWithDistance(
        currLatitude,
        currLongitude,
        distance
      );
      matrix[y][x].nw = { latitude: y2, longitude: x1 };
      matrix[y][x].se = { latitude: y1, longitude: x2 };
      currLongitude = x2;
      x++;
    }
    currLatitude = matrix[y][0].se.latitude;
    y++;
  }

  return matrix;
};

/** Returns the north west and south east coordinates of the direct neighbour
 * cells of the x/y cell. If there is no neighbour in a direction, the x/y cell
 * will provide the coordinates.
 * @param {Object} grid - grid created by createGrid
 * @returns {Object} bbox - object containing nw and se corner locations
 * @returns {Point} bbox.nw - then north west corner
 * @returns {Point} bbox.se - then south east corner
 */
const getExpandedCell = (grid, x, y) => {
  const row1 = y > 0 ? y - 1 : 0;
  const col1 = x > 0 ? x - 1 : 0;
  const row2 = y < grid.length - 1 ? y + 1 : y;
  const col2 = x < grid[0].length - 1 ? x + 1 : x;
  const nw = grid[row1][col1].nw;
  const se = grid[row2][col2].se;
  return {
    nw: {latitude: nw.latitude, longitude: nw.longitude},
    se: {latitude: se.latitude, longitude: se.longitude}
  };
};

/** Calculates NW and SE corners of coordinates.
 * @param {array} coordinates
 * @returns {Object} bbox - object containing nw and se corner locations
 * @returns {Point} bbox.nw - then north west corner
 * @returns {Point} bbox.se - then south east corner
 */
const getBoundingBox = coordinates =>
  coordinates.reduce(
    (acc, c) => {
      acc.nw.latitude = Math.max(acc.nw.latitude, c.latitude);
      acc.nw.longitude = Math.min(acc.nw.longitude, c.longitude);
      acc.se.latitude = Math.min(acc.se.latitude, c.latitude);
      acc.se.longitude = Math.max(acc.se.longitude, c.longitude);
      return acc;
    },
    {
      nw: {
        latitude: -90,
        longitude: 181
      },
      se: {
        latitude: 90,
        longitude: -181
      }
    }
  );

/** Creates array of arrays of coordinate pairs of grid corner points:
 * @param {Point[]} gridData - output of createGrid()
 * @returns {Array} array of coordinate pairs as numbers:
 * @example
 *  // sample return "[ [lat1, lng1], [lat2, lng2], ... ]"
 */
const getGridCoordinatesFlat = gridData =>
  gridData
    .reduce((acc, row, y, rowarr) => {
      acc.push(
        row.reduce((rowacc, g, x) => {
          rowacc.push([g.nw.latitude, g.nw.longitude]);
          rowacc.push([g.nw.latitude, g.se.longitude]);
          if (y === rowarr.length - 1) {
            rowacc.push([g.se.latitude, g.nw.longitude]);
            rowacc.push([g.se.latitude, g.se.longitude]);
          }
          return rowacc;
        }, [])
      );
      return acc;
    }, [])
    .flat();

/** Returns the cell which contains the latitude/longitude pair in the given grid.
 * @param {Point[]} gridData - output of createGrid()
 * @returns {Object} object in the form {x, y}
 */
const getGridCellForCoordinates = (gridData, latitude, longitude) => {
  for (let y = 0; y < gridData.length; y++) {
    for (let x = 0; x < gridData[y].length; x++) {
      const cell = gridData[y][x];
      if (
        cell.nw.latitude >= latitude &&
        cell.nw.longitude <= longitude &&
        cell.se.latitude <= latitude &&
        cell.se.longitude >= longitude
      )
        return { x, y };
    }
  }
};

module.exports = {
  createArray,
  createBoundingBoxWithDistance,
  createGrid,
  getBoundingBox,
  getExpandedCell,
  getGridCellForCoordinates,
  getGridCoordinatesFlat
};
