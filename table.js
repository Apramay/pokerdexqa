function showGameSetup() {
    document.getElementById("setupForm").style.display = "block";
}

function createTable() {
    // Get user-defined settings
    const solToToken = parseInt(document.getElementById("solToToken").value) || 100;
    const smallBlind = parseInt(document.getElementById("smallBlind").value) || 10;
    const bigBlind = parseInt(document.getElementById("bigBlind").value) || 20;
    const gameType = document.getElementById("gameType").value; // Get selected game type

    // Calculate minimum and maximum buy-ins based on game type
    const minBuyIn = bigBlind * 10; // Minimum buy-in is always 10x the big blind
    let maxBuyIn = gameType === "limit" ? bigBlind * 100 : null; // Max buy-in for limit game, no limit for "No Limit"

    // Generate a unique table ID
    const tableId = Math.random().toString(36).substr(2, 8);
    
    // Store settings in localStorage with tableId as key
    localStorage.setItem(`table_${tableId}_settings`, JSON.stringify({
        solToToken,
        smallBlind,
        bigBlind,
        gameType,  // Store the game type
        minBuyIn,
        maxBuyIn   // Store the max buy-in (if applicable)
    }));

    // Call backend to register the table
    fetch("https://pokerdexqa-server.onrender.com/registerTable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId, solToToken, smallBlind, bigBlind, gameType, minBuyIn, maxBuyIn }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Table registered successfully!") {
            const tableUrl = `${window.location.origin}/pokerdexqa/game.html?table=${tableId}`;
            document.getElementById("tableUrl").value = tableUrl;
            document.getElementById("tableLink").style.display = "block";
        }
    })
    .catch(err => console.error("Error registering table:", err));
}
function joinTable() {
    const tableId = prompt("Enter the table ID:");
    if (tableId) {
        window.location.href = `${window.location.origin}/pokerdexqa/game.html?table=${tableId}`;
    }
}

function copyLink() {
    const tableUrl = document.getElementById("tableUrl");
    tableUrl.select();
    navigator.clipboard.writeText(tableUrl.value)
        .then(() => alert("Link copied!"))
        .catch(err => console.error("Failed to copy:", err));
}

// Automatically load table settings when joining a game
function loadTableSettings() {
    const urlParams = new URLSearchParams(window.location.search);
    const tableId = urlParams.get("table");

    if (tableId) {
        fetch(`https://pokerdexqa-server.onrender.com/getTableSettings?tableId=${tableId}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error("Table not found:", data.error);
                    return;
                }

                // Store settings for game.js to use
                sessionStorage.setItem("solToToken", data.solToToken);
                sessionStorage.setItem("smallBlind", data.smallBlindAmount);  // Corrected field name
                sessionStorage.setItem("bigBlind", data.bigBlindAmount);  // Corrected field name
                sessionStorage.setItem("gameType", data.gameType);
                sessionStorage.setItem("minBuyIn", data.minBuyIn);
                sessionStorage.setItem("maxBuyIn", data.maxBuyIn);
                

                console.log("Loaded table settings:", data);
                // Optionally, you can also display these settings in the UI to check if they are correctly loaded
                document.getElementById("solToTokenDisplay").innerText = data.solToToken;
                document.getElementById("smallBlindDisplay").innerText = data.smallBlindAmount;
                document.getElementById("bigBlindDisplay").innerText = data.bigBlindAmount;
                document.getElementById("buyInDisplay").innerText = 
                    `Buy-In Limits: ${data.gameType === "limit" ? data.minBuyIn + " SOL (min) to " + data.maxBuyIn + " SOL (max)" : "No limit"}`;
            })
            .catch(err => console.error("Error fetching table settings:", err));
    }
}
