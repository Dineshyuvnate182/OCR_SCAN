require('dotenv').config();
const axios = require('axios');

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    
    console.log(`Checking models at ${url.split('?')[0]}`);
    try {
        const res = await axios.get(url);
        console.log("✅ Success! Models found:", res.data.models.map(m => m.name));
    } catch (err) {
        console.error("❌ Failed:", err.response ? err.response.status : err.message);
        if (err.response) console.error("Error data:", JSON.stringify(err.response.data, null, 2));
    }
}

listModels();
