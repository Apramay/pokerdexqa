const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const rankValues = { "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, "J": 11, "Q": 12, "K": 13, "A": 14 };
// Function to get URL parameters
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Retrieve table ID from URL
// Retrieve stored game settings
const solToToken = sessionStorage.getItem(`${tableId}_solToToken`) 
const smallBlind = sessionStorage.getItem(`${tableId}_smallBlind`) 
const bigBlind = sessionStorage.getItem(`${tableId}_bigBlind`)
console.log(`Table ID: ${tableId}`);
console.log(`Sol to Token: ${solToToken}`);
console.log(`Small Blind: ${smallBlind}`);
console.log(`Big Blind: ${bigBlind}`);

// Store settings in a game config object
const gameSettings = {
    solToToken: parseInt(solToToken),
    smallBlind: parseInt(smallBlind),
    bigBlind: parseInt(bigBlind),
};

function createDeck() {
    const deck = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push({ suit, rank });
        }
    }
    return deck;
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function dealCard(deck) {
    return deck.pop();
}

function dealHand(deck, numCards) {
    const hand = [];
    for (let i = 0; i < numCards; i++) {
        hand.push(dealCard(deck));
    }
    return hand;
}

function displayCard(card) {
    if (!card || !card.suit || !card.rank) {
        console.warn(" ⚠️  Invalid card data received:", card);
        return `<img src="./cards/default.png" alt="Invalid Card">`;
    }
    const rank = card.rank;
    const suit = card.suit.toLowerCase();
    const imageName = `${rank}_of_${suit}.png`;

    return `<img src="https://apramay.github.io/pokerdexqa/cards/${imageName}" 
            alt="${rank} of ${suit}" 
            onerror="this.onerror=null; this.src='./cards/default.png';">`;
}

function displayHand(hand) {
    return hand.map(card => `<div class="card">${displayCard(card)}</div>`).join("");
}

// UI elements
const playersContainer = document.getElementById("players");
const tableCardsContainer = document.getElementById("community-cards");
const potDisplay = document.getElementById("pot");
const roundDisplay = document.getElementById("round");
const currentBetDisplay = document.getElementById("currentBet");
const messageDisplay = document.getElementById("message");

//  ✅  Table-specific game states
const gameStates = new Map();
let currentTableId = null;

function updateUI(tableId) {
    //  ✅  Use table-specific state if available
    const gameState = gameStates.get(tableId);

    const { players, tableCards, pot, round, currentBet, currentPlayerIndex, dealerIndex } = gameState;



    if (!playersContainer) return;
    playersContainer.innerHTML = "";
    gameState.players.forEach((player, index) => {
        const playerDiv = document.createElement("div");
        playerDiv.classList.add("player");
        let dealerIndicator = (index === gameState.dealerIndex && player.tokens > 0) ? "D " : "";
        let currentPlayerIndicator = index === gameState.currentPlayerIndex ? " ➡️  " : "";
        let blindIndicator = "";

        if (index === (gameState.dealerIndex + 1) % gameState.players.length && player.tokens > 0) blindIndicator = "SB ";

        if (index === (gameState.dealerIndex + 2) % gameState.players.length && player.tokens > 0) blindIndicator = "BB ";
            let displayedHand = player.name === gameState.players[gameState.currentPlayerIndex].name
        ? displayHand(player.hand)
            : `<div class="card"><img src="https://apramay.github.io/pokerdexqa/cards/back.jpg" 
    alt="Card Back" style="width: 100px; height: auto;"></div>`;
        playerDiv.innerHTML = `
         
    ${dealerIndicator}${blindIndicator}${currentPlayerIndicator}${player.name}: Tokens: ${player.tokens}<br>
            Hand: ${displayHand(player.hand)}
        `;
        playersContainer.appendChild(playerDiv);
    });

    if (tableCardsContainer) tableCardsContainer.innerHTML = displayHand(tableCards);
    if (potDisplay) {
        console.log(" 💰  Updating UI pot display:", pot);
        potDisplay.textContent = `Pot: ${pot}`;
    }
    if (roundDisplay) roundDisplay.textContent = `Round: ${round}`;
    if (currentBetDisplay) currentBetDisplay.textContent = `Current Bet: ${currentBet}`;
    if (messageDisplay) {
        console.log(` 📢  Updating UI: It's ${players[currentPlayerIndex]?.name}'s turn.`);
        messageDisplay.textContent = `It's ${players[currentPlayerIndex]?.name}'s turn.`;
    }
    const playerName = sessionStorage.getItem("playerName");
    //  ✅  Enable buttons **only** for the current player
    const isCurrentPlayer = players[currentPlayerIndex]?.name === playerName;
    document.querySelectorAll("#action-buttons button").forEach(button => {
        button.disabled = !isCurrentPlayer;
    });
}

let actionHistory = [];
function updateActionHistory(actionText) {
    const historyContainer = document.getElementById("action-history");
    if (historyContainer) {
        const actionElement = document.createElement("p");
        actionElement.textContent = actionText;
        historyContainer.appendChild(actionElement);
        //  ✅  Keep only the last 5 actions
        while (historyContainer.children.length > 5) {
            historyContainer.removeChild(historyContainer.firstChild);
        }
    }
}

let mockWallet = {
    publicKey: "MockPublicKey12345",
    solBalance: 50,  // Mock SOL balance in dollars
    tokenBalance: 0, // Mock in-game tokens
};

// Simulated Phantom Wallet Connection
function connectMockWallet() {
    console.log("🔗 Connecting to Mock Phantom Wallet...");

    // Simulate a wallet connection popup
    setTimeout(() => {
        alert("🔗 Mock Phantom Wallet Connected!");
        sessionStorage.setItem("playerWallet", mockWallet.publicKey);
        sessionStorage.setItem("walletSolBalance", mockWallet.solBalance);
        sessionStorage.setItem("walletTokenBalance", mockWallet.tokenBalance);

        updateMockWalletUI();
        console.log("✅ Connected to Mock Phantom Wallet:", mockWallet.publicKey);
    }, 1000); // Simulate delay to feel like a real wallet connection
}

// Function to update UI display of mock wallet balances
function updateMockWalletUI() {
    document.getElementById("wallet-balance").innerText = `Mock SOL Balance: ${mockWallet.solBalance} SOL`;
    document.getElementById("token-balance").innerText = `Mock Tokens: ${mockWallet.tokenBalance}`;
}

// Automatically connect the mock wallet when the page loads
document.addEventListener("DOMContentLoaded", function () {
    connectMockWallet();
});


document.addEventListener("DOMContentLoaded", function () {
    const socket = new WebSocket("wss://pokerdexqa-server.onrender.com"); // Replace with your server address
    socket.onopen = () => {
        console.log(" ✅  Connected to WebSocket server");
    };
    const addPlayerBtn = document.getElementById("add-player-btn");
const playerNameInput = document.getElementById("player-name-input");
const solAmountInput = document.getElementById("sol-amount-input"); // Use SOL input instead of token input

if (addPlayerBtn && playerNameInput && solAmountInput) {
    addPlayerBtn.onclick = function () {
        const playerName = playerNameInput.value.trim();
        const selectedSol = parseFloat(solAmountInput.value); // Player chooses SOL amount

        // ✅ Get tableId from URL
        const urlParams = new URLSearchParams(window.location.search);
        const tableId = urlParams.get('table');
        console.log("✅ Extracted tableId:", tableId);

        // ⚠️ Validate inputs
        if (!playerName) {
            alert("⚠️ Please enter a valid player name!");
            return;
        }

        if (!selectedSol || selectedSol <= 0) {
            alert("⚠️ Please enter a valid SOL amount!");
            return;
        }

        if (selectedSol > mockWallet.solBalance) {
            alert("❌ Not enough mock SOL in wallet!");
            return;
        }

        // Convert SOL to Tokens (100 Tokens per $1)
const tokenAmount = selectedSol * gameSettings.solToToken;

        // Deduct SOL from mock wallet & add tokens
        mockWallet.solBalance -= selectedSol;
        mockWallet.tokenBalance += tokenAmount;

        // ✅ Send player name, tableId, and tokens to WebSocket server
        socket.send(JSON.stringify({ 
            type: "join", 
            name: playerName, 
            tokens: tokenAmount,  
            tableId: tableId 
        }));

        sessionStorage.setItem("playerName", playerName);
        console.log(`✅ ${playerName} converted ${selectedSol} SOL → ${tokenAmount} tokens and joined.`);

        // Update UI balances
        document.getElementById("wallet-balance").innerText = `Mock SOL Balance: ${mockWallet.solBalance}`;
        document.getElementById("token-balance").innerText = `Mock Tokens: ${mockWallet.tokenBalance}`;

        // Clear input fields
        playerNameInput.value = "";
        solAmountInput.value = "";
    };
} else {
    console.error(" ❌  Player input elements not found!");
}
document.getElementById("cashout-btn").addEventListener("click", () => {
    const playerName = sessionStorage.getItem("playerName");
    const urlParams = new URLSearchParams(window.location.search);
    const tableId = urlParams.get('table');

    // Ensure game state has the correct tokens for the player
    let gameState = gameStates.get(tableId);
    if (!gameState) {
        alert("❌ Game state not found! Cannot cash out.");
        return;
    }

    let player = gameState.players.find(p => p.name === playerName);
    if (!player) {
        alert("❌ Player not found in game state!");
        return;
    }

    let tokensToCashOut = player.tokens;  // Use actual in-game token balance
    if (tokensToCashOut <= 0) {
        alert("❌ No tokens left to cash out!");
        return;
    }

    // 🔹 Corrected SOL conversion (100 tokens = 1 SOL)
    let conversionRate = 100;  
    let solAmount = tokensToCashOut / conversionRate;  

    // 🔹 Corrected Fee Calculation: 1% of SOL amount
    let fee = solAmount * 0.01;  

    // 🔹 Ensure we properly refund the exact SOL amount
    mockWallet.tokenBalance = 0;
    mockWallet.solBalance = parseFloat(mockWallet.solBalance + solAmount - fee).toFixed(6);  

    console.log(`✅ Cashed out ${tokensToCashOut} tokens → ${(solAmount - fee).toFixed(6)} SOL (1% fee: ${fee.toFixed(6)} SOL).`);
    document.getElementById("wallet-balance").innerText = `Mock SOL Balance: ${mockWallet.solBalance} SOL`;
    document.getElementById("token-balance").innerText = `Mock Tokens: 0`;

    // 🔹 Notify server about cash-out and player removal
    socket.send(JSON.stringify({
        type: "cashout",
        playerName: playerName,
        tableId: tableId
    }));

    // Remove player session data
    sessionStorage.removeItem("playerName");

    // Disconnect from WebSocket and reload page
    socket.close();
    setTimeout(() => {
        window.location.href = "index.html";  // Redirect or refresh
    }, 1000);
});

    const messageDisplay = document.getElementById("message");
    function displayMessage(message) {
        if (messageDisplay) {
            messageDisplay.textContent = message;
        } else {
            console.error("Message display element not found.");
        }
    }
    socket.onmessage = function (event) {
        console.log(" 📩  Received message from WebSocket:", event.data);
        try {
            let data = JSON.parse(event.data);
            //  ✅  Get tableId from message (if available)
            const tableId = data.tableId;
            if (data.type === "updatePlayers") {
                console.log(" 🔄  Updating players list:", data.players);
                // updateUI(data.players);
                // ✅ Initialize table state if it doesn't exist
                if (!gameStates.has(tableId)) {
                    gameStates.set(tableId, {
                        players: [],
                        tableCards: [],
                        pot: 0,
                        round: 0,
                        currentBet: 0,
                        currentPlayerIndex: 0,
                        dealerIndex: 0
                    });
                }
                const gameState = gameStates.get(tableId);
                gameState.players = data.players;
                updateUI(tableId);
            }

            if (data.type === "startGame") {
                console.log(" 🎲  Game has started!");
            }
            if (data.type === "showdown") {
                console.log(" 🏆  Showdown results received!");
                data.winners.forEach(winner => {
                    console.log(` 🎉  ${winner.playerName} won with: ${displayHand(winner.hand)}`);
                });
                // updateUI();
                updateUI(tableId); //  ✅  Ensure UI reflects the winning hands
            }
            if (data.type === "showOrHideCards") {
                console.log(" 👀  Show/Hide option available");
                const playerName = sessionStorage.getItem("playerName");
                if (data.remainingPlayers.includes(playerName)) {
                    showShowHideButtons();
                } else {
                    console.log(" ✅  You are not required to show or hide cards.");
                }
            }

            if (data.type === "bigBlindAction") {
                if (!data.options) {
                    console.warn(" ⚠️  No options received from server!");
                    return;
                }

                checkBtn.style.display = data.options.includes("check") ? "inline" : "none";
                callBtn.style.display = data.options.includes("call") ?
                    "inline" : "none";
                foldBtn.style.display = data.options.includes("fold") ? "inline" : "none";
                raiseBtn.style.display = data.options.includes("raise") ? "inline" : "none";
                checkBtn.onclick = () => {
                    sendAction("check", null, tableId); //  ✅  Pass tableId
                };
                callBtn.onclick = () => {
                    sendAction("call", null, tableId); //  ✅  Pass tableId
                };
                raiseBtn.onclick = () => {
                    const amount = parseInt(betInput.value);
                    if (!isNaN(amount)) {
                        sendAction("raise", amount, tableId); //  ✅  Pass tableId
                    } else {
                        displayMessage("Invalid raise amount.");
                    }
                };
                foldBtn.onclick = () => {
                    sendAction("fold", null, tableId); //  ✅  Pass tableId
                };
            }
            if (data.type === "playerTurn") {
                console.log(` 🎯  Player turn received: ${data.playerName}`);
                // let playerIndex = players.findIndex(p => p.name === data.playerName);
                // if (playerIndex !== -1) {
                //     currentPlayerIndex = playerIndex;
                //     console.log(` ✅  Updated currentPlayerIndex: ${currentPlayerIndex}`);
                //     updateUI(); //  ✅  Immediately update UI after setting correct turn
                // } else {
                //     console.warn(` ⚠️  Player ${data.playerName} not found in players list`);
                // }
                // ✅ Update the currentPlayerIndex within the table's state
    
                                let tableId = data.tableId || new URLSearchParams(window.location.search).get("table");
                                const gameState = gameStates.get(tableId);


                let playerIndex = gameState.players.findIndex(p => p.name === data.playerName);
    if (playerIndex !== -1) {
        gameState.currentPlayerIndex = playerIndex;
        updateUI(tableId);  // ✅ Ensure UI updates properly
    }else {
                    console.warn(` ⚠️  Player ${data.playerName} not found in players list`);
                }
            }
            if (data.type === "updateGameState") {
                console.log(" 🔄  Updating game state:", data);
                let tableId = data.tableId || new URLSearchParams(window.location.search).get("table");

    if (!tableId) {
        console.error("❌ No valid tableId found in updateGameState!");
        return;
    }
                if (!gameStates.has(tableId)) {
                    gameStates.set(tableId, {
                        players:[],
                        tableCards:[],
                        pot: 0,
                        round: 0,
                        currentBet: 0,
                        currentPlayerIndex: 0,
                        dealerIndex: 0
                    });
                }
                const gameState = gameStates.get(tableId);
                gameState.players = data.players;
                gameState.tableCards = data.tableCards;
                gameState.pot = data.pot;
                gameState.currentBet = data.currentBet;
                gameState.round = data.round;
                gameState.currentPlayerIndex = data.currentPlayerIndex;
                gameState.dealerIndex = data.dealerIndex;
                currentTableId = tableId;
                    console.log(`✅ Game state updated for table: ${tableId}`);

                
                    updateUI(tableId);
        
            }
            if (data.type === "updateActionHistory") {
                updateActionHistory(data.action);
            }
        } catch (error) {
            console.error(" ❌  Error parsing message:", error);
        }
    };

    function sendShowHideDecision(choice) {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            console.error(" ❌  WebSocket is not connected!");
            return;
        }
        //  ✅  Get tableId from URL
        const urlParams = new URLSearchParams(window.location.search);
        const tableId = urlParams.get('table');
        socket.send(JSON.stringify({
            type: "showHideDecision",
            playerName: sessionStorage.getItem("playerName"),
            choice: choice,
            tableId: tableId  //  ✅  Send tableId
        }));
        //  ✅  Hide buttons after choosing
        document.getElementById("show-hide-buttons").style.display = "none";
    }
    function showShowHideButtons() {
        const buttonsContainer = document.getElementById("show-hide-buttons");
        buttonsContainer.style.display = "block";
        //  ✅  Make buttons visible
        document.getElementById("show-cards-btn").onclick = function () {
            sendShowHideDecision("show");
        };
        document.getElementById("hide-cards-btn").onclick = function () {
            sendShowHideDecision("hide");
        };
    }
    const startGameBtn = document.getElementById("start-game-btn");
    if (startGameBtn) {
        startGameBtn.onclick = function () {
            if (socket.readyState === WebSocket.OPEN) {
                //  ✅  Get tableId from URL
                const urlParams = new URLSearchParams(window.location.search);
                const tableId = urlParams.get('table');
                socket.send(JSON.stringify({ type: "startGame", tableId: tableId })); //  ✅  Send tableId
            } else {
                // displayMessage("WebSocket connection not open.");
            }
        };
    }
    // Action buttons
    const foldBtn = document.getElementById("fold-btn");
    const callBtn = document.getElementById("call-btn");
    const betBtn = document.getElementById("bet-btn");
    const raiseBtn = document.getElementById("raise-btn");
    const checkBtn = document.getElementById("check-btn");
    //  ✅  Add check button reference
    const betAmountInput = document.getElementById("bet-input");
    if (foldBtn) foldBtn.onclick = () => sendAction("fold");
    if (callBtn) callBtn.onclick = () => sendAction("call");
    if (raiseBtn) {
        raiseBtn.onclick = () => {
            if (betAmountInput) {
                sendAction("raise", parseInt(betAmountInput.value));
            } else {
                console.error("betAmountInput not found!");
            }
        };
    }
    if (checkBtn) {
        checkBtn.onclick = () => sendAction("check"); //  ✅  Send check action when clicked
    }
    //  ✅  tableId parameter added
    function sendAction(action, amount = null) {
    if (socket.readyState !== WebSocket.OPEN) return;

    console.log("ℹ️ Checking tableId before sending action:", tableId);
    const gameState = gameStates.get(tableId);

    if (!gameState) {
        console.error(`❌ No game state found for table: ${tableId}`);
        console.log("🔍 Current gameStates:", gameStates);  // Debugging
        return;
    }

    if (!gameState.players) {
        console.error(`❌ Players array is missing for table: ${tableId}`);
        return;
    }

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer) {
        console.error(`❌ Invalid currentPlayerIndex (${gameState.currentPlayerIndex}) for table: ${tableId}`);
        return;
    }

    const actionData = {
        type: action,
        playerName: currentPlayer.name,
          tableId: currentTableId,  // <-- Send the tableId

    };

    if (amount !== null) {
        actionData.amount = amount;
    }

    console.log("📤 Sending action data:", actionData);
    socket.send(JSON.stringify(actionData));

    setTimeout(() => {
        socket.send(JSON.stringify({ type: "getGameState", tableId }));
    }, 500);
}

});
