/* eslint no-console: "off" */
const valid = level => validAt => (validAt >= level ? null : () => { });

function log(method = '') {
    const logDetails = console[method];
    return (message = '') => {
        logDetails({ [method]: message });
    };
}

function logger(level) {
    const useLevel = valid(level);

    return {
        error: useLevel(1) || log('error'),
        info: useLevel(2) || log('info'),
    };
}

module.exports = logger(process.env.LOG_LEVEL || 0);
