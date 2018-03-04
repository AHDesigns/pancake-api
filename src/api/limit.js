import rp from 'request-promise';

export default () => rp('http://www.google.com')
    .then(function (htmlString) {
        return { good: true }
        console.log(htmlString);
        // Process html...
    })
    .catch(function (err) {
        console.log(err);
        return { good: false }
    });
