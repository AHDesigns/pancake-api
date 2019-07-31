require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const { port } = require('./helpers/config');
const getReviews = require('./github/reviews');
const getRepos = require('./repo/get');
const putRepo = require('./repo/put');
const log = require('./helpers/logger');
const cacheSystem = require('./helpers/cache');
const initialCache = require('./helpers/startupCache');

const cache = cacheSystem(initialCache());

getReviews(cache);

io.on('connection', (socket) => {
    log.info('user connected');

    socket.on('reviews', (data) => {
        log.info('from client', data);
        log.info('sending cache');
        socket.emit('reviews', cache.get(['skyport-graphql', 'value']));
    });
});


app.use(bodyParser.json());
app.use(cors());

app.get('/repos', getRepos(cache));
app.put('/repos', putRepo(cache));

app.all('*', (req, res) => {
    log.info('middleware.invalid.route', req.path);
    res.status(404);
    res.json({ message: `invalid.route ${req.path}` });
});

// need four args to identify error middleware 🤷🏽‍♂️
// eslint-disable-next-line
app.use((err, req, res, next) => {
    log.error('middleware.error.log', err.stack);
    res.status(500).json({ error: err.message });
});

http.listen(port, () => {
    log.info('app.start', {
        port, logLevel: log.level, env: process.env.NODE_ENV,
    });
});
