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
    ctx.reply('Hello! Welcome to VPay')
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

            const outputString = `The current address registered with user <b>${requestedUser}</b> is:`
            ctx.replyWithHTML(outputString)
            ctx.replyWithHTML(`<i>${relatedAddress}</i>`)
            ctx.replyWithHTML(`Expected OTP: ${otp}`)
            ctx.replyWithHTML(`If they are not responding with OTP, feel free to visit their account history at ${duneFormattedUrl}`)

            try {
                // send EPNS push notification to receiver
                const apiResponse = await PushAPI.payloads.sendNotification({
                    signer,
                    type: 3, // target
                    identityType: 2, // direct payload
                    notification: {
                        title: `[SDK-TEST] notification TITLE:`,
                        body: `Please enter the OTP ${otp}`
                    },
                    payload: {
                        title: `[sdk-test] payload title`,
                        body: `sample msg body`,
                        cta: `https://t.me/${requestedUser}`,
                        img: ''
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
            const outputString = `${requestedUser} is not registered with us, please verify the address once. We have pinged ${requestedUser} to register with us.`
            ctx.replyWithHTML(outputString)
        }
    } catch (e) {
        ctx.replyWithHTML('<b>Oops!</b> \n\n Something went wrong')
    }
})

bot.help((ctx) => {
    ctx.replyWithHTML('<b>Welcome to VPay!!!</b> \n\nUse /pay <b>@receiverHandle amount</b>')
})

bot.use((ctx) => {
    ctx.replyWithHTML("<b>Invalid Command!!</b> \n\nUse /help");
})

bot.launch()
