module.exports = function sum(a, b) {
  if (!isNaN(a) && !isNaN(b)) {
    return a + b;
  }
  throw new Error("please prodive numbers");
};
