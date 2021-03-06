const debug = require("debug")("geo-point-removal");
const { outlierPointRemoval: compress } = require("./outlierPointRemoval");
const {HAVERSINE, VINCENTY} = require ("..");

const track = require("../data/outlier.json");
const trackWithCoords = require("../data/clumpWithCoords.json");

test("Remove outliers with haversine", () => {
  const compressedTrack = compress(track, {
    threshold: 40,
    distanceFunction: HAVERSINE
  });
  debug("original length=%s", track.length);
  debug("compressedTrack length=%s", compressedTrack.length);
  // const withCoords = compressedTrack
  //   .map(p => `${p.latitude}, ${p.longitude}, ${p.altitude}, ${p.time}`)
  //   .join("\n");
  // console.log(withCoords);
  expect(compressedTrack.length).toEqual(17);
});

test("Remove outliers with vincenty", () => {
  const compressedTrack = compress(track, {
    threshold: 40,
    distanceFunction: VINCENTY
  });
  expect(compressedTrack.length).toEqual(17);
});

test("Remove outliers with default threshold", () => {
  const compressedTrack = compress(track, {
    distanceFunction: "vincenty"
  });
  expect(compressedTrack.length).toEqual(17);
});

test("Throw on unknown distance function", () => {
  expect(() => compress(track, { distanceFunction: "nonesuch" })).toThrow();
});

test("Return same for empty array", () => {
  expect(compress([])).toEqual([]);
});

test("Return same for undefined array", () => {
  expect(compress()).toEqual(undefined);
});

test("Return same for single item array", () => {
  expect(compress([track[0]])).toEqual([track[0]]);
});

test("Compress locations with path", () => {
  const compressedTrack = compress(trackWithCoords, {
    path: ["coords"]
  });
  expect(compressedTrack.length).toEqual(32);
});
