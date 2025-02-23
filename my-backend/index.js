

const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");


const geminiKey = "AIzaSyAK4R5qLqSepA7yXI5IB9kHMXWahAZEN0A"; 

const genAI = new GoogleGenerativeAI(geminiKey);

const app = express();
app.use(cors());
app.use(express.json());

const googleKey = process.env.GOOGLE_MAPS_KEY;

function ensureString(maybeText) {

  if (typeof maybeText === "string") {
    return maybeText;
  }

  if (
    maybeText &&
    typeof maybeText === "object" &&
    maybeText.parts &&
    maybeText.parts[0] &&
    typeof maybeText.parts[0].text === "string"
  ) {
    return maybeText.parts[0].text;
  }


  console.log("ensureString: No string found in", maybeText);
  return "";
}


function extractJsonBlock(maybeText) {
  const text = ensureString(maybeText);


  if (!text) return null;

  const match = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (!match) return null;
  return match[1].trim();
}

function parseStoresFromCodeBlock(text) {
  const jsonString = extractJsonBlock(text);
  if (!jsonString) return null;

  let data;
  try {
    data = JSON.parse(jsonString);
  } catch (err) {
    console.error("Could not parse extracted JSON:", err);
    return null;
  }

  if (!data.PossibleStores) return data; 

  const result = {};
  for (const storeName in data.PossibleStores) {
    const info = data.PossibleStores[storeName];
    result[storeName] = {
      address: info.address,
      price: info.price,
      "short-description": info["short-description"]
    };
  }
  return result;
}

app.post("/api/cheapest-item", async (req, res) => {
  const { latitude, longitude, item } = req.body;
  console.log("Received from front end:", latitude, longitude, item);

  if (!latitude || !longitude || !item) {
    return res.status(400).json({ error: "Missing latitude, longitude, or item." });
  }

  try {
    const placesUrl = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
    const placesResp = await axios.get(placesUrl, {
      params: {
        key: googleKey,
        location: `${latitude},${longitude}`,
        radius: 5000,
        keyword: "grocery store"
      }
    });

    let stores = placesResp.data.results || [];
    stores = stores.slice(0, 10);
    if (!stores.length) {
      return res.json({ error: "" });
    }


    let storeListText = "";
    for (const s of stores) {
      const addr = s.vicinity || s.formatted_address || "can't find address"; storeListText += `Store Name: ${s.name}, Address: ${addr}\n`;
    }

 
    const promptText = `
Find me the cheapest "${item}" near (${latitude}, ${longitude}).
We have these stores:
${storeListText}

Even if you do not have real-time data, produce a JSON code block with placeholder prices for each store in the following format:

\`\`\`json
{
  "PossibleStores": {
    "StoreName": {
      "address": "...",
      "price": 0,
      "short-description": "...",
      "lat": 0,
      "lng": 0
    },
    ...
  }
}
\`\`\`

Do not provide disclaimers or instructions; simply return the code block above with approximate or placeholder data for each store. 
`;


  
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const rawResponse = await model.generateContent(promptText);
    const topResp = rawResponse?.response;
    if (!topResp) {
      return res.json({ error: "No top-level response from Gemini", rawResponse });
    }

    if (!topResp.candidates || !topResp.candidates.length) {
      return res.json({ error: "Gemini returned no candidates", geminiResponse: topResp });
    }

    const candidate = topResp.candidates[0];
    let gemText = "";

    // this won't work
    if (typeof candidate.text === "function") {
      gemText = await candidate.text();
    } else {
      gemText = candidate.output || candidate.content || "";
    }

    if (!gemText) {
      return res.json({
        error: "Gemini response is empty or missing text", geminiResponse: topResp
      });
    }

  
    const storeData = parseStoresFromCodeBlock(gemText);
    if (!storeData) {
      return res.json({
        error: "Could not parse store data from code block", rawText: gemText
      });
    }

    // json output -- change it
    return res.json(storeData);

  } catch (err) {
    console.error("Error in /api/cheapest-item route:", err.message);
    return res.status(500).json({ error: "Failed to get cheapest item data." });
  }
});


const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
