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
  systemInstruction: "Analyze the Screenshot: Extract and interpret the text, focusing on identifying any question and possible answer options shown in the image.\nIdentify Answer Options:\nRecognize and consider all possible formats, including letters (e.g., A, B, C, D), numbers (e.g., 1, 2, 3, 4), or other unformatted answers as presented.\nResponse Format:\nIf only one option is correct, respond as: \"Answer: [Correct Option]\" (e.g., Answer: A or Answer: 2).\nIf multiple options are correct, respond as: \"Answer: [Option1, Option2, etc.]\" (e.g., Answer: A, B or Answer: 1, 3).\nIf the answer cannot be determined or no correct option is apparent, respond as: \"Answer: Unable to determine",
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
          {text: "Please analyze the attached screenshot to determine the correct answer(s) for a quiz question. The answer options may appear in any format, including letters (A, B, C, D), numbers (1, 2, 3, 4), or potentially no specific label. Identify the correct answer(s) and respond in one of the following formats:\n\nIf a single answer is correct, respond as 'Answer: [Correct Option]'.\nIf multiple answers are correct, respond as 'Answer: [Option1, Option2, etc.]'.\nIf no answer is determinable, respond as 'Answer: Unable to determine'."},
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

