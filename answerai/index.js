const screenshot = require('screenshot-desktop');
const notifier = require('node-notifier');

async function captureDesktopScreenshot(outputPath) {
  try {
    // Capture the screenshot and save it to the specified path
    await screenshot({ filename: outputPath });
    console.log(`Screenshot saved at ${outputPath}`);

    // Show a desktop notification
    notifier.notify({
      title: 'Screenshot Captured',
      message: 'Your screenshot has been saved successfully!',
      sound: true,
      wait: true
    });

    // No need to call notification.close() since we can't control it
    // System will handle the dismissal after a certain period

  } catch (error) {
    console.error('Error capturing screenshot:', error);
  }
}

// Example usage
captureDesktopScreenshot('desktop_screenshot.png');
