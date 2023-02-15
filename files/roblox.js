const superagent = require('superagent');
const {print} = require('./print')
const config = require('./config').config()

let inventory = {};
let lastRefresh 

//get the users inventory and return a cached result if asked more than once per 15 seconds
const getInventory = async () => new Promise(resolve => {
    if (lastRefresh && Date.now() - lastRefresh < 1000 * 15) {
        resolve(inventory)
        return
    }

    superagent('GET', `https://inventory.roblox.com/v1/users/${config.AUTHENTICATION.robloxid}/assets/collectibles?sortOrder=Asc&limit=100`)
        .set('user-agent', 'woot')
        .then(resp => {
            if (!resp || !resp.body || !resp.body.data) return resolve();
            data = resp.body.data

            //save it as userassetId:itemId pairs
            var items = {}
            for (const item in data) {
                const itemId = data[item].assetId
                const userAssetId = data[item].userAssetId
                items[userAssetId] = itemId
            }

            inventory = items
            lastRefresh = Date.now()
            print('Refreshed ROBLOX inventory', 'grey')
            resolve(inventory);
        })
        .catch(() => {
            print('Failed to refresh ROBLOX inventory', 'red')
            resolve();
        })
})

//simple api call to get the user their username by id
const getUsername = async () => new Promise(resolve => {
    superagent('GET', `https://api.roblox.com/users/${config.AUTHENTICATION.robloxid}`)
        .set('user-agent', 'woot')
        .then(resp => {
            if (!resp || !resp.body) return resolve()
            
            const name = resp.body.Username
            resolve(name)
        })
        .catch(() => {
            print('Failed to find username', 'red')
            resolve()
        })
})

module.exports = {
    getInventory,
    getUsername
}