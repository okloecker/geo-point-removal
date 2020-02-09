Algorithms to clean up an array of geo locations by removing outliers or removing locations that are near to each other.
---

### Install
`$ npm install geo-point-removal --save`

### Use
```js
  const {HAVERSINE, VINCENTY} = require ("geo-point-removal");
  const outlierPointRemoval = require("geo-point-removal").outlierPointRemoval;
  const track = [
    { latitude: 52.49945, longitude: -10.9399 }, 
    { latitude: 51.49945, longitude: -11.9399 }, 
    { latitude: 52.50945, longitude: -10.8399 }
  ];

  const compressedTrack = outlierPointRemoval(track, {
    threshold: 40,
    distanceFunction: VINCENTY
  });

  expect(compressedTrack.length).toEqual(2);
```

```js
  const {HAVERSINE, VINCENTY} = require ("geo-point-removal");
  const outlierPointRemoval = require("geo-point-removal").nearPointRemoval;
  const track = [
    { latitude: 52.49945, longitude: -10.9399 }, 
    { latitude: 51.49945, longitude: -11.9399 }, 
    { latitude: 52.50945, longitude: -10.8399 }
  ];

  const compressedTrack = nearPointRemoval(ltrack, {
    threshold: 40,
    distanceFunction: HAVERSINE
  });

  expect(compressedTrack.length).toEqual(2);
```

API
---
To remove outliers:
```js
   outlierPointRemoval(track, options)
```

To remove near points:
```js
   nearPointRemoval(track, options)
```

Options
---
```js
threshold = 1
``` 
Distance in metres between two points to treat as outliers or near points. Defaults to 1 for nearPointRemoval and  50 for outlierPointRemoval.

```js
distanceFunction = "haversine"
``` 
Algorithm to measure distance with, values: "haversine" or "vincenty". Defaults to "haversine"

```js
keepLastPoint = true
``` 
If true, nearPointRemoval will always keep the last array element. Defaults to true.

```js
path = ""
``` 
 Object path to find coordinates in the objects that make out the array, useful in shapes like:

```js
[ { coords: { latitude: 0.0, longitude: 0.0 } } ]` vs `[ { latitude: 0.0, longitude: 0.0 } ]
``` 
Here, the path would be "coords".
Defaults to empty string.

