const request = require('request');
const log = require('./logger');

module.exports = ({ options, loggable }) => new Promise((resolve, reject) => {
    log.debug(options);
    log.info('request.sending', loggable);
    request(options, (error, response) => {
        if (error) {
            reject(new Error('request.error'));
        } else {
            const { body, headers } = response;
            log.info('request.response', {
                headers,
                statusCode: response.statusCode,
            });
            log.debug(body);

            if (response.statusCode === 200) {
                resolve(body);
            } else if (response.statusCode === 401) {
                reject(new Error('request.unauthenticated'));
            } else if (response.statusCode === 404) {
                reject(new Error('request.invalid.route'));
            } else {
                reject(new Error('request.unknown.error'));
            }
        }
    });
});
