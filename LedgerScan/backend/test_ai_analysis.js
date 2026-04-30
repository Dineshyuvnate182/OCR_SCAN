require('dotenv').config();
const { analyzeWithAI } = require('./utils/aiAnalyzer');

async function testVerticalPattern() {
    const rawText = `--- Page 1 ---
Name
prn
salary
Sagar
1
350000
Rupesh
2
750000
Mayur
3
900000`;

    console.log("Testing with vertical list pattern...");
    try {
        const result = await analyzeWithAI(rawText);
        console.log("AI Result:");
        console.log(JSON.stringify(result, null, 2));
        
        if (result.headers && result.headers.length === 3 && result.rows && result.rows.length === 3) {
            console.log("\n✅ SUCCESS: AI correctly identified 3 columns and 3 rows.");
        } else {
            console.log("\n❌ FAILURE: AI did not structure the data as expected.");
        }
    } catch (err) {
        console.error("Test failed with error:", JSON.stringify(err, null, 2));
        if (err.response) console.error("Response data:", err.response.data);
    }
}

testVerticalPattern();
