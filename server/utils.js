const reduceObject = (input, cb, inputAcc) =>
    Object.keys(input).reduce((acc, key) => cb(acc, input[key], key, input), inputAcc);

const hasNonEmptyInObject = input => Object.keys(input).reduce((acc, key) => (acc || input[key] !== undefined), false);

module.exports = {
    reduceObject,
    hasNonEmptyInObject
};
