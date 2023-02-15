//hi

const {print} = require('./files/print')
const config = require('./files/config').config()
const {postAd} = require('./files/adposter')
const {getUsername} = require('./files/roblox')
const {startBot, takeScreenshot} = require('./files/discord')
const {checkWhitelist} = require('./files/validate')

const notWhitelisted = async () => { 
    print('Not whitelisted', 'red')
    setInterval(notWhitelisted, 60 * 60 * 1000)
}

const main = async () => {
    const whitelist = await checkWhitelist()
    if (!whitelist == true) {
        await notWhitelisted()
        return
    }
    print(`Welcome back ${await getUsername()}!`, 'green')
    if (config.ROLIMONS.rolienabled) {
        const interval = config.ROLIMONS.rolimonsinterval
        postAd()
        setInterval(postAd, interval * 1000)
    }
    if (config.DISCORD.discordenabled) {
        const interval = config.DISCORD.discordinterval
        await startBot()
        takeScreenshot()
        setInterval(takeScreenshot, interval * 1000)
    }
}

main()