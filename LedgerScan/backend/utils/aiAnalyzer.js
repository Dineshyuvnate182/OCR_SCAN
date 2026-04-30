const { GoogleGenAI } = require('@google/genai')
const fs = require('fs')
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

/**
 * Sends extracted OCR text to Gemini AI.
 * Gemini analyzes the data and returns a structured JSON suitable for Excel.
 * @param {string} extractedText - Raw text from PaddleOCR
 * @returns {Object} { headers: [...], rows: [[...], ...], title: "..." }
 */
const analyzeWithAI = async (extractedText) => {
  if (!extractedText || extractedText.trim().length === 0) {
    return { headers: ['Extracted Text'], rows: [['No text found']], title: 'Empty Document' }
  }

  const systemPrompt = `You are an intelligent data analyst. Your job is to analyze text extracted from a bill, invoice, ledger, or any document via OCR and return structured JSON data ready for an Excel spreadsheet.

Rules:
1. Identify the document type (bill, invoice, ledger, receipt, etc.)
2. Extract all structured data you can find.
3. OCR data can be messy (e.g. columns read out of order, headers at the bottom, or missing fields). You must intelligently align the data into correct columns based on context and data types.
4. If a row is missing a column value (like an ID), leave it as an empty string "" instead of shifting the other columns.
5. Create appropriate column headers based on the content (e.g., Suppno, Suppname, City, Amount).
6. Return ONLY valid JSON, no explanation, no markdown.

Return this exact JSON format:
{
  "title": "Document Type and Name",
  "headers": ["Column1", "Column2", "Column3"],
  "rows": [
    ["value1", "value2", "value3"],
    ["value4", "value5", "value6"]
  ],
  "summary": {
    "documentType": "invoice/ledger/receipt/other",
    "totalAmount": "if found",
    "date": "if found",
    "itemCount": 0
  }
}`

  const userPrompt = `Analyze this OCR-extracted text and return structured Excel data as JSON:

---
${extractedText}
---

Return ONLY the JSON object. No markdown, no explanation.`

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json'
    }
  })

  const rawText = response.text.trim()

  // Strip markdown code fences if present
  const cleaned = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()

  const parsed = JSON.parse(cleaned)
  return parsed
}

/**
 * Sends an image directly to Gemini AI for extraction and structuring.
 */
const analyzeImageDirectlyWithAI = async (filePath, mimeType) => {
  const systemPrompt = `You are an intelligent data analyst and OCR engine. Your job is to analyze the provided image of a bill, invoice, ledger, or document and return structured JSON data ready for an Excel spreadsheet.

Rules:
1. Identify the document type.
2. Extract all structured tabular and key-value data directly from the image.
3. Align the data into correct columns based on context.
4. If a row is missing a column value, leave it as an empty string "".
5. Create appropriate column headers based on the content.
6. Return ONLY valid JSON, no explanation, no markdown.

Return this exact JSON format:
{
  "title": "Document Type and Name",
  "headers": ["Column1", "Column2", "Column3"],
  "rows": [
    ["value1", "value2", "value3"],
    ["value4", "value5", "value6"]
  ],
  "summary": {
    "documentType": "invoice/ledger/receipt/other",
    "totalAmount": "if found",
    "date": "if found",
    "itemCount": 0
  }
}`

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      { text: "Analyze this document image and return structured Excel data as JSON:" },
      {
        inlineData: {
          data: fs.readFileSync(filePath).toString("base64"),
          mimeType: mimeType
        }
      }
    ],
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json'
    }
  })

  const rawText = response.text.trim()
  const cleaned = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
  const parsed = JSON.parse(cleaned)
  return parsed
}

module.exports = { analyzeWithAI, analyzeImageDirectlyWithAI }
