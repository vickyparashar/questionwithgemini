require('dotenv').config();
const clipboardy = require('clipboardy');
const notifier = require('node-notifier');
const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro-002",
    systemInstruction: "Interpret the User Query: Understand the user’s request and focus on the core task or question.\nProvide a Concise and Direct Response: Respond as clearly and succinctly as possible, without unnecessary details. If the query has multiple parts, address each part briefly but accurately.\nAvoid Extra Information: Do not include any information that is not directly relevant to the question or task at hand.\nUse Clear Formatting: If needed, use bullet points or numbered lists for clarity, but always keep the response short.",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  
  async function run() {
    const chatSession = model.startChat({
      generationConfig,
      history: [
      ],
    });
    const clipboardText = clipboardy.readSync();
    const result = await chatSession.sendMessage(clipboardText);
    clipboardy.writeSync(result.response.text());
    console.log(result.response.text());
    notifier.notify({
        title: 'Answer',
        message: 'Good',
        sound: true,
        wait: true
      });
  }
  
  run();