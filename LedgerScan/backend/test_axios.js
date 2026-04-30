require('dotenv').config();
const axios = require('axios');

async function testDirectAxios() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${key}`;
    
    console.log(`Testing direct Axios call to ${url.split('?')[0]}`);
    try {
        const res = await axios.post(url, {
            contents: [{ parts: [{ text: "hi" }] }]
        });
        console.log("✅ Success!", res.data);
    } catch (err) {
        console.error("❌ Failed:", err.response ? err.response.status : err.message);
        if (err.response) console.error("Error data:", JSON.stringify(err.response.data, null, 2));
    }
}

testDirectAxios();
