const request = require('request');
const log = require('./logger');

module.exports = ({ options, loggable }) => new Promise((resolve, reject) => {
    log.info(loggable);
    request(options, (error, response, body) => {
        if (error) {
            log.error(error);
            reject(new Error('service.failure'));
        } else {
            resolve(body);
        }
    });
});
