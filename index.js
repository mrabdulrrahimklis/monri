const crypto = require("crypto");
var express = require("express");
var router = express.Router();

const axios = require("axios");
const merchantKey = ""; //TODO - replace with value provided in merchant dashboard
const authenticityToken = ""; //TODO - replace with value provided in merchant dashboard
const BASE_URL = "https://ipgtest.monri.com";

router.get("/", async (req, res) => {
  try {
    // Define body parameters (modify according to your requirements)
    const body = {
      transaction_type: "purchase",
      amount: 3000, // Amount in minor units (e.g., 30.00 = 3000)
      currency: "BAM",
      order_number: "6638614b544b7058414b5467304146574c647841", // Unique
      order_info: "Order info",
      language: "hr",
      ch_full_name: "John Doe",
      ch_address: "Elm street 22",
      ch_city: "Orgrimmar",
      ch_zip: "q123abc99",
      ch_country: "US",
      ch_phone: "123456",
      ch_email: "john.doe@email.com",
      supported_payment_methods: [
        "fa603bc5007cc9c0527cf8e940364335129966b60e502390",
      ],
    };

    const path = "/v2/payment/new";
    const fullPath = BASE_URL + path;

    // Generate timestamp
    const timestamp = Math.floor(Date.now() / 1000); // Use seconds as per Unix format

    // Digest generation
    const digestString =
      merchantKey + timestamp + authenticityToken + path + JSON.stringify(body);

    const digest = crypto
      .createHash("sha512")
      .update(digestString)
      .digest("hex");

    // POST request
    const response = await axios.post(fullPath, body, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `WP3-v2.1 ${authenticityToken} ${timestamp} ${digest}`,
      },
    });

    res.status(200).json({
      message: "Payment created successfully",
      response: response.data,
    });
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );

    res.status(error.response?.status || 500).json({
      message: "Failed to create payment",
      error: error.response?.data || error.message,
    });
  }
});

module.exports = router;
