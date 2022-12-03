const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
require('dotenv').config()

const { storedAddresses } = require('./stored_addresses')

console.log(storedAddresses);

const bot = new Telegraf(process.env.TELEGRAM_BOT_ID)

bot.start((ctx) => {
    ctx.reply('Bot has Started \n /help');
})

bot.hears('hello', (ctx) => {
    ctx.reply('Hello! Welcome to VPay')
})

bot.command('pay', async (ctx) => {
    const msg = ctx.message.text;

    try {
        msgArray = msg.split(' ')
        const requestedUser = msgArray[1]
        const amount = msgArray[2]

        console.log('log: ', msg, msgArray);

        var outputString;

        if (requestedUser in storedAddresses) {
            const relatedAddress = storedAddresses[requestedUser]
            outputString = `The current address registered with user <b>${requestedUser}</b> is \n\n <i>${relatedAddress}</i>`
        } else {
            outputString = `${requestedUser} is not registered with us, please verify the address once. We have pinged ${requestedUser} to register with us.`
        }
        ctx.replyWithHTML(outputString)
    } catch (e) {
        ctx.replyWithHTML('<b>Oops!</b> \n\n Something went wrong')
    }


    // await axios.get()
    //     .then(response => {
    //         if(response.data){
    //             //console.log(nameOut, priceOut, marketCapOut, supplyOut, dexOut, launchDateOut)
    //             outputString = `<b>Token Name :</b> ${nameOut} \n<b>Token Price :</b> $${priceOut} \n  \n<b>Market Cap :</b> $${marketCapOut} \n<b>Total Supply :</b> ${supplyOut} \n\n<b>Buy/Sell :</b> https://info.uniswap.org/tokens#/tokens/${dexOut} \n  \n<b>Launch Date[yyyy-mm-dd] :</b> ${launchDateOut}`  
    //             ctx.replyWithHTML(outputString)
    //         }
    //     })
    //     .catch(err => {
    //         ctx.replyWithHTML('<b>Oops!</b> \n\n Something went wrong')
    //     })  
})

// bot.command('')

bot.help((ctx) => {
    ctx.replyWithHTML('<b>Welcome to VPay!!!</b> \n\nUse /pay <b>@receiverHandle amount</b>')
})

bot.use((ctx) => {
    ctx.replyWithHTML("<b>Invalid Command!!</b> \n\nUse /help");
})


bot.launch()
