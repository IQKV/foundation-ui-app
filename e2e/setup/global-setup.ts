import { chromium, type FullConfig } from "@playwright/test";

/**
 * Global setup that runs once before all tests
 */
async function globalSetup(config: FullConfig) {
  console.log("🚀 Starting global test setup...");

  // Launch browser to warm up and verify the app is accessible
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Check if the dev server is running
    const baseURL = config.projects[0].use.baseURL || "http://localhost:5173";
    console.log(`📡 Checking if app is accessible at ${baseURL}`);

    await page.goto(baseURL, { waitUntil: "networkidle", timeout: 60000 });

    // Verify the app loaded correctly
    const title = await page.title();
    console.log(`✅ App loaded successfully. Title: ${title}`);

    // Check if React app is rendered
    const reactRoot = await page.locator("#root").count();
    if (reactRoot === 0) {
      throw new Error("React app root element not found");
    }

    console.log("✅ React app is properly rendered");
  } catch (error) {
    console.error("❌ Global setup failed:", error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log("✅ Global setup completed successfully");
}

export default globalSetup;
