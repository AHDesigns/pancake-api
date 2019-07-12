const logLevels = {
    ERROR: 'ERROR',
    INFO: 'INFO',
    VERBOSE: 'VERBOSE',
};

module.exports = {
    logLevels,
    loggerLevel: process.env.LOG_LEVEL || logLevels.INFO,
    port: process.env.PORT || 6371,
};
