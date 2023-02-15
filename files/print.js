const chalk = require('chalk');

//cool colours with a timestamp
const print = (text, colour) => {
    if (colour == 'grey') {
        text = chalk.hex('#757575')(text)
    }
    if (colour == 'blue') {
        text = chalk.hex('#3C91FF')(text)
    }
    if (colour == 'red') {
        text = chalk.hex('#FF4545')(text)
    }
    if (colour == 'green') {
        text = chalk.hex('#64FF45')(text)
    }
    if (colour == 'purple') {
        text = chalk.hex('#6745FF')(text)
    }
    const time = chalk.hex('#757575')(`[${new Date().toLocaleTimeString()}]`)
    text = `${time} ${text}`
    console.log(text)
}

module.exports = {
    print
}