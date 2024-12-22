const crypto = require("crypto");
var express = require("express");
var router = express.Router();

const axios = require("axios");
const merchantKey = ""; //TODO - replace with value provided in merchant dashboard
const authenticityToken = ""; //TODO - replace with value provided in merchant dashboard
const BASE_URL = "https://ipgtest.monri.com";

router.get("/", async function (req, res, next) {
  var body = JSON.stringify({
    transaction_type: "purchase",
    amount: 30,
    currency: "BAM",
    number_of_installments: "",
    order_number: "6638614b544b7058414b5467304146574c647841",
    order_info: "Order info",
    language: "hr",
    ch_full_name: "John Doe",
    ch_address: "Elm street 22",
    ch_city: "Orgrimmar",
    ch_zip: "q123abc99",
    ch_country: "US",
    ch_phone: "123456",
    ch_email: "john.doe@email.com",
    comment: "",
    supported_payment_methods: [
      "fa603bc5007cc9c0527cf8e940364335129966b60e502390",
    ],
  });

  const PATH = `${BASE_URL}/v2/terminal-entry/create-or-update`;

  const crypto = require("crypto");
  var fullpath = `/v2/payment/new`;
  var body = JSON.stringify({
    example: "1",
  });
  var timestamp = new Date().getTime(); // If you are using this as an example replace exact value with call to eg (new Date()).getTime()

  var digest = crypto
    .createHash("sha512")
    .update(merchantKey + timestamp + authenticityToken + fullpath + body)
    .digest("hex");

  const data = await axios
    .post(PATH, body, {
      headers: {
        "Content-Type": "application/json",
        "authenticity-token": authenticityToken,
        Accept: "application/json",
        digest,
        schema: "WP3-v2.1",
        timestamp,
      },
    })
    .catch((error) => {
      console.log(error.response.data);
    });

  https: res.send(
    `respond with a resource <br> TIMESTAMP: ${timestamp} <br> DIGEST: ${digest} <br> DATA: ${data}`
  );
});

module.exports = router;
