const { Client } = require('discord.js-selfbot-v13');
const puppeteer = require('puppeteer');
const { scrollPageToBottom } = require('puppeteer-autoscroll-down')
const {print} = require('./print')
const config = require('./config').config()

const client = new Client({
    checkUpdate: false, 
});

//wait function in seconds
const sleep = async (seconds) => {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

//check if a channel with channelName exists in given guild
const channelExists = async (guild, channelName) => {
    const channel = guild.channels.cache.find(chan => chan.name === channelName);
    if (channel !== undefined) {return channel}
    return false
}

//make sure a user exists in the bot its dms by id
const userExists = async (id) => {
    const user = client.users.cache.get(id)
    if (user !== undefined) {return user}
    return false
}

//stuff to do when theres new message in dms or the server
client.on('messageCreate', async msg => {
    let guild = client.guilds.cache.get(config.AUTHENTICATION.serverid)
    if (msg.guild == null && msg.author.id !== config.AUTHENTICATION.botid) {
        var message = `**${msg.author.username}**: ${msg.content}`
        const files = msg.attachments.first()?.url

        if (files) {
            message = `${message} ${files}`
        }
        
        //for some reason bots still cant send messages over 2000 characters
        if (message.length > 1900) {
            print('Received DM with more than 2000 characters, can not forward this', 'red'); 
            return
        }

        var channel = await channelExists(guild, msg.author.id)
        if (channel !== false) {
            try{
                await client.channels.cache.get(channel.id).send(message)
            }
            catch{
                print('Could not send message in existing channel, make sure the bot still had permissions', 'red'); 
                return
            }
            print(`New DM from ${msg.author.username}`, 'grey')
            return
        }

        //make new channel and send some messages, really ugly looking code that idk how to clean up
        try {
            await guild.channels.create(msg.author.id, { reason: 'New DM' })
            .then(async newChannel => {
                await newChannel.send(`New DM with **${msg.author.tag}** <@${config.AUTHENTICATION.discordid}>`)
                await newChannel.send(message)
                print('Received new DM and made new channel', 'purple')

                if (config.DISCORD.autoreply = true) {
                    await sleep(5)
                    msg.channel.sendTyping()
                    await sleep(config.DISCORD.reply.length/4)
                    msg.channel.send(config.DISCORD.reply)
                    await newChannel.send(`**AUTOREPLY**: ${config.DISCORD.reply}`)
                }
                return
            })
        }catch(error) {
            console.log(error); print('Could not create new channel upon receiving new DM, make sure the bot has permissions in your server', 'red'); 
            return
        }
    }

    //forward your messages in the server to the users in dms
    if (msg.guild == guild && msg.author.id == config.AUTHENTICATION.discordid && !isNaN(msg.channel.name)) {
        const user = await userExists(msg.channel.name)
        if (user !== false) {
            try{
                await user.send(msg.content)
            }catch(error){
                console.log(error); print('Something went wrong while trying to reply to DM', 'red'); 
                return
            }
            print('Replied to DM', 'grey')
        }
    }
})

//posts your screenshot in #trade-advertisements
const postScreenshot = async () => {
    try {
        await client.channels.cache.get('442709710408515605').send({files: [`./roli.png`], content: config.DISCORD.message })
    } 
    catch{
        print('Could not post screenshot in rolimons discord, make sure account is in rolimons server and has permission to post in #trade-advertisements','red'); 
        return
    }
    print('Posted screenshot & message in #trade-advertisements!', 'purple')
}

//function that takes screenshot of your inventory
const takeScreenshot = async () => {
    //opens a new chromium instance
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        await page.goto(`https://www.rolimons.com/player/${config.AUTHENTICATION.robloxid}`);
    } catch{
        print('Something went wrong while trying to open your rolimons page', 'red'); 
        return
    }
    await page.setViewport({
        width: 1920,
        height: 1080
    })
    await sleep(1)
    
    //delete the enormous cookie popup on rolimons that covers the screen
    let cookiePrompt = "#ncmp__tool";
    await page.evaluate((selector) => {
        var elements = document.querySelectorAll(selector);
        for(var i=0; i< elements.length; i++){
            elements[i].parentNode.removeChild(elements[i]);
        }
    }, cookiePrompt)

    //scroll down to inventory
    await scrollPageToBottom(page, {
        size: 500,
        delay: 250
    })
    await sleep(1)

    //wait for everything to load
    var element
    try {
        await page.waitForSelector('#mix_container');          
        element = await page.$('#mix_container');    
    }catch{
        print('Something went wrong while trying to load your rolimons page', 'red'); 
        return
    }    
    
    await element.screenshot({path: `roli.png`});
    await browser.close();
    print('Took new screenshot of inventory', 'grey')
    await postScreenshot()
}

//log in and start up the discord account, genuinely no idea what the proper way to do this would be but it works
const startBot = async () => new Promise(resolve => {
    client.on('ready', async () => {
        client.user.setStatus('invisible');
        print(`Logged into discord account ${client.user.tag}`, 'grey');
        resolve()
    })
    client.login(config.AUTHENTICATION.bottoken);
})

module.exports = {
    startBot, takeScreenshot
}

