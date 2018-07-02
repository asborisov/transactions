const defaultValues = new Map([
    ["createDb", true],
    ["dbPath", "db.db"],
    ["port", 3000]
]);

const getValueOrDefault = (argsMap, key) => {
    if (!defaultValues.has(key)) return null;
    return argsMap.has(key) ? argsMap.get(key) : defaultValues.get(key);
};

const isArgument = (input) => input.startsWith("--");
const isArgumentWithNoValue = (input) => isArgument(input) && input.slice(2).indexOf("=") === -1;
const isArgumentWithValue = (input) => isArgument(input) && input.slice(2).indexOf("=") > -1;
const getArgumentName = (input) => input.slice(2);
 /**
 * @param {Map} acc
 * @param {String} value
 * @param {Number} index
 * @param {Array.<String>} array
 * @returns {Map}
 */
const reduceArgs = (acc, value, index, array) => {
    // Skip `node` and file name args
    if (index === 0 || index === 1) return acc;
    // args name
    if (isArgumentWithValue(value)) {
        const currentArg = value.slice(2);
        const symbolIndex = currentArg.indexOf("=");
        const argName = currentArg.slice(0, symbolIndex);
        const argValue = currentArg.slice(symbolIndex + 1);

        return acc.set(argName, argValue.length ? argValue : defaultValues.get(argName));
    }
    if (isArgumentWithNoValue(value)) {
        const name = value.slice(2);
        return acc.set(name, defaultValues.get(name));
    }
    // Value after space?
    // Check if previous is argument with no value
    if (isArgumentWithNoValue(array[index - 1])) {
        return acc.set(getArgumentName(array[index - 1]), value);
    }
    return acc;
};
const checkArg = ([key, value]) => {
    const type = typeof defaultValues.get(key);
    if (typeof value === type) return [key, value];
    // Try parse
    switch (type) {
        case "boolean":
            return [key, (value === "true")];
        case "number":
            return [key, parseInt(value, 10)];
        default:
            return [key, value];
    }
};

/**
 * @param {Array.<String>} args
 * @returns {Map}
 */
const parseArgs = (args) => new Map(Array.from(args.reduce(reduceArgs, new Map())).map(checkArg));

module.exports = {
    getValueOrDefault,
    parseArgs,
};
