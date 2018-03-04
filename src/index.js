import http from 'http';

import app from './server';

const server = http.createServer(app);
let currentApp = app;

/* eslint no-console: "off" */
server.listen(3000, () => { console.log('\nListening on 3000'); });

if (module.hot) {
    module.hot.accept(['./server'], () => {
        server.removeListener('request', currentApp);
        server.on('request', app);
        currentApp = app;
    });
}
