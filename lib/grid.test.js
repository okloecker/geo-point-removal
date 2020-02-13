const debug = require("debug")("geo-point-removal");
const geo = require("node-geo-distance");
const { getBoundingBox, grid, createBoundingBoxWithDistance } = require ("./grid");
const track = require("../data/clump.json");

test("Create bounding box from coordinate and distance", () => {
  const gridSquare = createBoundingBoxWithDistance(55.9128213, -3.2036907, 10);
  debug('GRIDSQUARE', gridSquare);
  const gridData = grid(gridSquare);
  debug('GRID %O', gridData);
  const bb = getBoundingBox(track);
  debug('BOUNDING BOX %O', bb);

  const distLat = +geo.haversineSync({latitude:bb.nw.latitude, longitude:bb.nw.longitude}, {latitude:bb.nw.latitude, longitude:bb.se.longitude})
  const distLon = +geo.haversineSync({latitude:bb.nw.latitude, longitude:bb.nw.longitude}, {latitude:bb.se.latitude, longitude:bb.nw.longitude})
  debug('DISTANCE latitude=%s longitude=%s', distLat, distLon);

  expect(distLat).toEqual(25.632);
  expect(distLon).toEqual(9.830);
});
