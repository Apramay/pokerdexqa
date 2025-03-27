function showGameSetup() {
    document.getElementById("setupForm").style.display = "block";
}

function createTable() {
    const solToToken = document.getElementById("solToToken").value || 100; // Default: 100 tokens per SOL
    const smallBlind = document.getElementById("smallBlind").value || 10; // Default: 10 tokens
    const bigBlind = document.getElementById("bigBlind").value || 20; // Default: 20 tokens

    const tableId = Math.random().toString(36).substr(2, 8); // Generate unique table ID
    const tableUrl = `${window.location.origin}/pokerdexqa/game.html?table=${tableId}`;

    // Store game settings in sessionStorage
    sessionStorage.setItem(`${tableId}_solToToken`, solToToken);
    sessionStorage.setItem(`${tableId}_smallBlind`, smallBlind);
    sessionStorage.setItem(`${tableId}_bigBlind`, bigBlind);

    // Show table link
    document.getElementById("tableUrl").value = tableUrl;
    document.getElementById("tableLink").style.display = "block";

    // Notify server to register this new table
    fetch("/registerTable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId, solToToken, smallBlind, bigBlind }),
    }).catch(err => console.error("Error registering table:", err));
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
    document.execCommand("copy");
    alert("Link copied!");
}
