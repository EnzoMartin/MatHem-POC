module.exports = {
  convertToDecimal: (str) => {
    const converted = str.replace('kr', '').replace(',', '.').trim();
    return parseFloat(converted).toFixed(2);
  }
};
