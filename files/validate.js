const superagent = require('superagent');
const {print} = require('./print')
const config = require('./config').config()

let lastRefresh 

const checkWhitelist = async () => new Promise(resolve => {
    const id = config.AUTHENTICATION.robloxid
    if (lastRefresh && Date.now() - lastRefresh < 1000 * 15) {
        resolve(true)
        return
    }
    print('Checking whitelist', 'grey')
    superagent('POST', 'https://otter.quaid.mx/')
        .set('user-agent', 'woot')
        .timeout(10000)
        .send({method: 'trial', id:id})
        .then(resp => {
            if (resp.status == 200) {
                lastRefresh = Date.now()
                resolve(true)
            } else {
                resolve(false);
            }
        })
        .catch(() => {
            resolve(false);
        })
})

module.exports = {
    checkWhitelist
}