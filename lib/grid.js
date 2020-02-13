const { toRad, toDeg } = require("./math");

/** 
 * Equidistant grid creation module.
 * @module lib/grid
*/

const createBoundingBoxWithDistance = (
  pLatitude,
  pLongitude,
  distanceInMeters
) => {
  const latRadian = toRad(pLatitude);

  const degLatKm = 110.574235; // degree of latitude to km conversion factor at the equator
  const degLongKm = 110.572833 * Math.cos(latRadian);
  const deltaLat = distanceInMeters / 1000.0 / degLatKm;
  const deltaLong = distanceInMeters / 1000.0 / degLongKm;

  const minLat = pLatitude;
  const minLong = pLongitude;
  const maxLat = pLatitude + deltaLat;
  const maxLong = pLongitude + deltaLong;

  return [minLat, minLong, maxLat, maxLong];
};

const grid = ({ latitudeNW, longitudeNW, latitudeSE, longitudeSE }) => {
  return [];
};

const getBoundingBox = coordinates =>
  coordinates.reduce(
    (acc, c) => {
      acc.nw.latitude = Math.max(acc.nw.latitude, c.latitude);
      acc.nw.longitude = Math.max(acc.nw.longitude, c.longitude);
      acc.se.latitude = Math.min(acc.se.latitude, c.latitude);
      acc.se.longitude = Math.min(acc.se.longitude, c.longitude);
      return acc;
    },
    {
      nw: {
        latitude: -90,
        longitude: -181
      },
      se: {
        latitude: 90,
        longitude: 181
      }
    }
  );

module.exports = {
  createBoundingBoxWithDistance,
  getBoundingBox,
  grid
};
