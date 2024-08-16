const express = require("express");
const bodyParser = require("body-parser");
const verifySignature = require("./verifySignature.js");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  const isValid = verifySignature(req.body, req.headers);
  if (isValid) {
    try {
      const response = await axios.post("http://ruuter-public:8086/internal/jira/accept", {
        payload: req.body,
      });

      console.log("Response from helper URL:", response.data);
      return res.status(200).send("Webhook processed and forwarded");
    } catch (error) {
      console.error("Error talking to helper URL:", error);
      return res.status(500).send("Error processing webhook");
    }
  } else {
    return res.status(400).send("Invalid signature");
  }
});

const PORT = process.env.PORT || 3008;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
