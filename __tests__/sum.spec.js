const sum = require("../src/calculator/sum");

describe("Sum", () => {
  test("sum two numbers", () => {
    expect(sum(1, 1)).toEqual(2);
  });
});
