require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const EventEmitter = require('events');

const { port, env } = require('./helpers/config');
const getRepos = require('./repo/get');
const putRepo = require('./repo/put');
const log = require('./helpers/logger');
const cacheSystem = require('./helpers/cache');
const initialCache = require('./helpers/startupCache');
const requester = require('./requester');

const cache = cacheSystem(initialCache());
const reviewEmitter = new EventEmitter();
const watchedRepos = {};

env === 'production' // eslint-disable-line no-unused-expressions
    ? setInterval(() => {
        requester({
            cache, reviewEmitter, log, watchedRepos,
        });
    }, 30 * 1000)
    : setTimeout(() => {
        requester({
            cache, reviewEmitter, log, watchedRepos,
        });
    }, 2 * 1000);

io.on('connection', (socket) => {
    const id = (Math.random() * 100000).toFixed(0);
    let userRepos = [];

    log.info(`user ${id} connected`);
    log.info('watched: ', watchedRepos);

    reviewEmitter.on('new-reviews', ({ repo, data }) => {
        if (userRepos.includes(repo)) {
            log.info(`user ${id} recieved data for repo ${repo}`);
            socket.emit('reviews', data);
        }
    });

    socket.on('availableRepos', (data) => {
        log.info('client subscribing to repos', data);
        userRepos = data;
        watchedRepos[id] = data;
        userRepos.forEach((repo) => {
            const repoData = cache.get([repo, 'value']);
            if (repoData) {
                socket.emit('reviews', repoData);
            }
        });
    });

    socket.on('disconnect', () => {
        log.info(`user ${id} disconnected`);
        delete watchedRepos[id];
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
