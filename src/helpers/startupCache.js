const fs = require('fs');

module.exports = () => {
    try {
        return JSON.parse(fs.readFileSync('./cache.json', { encoding: 'utf8' }));
    } catch (e) {
        console.error(e);
        return {};
    }
};
