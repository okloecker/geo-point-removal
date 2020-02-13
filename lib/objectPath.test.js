const debug = require("debug")("objectPath");
const { fieldOf, objectPath } = require("./objectPath");

const plainObject = { name: "Jane Doe" };
const level2Object = { person: { name: "Jane Doe" } };
const level3Object = { company: { person: { name: "Jane Doe" } } };

test("Access 1st level object", () => {
  expect(objectPath(["name"], plainObject)).toEqual("Jane Doe");
});

test("Access nonexistant 1st level object", () => {
  expect(objectPath(["city"], plainObject)).toEqual(undefined);
});

test("Access 2nd level object", () => {
  expect(objectPath(["person", "name"], level2Object)).toEqual("Jane Doe");
});

test("Access 3rd level object", () => {
  expect(objectPath(["company", "person", "name"], level3Object)).toEqual(
    "Jane Doe"
  );
});

test("FieldOf 1st level object", () => {
  const name = fieldOf([], "name");
  expect(name(plainObject)).toEqual("Jane Doe");
});

test("FieldOf 2nd level object", () => {
  const name = fieldOf(["person"], "name");
  expect(name(level2Object)).toEqual("Jane Doe");
});

test("FieldOf nonexistant 2nd level object", () => {
  const name = fieldOf(["person"], "city");
  expect(name(level2Object)).toEqual(undefined);
});

test("FieldOf 3rd level object", () => {
  const name = fieldOf(["company", "person"], "name");
  expect(name(level3Object)).toEqual("Jane Doe");
});
