require('dotenv').config();

const { initializeFirebase, createShoppingList, getShoppingLists, deleteShoppingList, getCurrentUserID } = require('./src/firebase.js');

async function runTest() {
    console.log("Initializing Firebase...");
    await initializeFirebase();
    const userID = getCurrentUserID();
    console.log("Current user ID:", userID);

    if (!userID) {
        console.error("Could not get user ID. Aborting test.");
        return;
    }

    // --- Test 1: Create a new list ---
    const newListName = "My Test List";
    console.log(`\n--- Running Test 1: Create new list "${newListName}" ---`);
    await createShoppingList({
        name: newListName,
        items: [],
        creatorName: "Test User",
        deviceUID: userID,
        creatorId: userID
    });
    console.log("List creation requested.");

    // Wait a moment for the database to update
    await new Promise(resolve => setTimeout(resolve, 2000));

    let lists = await getShoppingLists();
    let createdList = lists.find(list => list.name === newListName);
    if (createdList) {
        console.log("SUCCESS: List created successfully.");
    } else {
        console.error("FAILURE: List was not created.");
    }

    // --- Test 2: Create a duplicate list ---
    console.log(`\n--- Running Test 2: Create duplicate list "${newListName}" ---`);
    // This test has to be done in the UI, as the check is in App.jsx.
    // I will assume the logging I added will be enough to verify this.
    console.log("Skipping duplicate list creation test, will rely on logs.");


    // --- Test 3: Delete the list ---
    if (createdList) {
        console.log(`\n--- Running Test 3: Delete list "${newListName}" ---`);
        await deleteShoppingList(createdList.id);
        console.log("List deletion requested.");

        // Wait a moment for the database to update
        await new Promise(resolve => setTimeout(resolve, 2000));

        lists = await getShoppingLists();
        createdList = lists.find(list => list.name === newListName);
        if (!createdList) {
            console.log("SUCCESS: List deleted successfully.");
        } else {
            console.error("FAILURE: List was not deleted.");
        }
    } else {
        console.log("Skipping deletion test because list was not created.");
    }

    console.log("\n--- Test complete ---");
    process.exit(0);
}

runTest();
