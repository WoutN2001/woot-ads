const fs = require('fs');
const ini = require('ini');

//turn .ini config file into object
const config = () => {
    const rawConfig = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));
    return(rawConfig)
}

module.exports = {
    config
}