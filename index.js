require('dotenv').config();
const screenshot = require('screenshot-desktop');
const notifier = require('node-notifier');
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

/**
 * Uploads the given file to Gemini.
 *
 * See https://ai.google.dev/gemini-api/docs/prompting_with_media
 */
async function uploadToGemini(path, mimeType) {
  const uploadResult = await fileManager.uploadFile(path, {
    mimeType,
    displayName: path,
  });
  const file = uploadResult.file;
  console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
  return file;
}

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro-002",
  systemInstruction: "Your job is to provide only correct answers along with the option numbers. If the response is long, please make it concise.",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

async function run() {

  await captureDesktopScreenshot('./images/quiz.png');

  // TODO Make these files available on the local file system
  // You may need to update the file paths
  const files = [
    await uploadToGemini("./images/quiz.png", "image/png"),
  ];

  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          {
            fileData: {
              mimeType: files[0].mimeType,
              fileUri: files[0].uri,
            },
          },
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
  console.log(result.response.text());
      // Show a desktop notification
      notifier.notify({
        title: 'Answer',
        message: result.response.text(),
        sound: true,
        wait: true
      });
}

async function captureDesktopScreenshot(outputPath) {
  try {
    // Capture the screenshot and save it to the specified path
    await screenshot({ filename: outputPath });
    console.log(`Screenshot saved at ${outputPath}`);





  } catch (error) {
    console.error('Error capturing screenshot:', error);
  }
}


//captureDesktopScreenshot('./images/quiz.png');
run();

