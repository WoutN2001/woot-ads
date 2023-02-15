const superagent = require('superagent');
const {print} = require('./print')

let rolimonsItemDetails = {};
let lastRefresh 

//simple api call to grab rolimons itemdetails, send cached result if asked more than once per 15 seconds
const getItemdata = async () => new Promise(resolve => {
    if (lastRefresh && Date.now() - lastRefresh < 1000 * 15) {
        resolve(rolimonsItemDetails)
        return
    }
    superagent('GET', 'https://www.rolimons.com/itemapi/itemdetails')
        .set('user-agent', 'woot')
        .then(resp => {
            if (!resp || !resp.body || !resp.body.items) return resolve();
            rolimonsItemDetails = resp.body.items
            lastRefresh = Date.now()
            print('Refreshed Rolimons itemdetails', 'grey')
            resolve(rolimonsItemDetails);
        })
        .catch(() => {
            print('Failed to refresh Rolimons itemdetails', 'red')
            resolve();
        })
})

module.exports = {
    getItemdata
}

