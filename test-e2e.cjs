const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    console.log("Navigating to http://localhost:5177/boodschappen-lijst/");
    await page.goto('http://localhost:5177/boodschappen-lijst/', { timeout: 60000 });
    console.log("Navigation complete.");
    await page.screenshot({ path: 'screenshot.png' });

    // --- Test 1: Create a new list ---
    const newListName = "My Test List";
    console.log(`\n--- Running Test 1: Create new list "${newListName}" ---`);
    await page.waitForSelector('input[type="text"]', { timeout: 60000 });
    console.log("Input field found.");
    await page.fill('input[type="text"]', newListName);
    await page.click('button:has-text("Lijst Aanmaken")');
    await page.waitForSelector(`h3:has-text("${newListName}")`);
    console.log("SUCCESS: List created successfully.");

    // --- Test 2: Create a duplicate list ---
    console.log(`\n--- Running Test 2: Create duplicate list "${newListName}" ---`);
    await page.fill('input[type="text"]', newListName);
    await page.click('button:has-text("Lijst Aanmaken")');
    await page.waitForSelector(`text=Een lijst met de naam "${newListName}" bestaat al.`);
    console.log("SUCCESS: Duplicate list error message shown.");

    // --- Test 3: Delete the list ---
    console.log(`\n--- Running Test 3: Delete list "${newListName}" ---`);
    await page.click(`button[title="Verwijderen"]`);
    await page.waitForSelector(`text=Lijst "${newListName}" is verwijderd.`);
    const listExists = await page.isVisible(`h3:has-text("${newListName}")`);
    if (!listExists) {
        console.log("SUCCESS: List deleted successfully.");
    } else {
        console.error("FAILURE: List was not deleted.");
    }

    await browser.close();
    console.log("\n--- Test complete ---");
    process.exit(0);
})();
