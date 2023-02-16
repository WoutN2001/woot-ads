const superagent = require('superagent');
const {print} = require('./print')
const {getItemdata} = require('./itemdetails')
const {getInventory} = require('./roblox');
const config = require('./config').config()

//Find total value of array of item id's
const findWorth = async (inventory) => {
    let items = await getItemdata()
    let itemValues = {}
    for (const item in inventory) {
        itemValues[inventory[item]] = items[inventory[item]][4]
    }

    const total = Object.values(itemValues).reduce((a, b) => a + b, 0)
    return(total)
}

//Returns array of 4 random items with demand higher than normal and value relative to value of the items being offered
const randomDemandItem = async (offerTotal) => {
    let items = await getItemdata();
    var demand = []
    for (const item in items) {
        if (items[item][5] > 1 && items[item][4] > offerTotal/10 && items[item][4] < (offerTotal * 6) / 4) {
            demand.push(item)
        }
    }

    var item = demand[Math.floor(Math.random()*demand.length)]
    return(item)
}

//Returns array of 4 random items from user their roblox inventory
const randomItem = async () => {
    let inventory = await getInventory();
    var items = []
    var itemIds = Object.values(inventory);
    itemIds = [...new Set(itemIds)]

    const blacklist = config.ROLIMONS.offerblacklist.replace('[', '')
        .replace(']', '')
        .replaceAll(' ', '')
        .split(",")

    itemIds = itemIds.filter( x => !blacklist.includes(`${x}`) )

    while (items.length < 4) {
        var item = itemIds[Math.floor(Math.random()*itemIds.length)];
        items.push(item)
        items = [...new Set(items)]
    }
    return(items)
}

//Makes the array of items to request in the trade ad
const makeRequest = async (offerTotal) => {
    var requestInput = config.ROLIMONS.request.replace('[', '')
        .replace(']', '')
        .replaceAll(' ', '')
        .split(",")

    var request = []
    for (const element of requestInput) {
        if (!isNaN(element)) {
            request.push(element)
        }

        if (element == 'random') {
            request.push(await randomDemandItem(offerTotal))
        }
    };
    return(request)
}

//Makes the array of tags to request in the trade ad
const makeTags = () => {
    var tagsInput = config.ROLIMONS.requesttags.replace('[', '')
        .replace(']', '')
        .replaceAll(' ', '')
        .split(",")
    
    var tags = []
    for (const element of tagsInput) {
        tags.push(element)
    }
    return(tags)
}

//Makes the array of items to offer in the trade ad
const makeOffer = async () => {
    var offerInput = config.ROLIMONS.offer.replace('[', '')
        .replace(']', '')
        .replaceAll(' ', '')
        .split(",")

    var offer = []
    const randomItems = await randomItem()
    for (const element of offerInput) {
        if (!isNaN(element)) {
            offer.push(element)
        }

        if (element == 'random') {
            offer.push(`${randomItems[offer.length]}`)
        }
    };
    return(offer)
}

//Turn array into string that is accepted by rolimons
const arrayToString = async (array) => {
    var string = ''
    for (element in array) {
        string = `${string},${array[element]}`
    }
    string = string.slice(1)
    return string
}

//Main function to post trade ad
const postAd = async () => {
    const offer = await makeOffer()
    const offerTotal = await findWorth(offer)
    var offerString = await arrayToString(offer)

    var request = await makeRequest(offerTotal)
    var requestString = await arrayToString(request)
 
    var tags = makeTags()
    var tagsString = ""
    for (element in tags) {
        tagsString = `${tagsString},"${tags[element]}"`
    }
    tagsString = `[${tagsString.slice(1)}]`

    if (tagsString.length < 6) {tagsString = '[]'}
    if (tags[0].length < 3) {tags = []}
    if (request[0].length < 3) {request = []}

    if (request.length + tags.length > 4) {
        print('TOO MANY TRADE ADD REQUEST/TAGS (You can only have a total of 4 items and tags in your trade ad request)', 'red')
        return
    }

    const body = `{"player_id":${config.AUTHENTICATION.robloxid},"offer_item_ids":[${offerString}],"request_item_ids":[${requestString}],"request_tags":${tagsString}}`
    const headers = {"Content-Type": "application/json","cookie": `_RoliVerification=${config.AUTHENTICATION.rolicookie}`}
    await fetch(`https://www.rolimons.com/tradeapi/create`,{method: 'POST', headers: headers, body: body}).then(async res => {
        const resp = await res.json()

        if (resp.success == true || res.status == 201) {
            print('Succesfully posted trade ad to Rolimons!', 'blue')
            return
        }

        if (!resp || !resp.message) {
            print(`Something went wrong while trying to post trade ad. Status code: ${res.status}`, 'red')
            return
        }

        if (resp.success == false) {
            if (resp.message.includes('value exceeds')) {
                setTimeout(function() {
                    postAd();
                }, 3000);
                return
            }
            print(`Something went wrong while trying to post trade ad. Message: ${resp.message}`, 'red')
            return
        }
    })
}

module.exports = {
    postAd
}