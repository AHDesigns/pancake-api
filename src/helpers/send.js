import request from 'request';

function send(query) {
    return function partialOptions(options) {
        const optionsParams = options(query);

        return new Promise(function sendPromise(resolve, reject) {
            request(optionsParams, function reqCallback(error, response, body) {
                if (error) {
                    /* eslint no-console: "off" */
                    console.log(error);

                    reject(new Error('service.failure'));
                } else {
                    resolve(body);
                }
            });
        });
    };
}

export { send };
