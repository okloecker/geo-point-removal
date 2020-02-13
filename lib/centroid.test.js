const debug = require("debug")("geo-point-removal");
const { centroid } = require("./centroid");

const locations = [
  { latitude: 22.281610498720003, longitude: 70.77577162868579 },
  { latitude: 22.28065743343672, longitude: 70.77624369747241 },
  { latitude: 22.280860953131217, longitude: 70.77672113067706 },
  { latitude: 22.281863655593973, longitude: 70.7762061465462 }
];

const cluster = require("/tmp/cluster.json");

test("Find centroid", () => {
  const center = centroid(locations);
  expect(center).toEqual({
    latitude: 22.281248135566404,
    longitude: 70.77623565152302
  });
});

test("Find another centroid", () => {
  const center = centroid(cluster.map(c => ({ ...c.coords })));
  expect(center).toEqual({
    latitude: 55.9127785941194,
    longitude: -3.2038732176474194
  });
});
