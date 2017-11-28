module.exports = {
  /**
   * Converts a price string into a DB-compatible decimal
   * @param {String} str
   * @returns {Number}
   */
  convertToDecimal: (str) => {
    const converted = str.replace('kr', '').replace(',', '.').trim();
    return parseFloat(converted).toFixed(2);
  }
};
