const debug = require("debug")("grid");
const fs = require("fs");
const geo = require("node-geo-distance");
const parse = require("date-fns/parseISO");
const format = require("date-fns/format");
const gpx = require("gpx-parse");
const KDBush = require("kdbush");
const geokdbush = require("geokdbush");
const { centroid } = require("./centroid");
const { distancesFromCenter, drms } = require("./drms");
const {
  getBoundingBox,
  createGrid,
  createBoundingBoxWithDistance
} = require("./grid");
const clumpTrack = require("../data/clump.json");

const getLongTrack = async f =>
  await new Promise((resolve, reject) =>
    gpx.parseGpxFromFile(f, function(error, data) {
      if (error) return reject(error);
      resolve(data);
    })
  );

test("Create bounding box from coordinate and distance", () => {
  const gridSquare = createBoundingBoxWithDistance(55.9128213, -3.2036907, 10);
  debug("GRIDSQUARE", gridSquare);
  const gridData = createGrid(gridSquare);
  debug("GRID %O", gridData);
  const bb = getBoundingBox(clumpTrack);
  debug("BOUNDING BOX %O", bb);

  const distLat = +geo.haversineSync(
    { latitude: bb.nw.latitude, longitude: bb.nw.longitude },
    { latitude: bb.nw.latitude, longitude: bb.se.longitude }
  );
  const distLon = +geo.haversineSync(
    { latitude: bb.nw.latitude, longitude: bb.nw.longitude },
    { latitude: bb.se.latitude, longitude: bb.nw.longitude }
  );
  debug("DISTANCE latitude=%s longitude=%s", distLat, distLon);

  expect(distLat).toEqual(25.632);
  expect(distLon).toEqual(9.83);
});

test("Make grid out of long track", async () => {
  let longTrack = await getLongTrack(
    "./data/wlky_2020-02-14T13_02_48.000Z.gpx"
    // "/tmp/dirty.gpx"
  );

  // console.log("LongTrack track:", longTrack.tracks[0]);
  // console.log("LongTrack segments:", longTrack.tracks[0].segments[0][1]);
  // console.log("LongTrack segments:", format(longTrack.tracks[0].segments[0][1].time, "t"));

  let id = 0;
  const points = longTrack.tracks.reduce(
    (trackAcc, track) =>
      trackAcc.concat(
        track.segments.reduce(
          (segmentAcc, segment) =>
            segmentAcc.concat(
              segment.map(wayPoint => ({
                latitude: wayPoint.lat,
                longitude: wayPoint.lon,
                altitude: wayPoint.elevation,
                timestamp: +format(wayPoint.time, "t"),
                id: id++
              }))
            ),
          []
        )
      ),
    []
  );

  const index = new KDBush(points, p => p.longitude, p => p.latitude);

  debug("POINTS length longTrack: %s", points.length);
  debug("first point: %O", points[0]);

  const bb = getBoundingBox(points);
  debug("BOUNDING BOX of longTrack: %O", bb);

  const [
    maxLatitude,
    maxLongitude,
    minLatitude,
    minLongitude
  ] = createBoundingBoxWithDistance(
    // bb.nw.latitude, bb.nw.longitude
    // points[0].latitude, points[0].longitude
    52.134089,
    9.97322,
    100
  );

  debug("1 grid square: %O", [
    maxLatitude,
    maxLongitude,
    minLatitude,
    minLongitude
  ]);

  const allgrid = createGrid(
    bb.nw.latitude,
    bb.se.longitude,
    bb.se.latitude,
    bb.nw.longitude,
    10
  );
  let csv = "";
  allgrid.map(row =>
    row.map(g => {
      csv += `
${g.nw.latitude}, ${g.nw.longitude}
${g.nw.latitude}, ${g.se.longitude}
${g.se.latitude}, ${g.se.longitude}
${g.se.latitude}, ${g.nw.longitude}
${g.nw.latitude}, ${g.nw.longitude}`;
    })
  );
  const csvFile = "/tmp/grid.csv";
  fs.writeFile(csvFile, csv, err => {
    if (err) debug("WriteFile err: %O", err);
    debug("csv file written %s", csvFile);
  });

  const bbx = getBoundingBox(points);
  debug("BBX %O", bbx);
  const rangeAllPoints = index.range(
    minLongitude,
    minLatitude,
    maxLongitude,
    maxLatitude
  ).length; //map(id => points[id]);

  // const rangeAllPoints = index.range(
  //   bbx.se.longitude, bbx.se.latitude,
  //   bbx.nw.longitude, bbx.nw.latitude,
  // ).length; //map(id => points[id]);
  debug("points within bounding box bbx: %O", rangeAllPoints);

  // find numbers of points within each grid cell (without regard to timestamp, i.e. can include different segment of track):
  allgrid.map((row, y, rows) =>
    row.map((g, x, columns) => {
      const row1 = y > 0 ? y-1 : 0;
      const col1 = x > 0 ? x-1 : 0;
      const row2 = y < rows.length-1 ? y+1 : 0;
      const col2 = x < columns.length-1 ? x+1 : 0;
      const nwcell = allgrid[row1][col1];
      const secell = allgrid[row2][col2];
      const pointsInGridCell = index
        .range(nwcell.nw.longitude, secell.se.latitude, secell.se.longitude, nwcell.nw.latitude)
        .map(id => points[id])
        .sort((a, b) => a.timestamp - b.timestamp);
      if (pointsInGridCell.length >= 10)
        debug(
          "[%s][%s]: %s %o",
          y,
          x,
          pointsInGridCell.length
          // pointsInGridCell
        );

      if (y === 2 && x === 6) {
        const continuousPoints = pointsInGridCell.filter(
          p => p.timestamp >= 1581682446 && p.timestamp <= 1581682485
        );
        const cog = centroid(continuousPoints);
        cog.description = "COG";

        const distancesFromCog = distancesFromCenter(continuousPoints, cog); 
        debug("distancesFromCog: %s", distancesFromCog);
        const d_rms = drms(distancesFromCog); 
        debug("d_rms: %s", d_rms);
        const outliers = continuousPoints.filter(p => p.distance > 2 * d_rms);
        debug("outliers: %O", outliers);
        const cog2 = centroid(continuousPoints);
        debug(
          "distance cog-cog2: %s",
          geo.haversineSync(
            { latitude: cog2.latitude, longitude: cog2.longitude },
            { latitude: cog.latitude, longitude: cog.longitude }
          )
        );

        continuousPoints.push(cog);
        debug("COG %o", cog);
        fs.writeFile(
          "/tmp/track_2_6.json",
          JSON.stringify(continuousPoints, null, 2),
          err => {
            if (err) debug("WriteFile err: %O", err);
          }
        );
      }
    })
  );

  const gridjson = allgrid.reduce((acc, row, y) => {
    acc.push(
      row.reduce((rowacc, g, x) => {
        rowacc.push({latitude: g.nw.latitude, longitude: g.nw.longitude});
        rowacc.push({latitude: g.se.latitude, longitude: g.se.longitude});
        return rowacc;
      }, [])
    );
    return acc;
  }, []).flat();
  fs.writeFile(
    "/tmp/grid_2_6.json",
    JSON.stringify(gridjson, null, 2),
    err => {
      if (err) debug("WriteFile err: %O", err);
    }
  );

  // const nearest = geokdbush.around(index,  9.9834962,  52.1260675,10)//.map(id => points[id]);
  // const nearest = geokdbush.around(index,  points[0].longitude, points[0].latitude, 10)//.map(id => points[id]);
  // debug('points within radius: %s  %o', nearest.length, nearest)
});
