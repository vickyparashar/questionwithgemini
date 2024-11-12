require('dotenv').config();
const { exec } = require('child_process');
const util = require('util');
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
        history: [],
    });

    // Get clipboard text
    try {
        const clipboardText = await getClipboard();
        console.log(clipboardText);

        // Send message to Gemini AI and get response
         const result = await chatSession.sendMessage(clipboardText);
         const responseText = result.response.text();
   

        //const responseText="A large, predatory cat native to Africa and India, known for its mane (in males).";
        // Set the response back to clipboard
       // require('child_process').spawn('clip').stdin.end(util.inspect(responseText));
        console.log('Response Text:', responseText);
        // Show notification
        notifier.notify({
            title: 'Answer',
            message: 'Done',
            sound: true,
            wait: true
        });
    } catch (error) {
        console.error('Error in processing:', error);
    }
}



// Get text from clipboard (Windows using PowerShell)
function getClipboard() {
    return new Promise((resolve, reject) => {
        exec('powershell Get-Clipboard -Raw', (err, stdout, stderr) => {
            if (err) {
                reject('Error getting clipboard: ' + stderr);
            } else {
                resolve(stdout.trim());  // Return the clipboard text
            }
        });
    });
}




run();
