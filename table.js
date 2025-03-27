function showGameSetup() {
    document.getElementById("setupForm").style.display = "block";
}

function createTable() {
    // Get user-defined settings
    const solToToken = parseInt(document.getElementById("solToToken").value) || 100; // Default: 100 tokens per SOL
    const smallBlind = parseInt(document.getElementById("smallBlind").value) || 10;  // Default: 10 tokens
    const bigBlind = parseInt(document.getElementById("bigBlind").value) || 20;      // Default: 20 tokens

    // Generate a unique table ID
    const tableId = Math.random().toString(36).substr(2, 8);
    const tableUrl = `${window.location.origin}/pokerdexqa/game.html?table=${tableId}`;

    // Call backend to register the table
    fetch("https://pokerdexqa-server.onrender.com/registerTable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId, solToToken, smallBlind, bigBlind }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Table registered successfully!") {
            console.log("Table registered:", tableId);
            
            // Show the generated table link
            document.getElementById("tableUrl").value = tableUrl;
            document.getElementById("tableLink").style.display = "block";
        } else {
            console.error("Failed to register table:", data.error);
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

                console.log("Loaded table settings:", data);
                // Optionally, you can also display these settings in the UI to check if they are correctly loaded
                document.getElementById("solToTokenDisplay").innerText = data.solToToken;
                document.getElementById("smallBlindDisplay").innerText = data.smallBlindAmount;
                document.getElementById("bigBlindDisplay").innerText = data.bigBlindAmount;
            })
            .catch(err => console.error("Error fetching table settings:", err));
    }
}
