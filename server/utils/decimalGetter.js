// Postgres/node-pg returns DECIMAL columns as strings to avoid float precision loss.
// Attach this as the `get()` on DECIMAL/NUMERIC fields so consumers always see real numbers.
module.exports = function decimalGetter(field) {
  return function () {
    const value = this.getDataValue(field);
    return value === null || value === undefined ? null : parseFloat(value);
  };
};
