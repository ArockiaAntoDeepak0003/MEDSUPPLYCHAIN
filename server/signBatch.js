// server/signBatch.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { ethers } = require("ethers");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const ADMIN_PK = process.env.ADMIN_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0xCONTRACT_ADDRESS_REPLACE";

if (!ADMIN_PK) {
  console.error("ERROR: set ADMIN_PRIVATE_KEY in .env (wallet used to sign tokens)");
  process.exit(1);
}

const wallet = new ethers.Wallet(ADMIN_PK);

app.post("/api/signBatch", async (req, res) => {
  try {
    const { batch } = req.body;
    if (!batch) return res.status(400).json({ error: "missing batch in body" });

    // timestamp (seconds)
    const ts = Math.floor(Date.now() / 1000);

    // canonical payload string (must be exactly the same when verifying)
    const payload = JSON.stringify({ contract: CONTRACT_ADDRESS, batch, ts });

    // sign the payload with admin wallet
    const sig = await wallet.signMessage(payload);

    const tokenObj = { contract: CONTRACT_ADDRESS, batch, ts, sig };
    const token = Buffer.from(JSON.stringify(tokenObj)).toString("base64");

    return res.json({ token, tokenObj });
  } catch (err) {
    console.error("signBatch error", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Signer server running at http://localhost:${PORT}`));