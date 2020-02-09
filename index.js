const nearPointRemoval = require("./lib/nearPointRemoval");
const outlierPointRemoval = require("./lib/outlierPointRemoval");
const { HAVERSINE, VINCENTY } = require("./lib/constants");
module.exports = {
  nearPointRemoval,
  outlierPointRemoval,
  HAVERSINE,
  VINCENTY
};
