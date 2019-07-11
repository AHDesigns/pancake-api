const logLevels = {
    DEBUG: Symbol('DEBUG'),
    PROD: Symbol('PROD'),
};

module.exports = {
    loggerLevel: logLevels.DEBUG,
    port: process.env.PORT || 6371,
};
