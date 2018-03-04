import request from 'request';

function send(query) {
    return function defineOptions(options) {
        const optionsParams = options(query);
        return new Promise(function requestPromise(resolve, reject) {
            request(optionsParams, function requestCallback(error, response, body) {
                if (error) {
                    reject(error);
                } else {
                    resolve(body)
                }
            });
        });
    }
}

export {
    send
}
