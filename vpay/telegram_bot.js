require('dotenv').config()
const { Telegraf } = require('telegraf');

const PushAPI = require("@pushprotocol/restapi")
const ethers = require('ethers');

const PK = process.env.EPNS_CHANNEL_PRIVATE_KEY; // channel private key
const Pkey = `0x${PK}`;
const signer = new ethers.Wallet(Pkey);

const { storedAddresses } = require('./stored_addresses');

const bot = new Telegraf(process.env.TELEGRAM_BOT_ID)

bot.start((ctx) => {
    ctx.reply('Bot has Started \n /help');
})

bot.hears('hello', (ctx) => {
    ctx.reply('Hey there, welcome to vPay!')
})

bot.command('pay', async (ctx) => {
    const msg = ctx.message.text;
    const otp = Math.floor(1000 + Math.random() * 9000)

    try {
        const msgArray = msg.split(' ')
        const requestedUser = msgArray[1].substr(1) // @codeswim -> codeswim
        // const amount = msgArray[2]

        if (requestedUser in storedAddresses) {
            const relatedAddress = storedAddresses[requestedUser]
            const pushFormattedReceiverAddress = `eip155:5:${relatedAddress}`
            const duneFormattedUrl = `https://dune.com/nccb/ETH-Address?1.+Eth+Address_t82ee2=${relatedAddress}`

            const outputString = `The current address linked with <b>${requestedUser}</b> is:`
            ctx.replyWithHTML(outputString)
            ctx.replyWithHTML(`<i>${relatedAddress}</i>`)
            ctx.replyWithHTML(`vPay has notified ${requestedUser} on their wallet address and they should respond back to you shortly on Telegram with the confirmation code: ${otp}`)
            ctx.replyWithHTML(`Meanwhile, checkout their account history and stats at ${duneFormattedUrl}`)

            try {
                // send EPNS push notification to receiver
                const apiResponse = await PushAPI.payloads.sendNotification({
                    signer,
                    type: 3, // target
                    identityType: 2, // direct payload
                    notification: {
                        title: `vPay: Confirm Wallet Address`,
                        body: `Your friend has requested confirmation of this wallet address. Respond with verification code: ${otp}`
                    },
                    payload: {
                        title: `vPay: Confirm Wallet Address`,
                        body: `Your friend has requested confirmation of this wallet address. Respond with verification code: ${otp}`,
                        cta: `https://t.me/${requestedUser}`,
                        img: 'https://dynamic.brandcrowd.com/preview/logodraft/6dd9e226-2497-41ae-a329-a38985bcdfc0/image/large.png'
                    },
                    recipients: pushFormattedReceiverAddress, // recipient address
                    channel: process.env.EPNS_CHANNEL_ID, // your channel address
                    env: 'staging'
                });

                console.log('API repsonse: ', apiResponse);
            } catch (err) {
                console.error('Error: ', err);
            }
        } else {
            const outputString = `${requestedUser} hasn't linked their wallet address. We have pinged ${requestedUser} to link it.`
            ctx.replyWithHTML(outputString)
        }
    } catch (e) {
        ctx.replyWithHTML('<b>Oops!</b> \n\nSomething went wrong')
    }
})

bot.help((ctx) => {
    ctx.replyWithHTML('<b>Welcome to vPay!</b> \n\nUsage: /pay <b>@receiverHandle amount eth</b>')
})

bot.use((ctx) => {
    ctx.replyWithHTML("<b>Invalid Command!</b> \n\nUse /help");
})

bot.launch()
