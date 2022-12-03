// import * as PushAPI from "@pushprotocol/restapi";
// import * as ethers from "ethers";
require('dotenv').config()
const PushAPI = require("@pushprotocol/restapi")
const ethers = require('ethers');

const PK = process.env.EPNS_CHANNEL_PRIVATE_KEY; // channel private key
const Pkey = `0x${process.env.PK}`;
const signer = new ethers.Wallet(Pkey);

const sendNotification = async () => {
  try {
    const apiResponse = await PushAPI.payloads.sendNotification({
      signer,
      type: 3, // target
      identityType: 2, // direct payload
      notification: {
        title: `[SDK-TEST] notification TITLE:`,
        body: `[sdk-test] notification BODY`
      },
      payload: {
        title: `[sdk-test] payload title`,
        body: `sample msg body`,
        cta: 'https://t.me/codeswim',
        img: ''
      },
      recipients: 'eip155:5:0x6503202D2d8C4e9B3cAc7b4509102c0053f7EafE', // recipient address
      channel: 'eip155:5:0x6503202D2d8C4e9B3cAc7b4509102c0053f7EafE', // your channel address
      env: 'staging'
    });

    // apiResponse?.status === 204, if sent successfully!
    console.log('API repsonse: ', apiResponse);
  } catch (err) {
    console.error('Error: ', err);
  }
}

sendNotification();
