import request from 'request';

function send(query, variables) {
    return function partialOptions(options) {
        console.log('input: ', variables);
        const optionsParams = options({
            query,
            variables,
        });
        console.log(optionsParams.body);

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
