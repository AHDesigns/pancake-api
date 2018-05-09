import http from 'http';

import app from './server';

const server = http.createServer(app);
let currentApp = app;
const port = 2001;

/* eslint no-console: "off" */
server.listen(port, () => { console.log(`\nListening on ${port}`); });

if (module.hot) {
    module.hot.accept(['./server'], () => {
        server.removeListener('request', currentApp);
        server.on('request', app);
        currentApp = app;
    });
}
