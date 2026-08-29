let data = [];

let trackedCoins = JSON.parse(localStorage.getItem("trackedCoins")) || ["bitcoin", "ethereum", "solana"];

let alerts = JSON.parse(localStorage.getItem("alerts")) || {};

let coinList = document.querySelector("#coinList");
let lastUpdated = document.querySelector("#lastUpdated");

let searchInput = document.querySelector("#searchInput");
let searchButton = document.querySelector("#searchButton");

let addCoinInput = document.querySelector("#addCoinInput");
let addCoinButton = document.querySelector("#addCoinButton");
let searchResults = document.querySelector("#searchResults");
let addCoinMsg = document.querySelector("#addCoinMsg");

let alertCoin = document.querySelector("#alertCoin");
let upper = document.querySelector("#upper");
let lower = document.querySelector("#lower");
let setAlert = document.querySelector("#setAlert");

let statusMsg = document.querySelector("#statusMsg");
let alertMsg = document.querySelector("#alertMsg");


function saveTrackedCoins() {
    localStorage.setItem("trackedCoins", JSON.stringify(trackedCoins));
}

function saveAlerts() {
    localStorage.setItem("alerts", JSON.stringify(alerts));
}


navigator.serviceWorker.register("sw.js")
.then(registration => {
    console.log("Service Worker registered.");
    console.log("Active:", registration.active);
})
.catch(error => {
    console.log("Service Worker registration failed:", error);
});


async function requestNotificationPermission() {
    if (!("Notification" in window)) {
        console.log("Notifications are not supported.");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    let permission = await Notification.requestPermission();

    return permission === "granted";
}


async function sendNotification(title, message) {
    if (Notification.permission !== "granted") {
        console.log("Notification permission not granted.");
        return;
    }

    try {
        let registration = await navigator.serviceWorker.ready;

        await registration.showNotification(title, {
            body: message
        });

        console.log("Notification sent.");
    }
    catch (error) {
        console.log("Notification failed:", error);
    }
}


async function searchForCoin() {
    let searchTerm = addCoinInput.value.trim();

    if (searchTerm === "") {
        addCoinMsg.textContent = "Enter a cryptocurrency name.";
        return;
    }

    searchResults.innerHTML = "";
    addCoinMsg.textContent = "Searching...";

    try {
        let url = "https://api.coingecko.com/api/v3/search?query=" + encodeURIComponent(searchTerm);

        let response = await fetch(url);

        if (!response.ok) {
            throw new Error("Search request failed.");
        }

        let result = await response.json();

        let coins = result.coins.slice(0, 5);

        if (coins.length === 0) {
            addCoinMsg.textContent = "No coins found.";
            return;
        }

        addCoinMsg.textContent = "Select a coin to add:";

        coins.forEach(coin => {
            let button = document.createElement("button");

            button.textContent = coin.name + " (" + coin.symbol.toUpperCase() + ")";

            button.addEventListener("click", function() {
                addCoin(coin.id);
            });

            searchResults.appendChild(button);
        });
    }
    catch (error) {
        console.log("Coin search failed:", error);
        addCoinMsg.textContent = "Could not search for coins.";
    }
}


function addCoin(coinId) {
    if (trackedCoins.includes(coinId)) {
        addCoinMsg.textContent = "Coin is already being tracked.";
        return;
    }

    trackedCoins.push(coinId);

    saveTrackedCoins();

    addCoinMsg.textContent = "Coin added successfully!";

    searchResults.innerHTML = "";

    updateAlertCoinOptions();

    getCoin();
}


function removeCoin(coinId) {
    trackedCoins = trackedCoins.filter(id => id !== coinId);

    delete alerts[coinId];

    saveTrackedCoins();
    saveAlerts();

    updateAlertCoinOptions();

    getCoin();
}


function updateAlertCoinOptions() {
    alertCoin.innerHTML = "";

    let defaultOption = document.createElement("option");

    defaultOption.value = "";
    defaultOption.textContent = "Select a tracked coin";

    alertCoin.appendChild(defaultOption);

    trackedCoins.forEach(coinId => {
        let option = document.createElement("option");

        option.value = coinId;
        option.textContent = coinId;

        alertCoin.appendChild(option);
    });
}


alertCoin.addEventListener("change", function() {
    let coinId = alertCoin.value;

    if (coinId && alerts[coinId]) {
        upper.value = alerts[coinId].upper;
        lower.value = alerts[coinId].lower;
    }
    else {
        upper.value = "";
        lower.value = "";
    }
});


setAlert.addEventListener("click", async function() {
    let coinId = alertCoin.value;

    let upperValue = Number(upper.value);
    let lowerValue = Number(lower.value);

    if (!coinId) {
        statusMsg.textContent = "Select a coin first.";
        return;
    }

    if (Number.isNaN(upperValue) || Number.isNaN(lowerValue)) {
        statusMsg.textContent = "Enter both targets.";
        return;
    }

    if (upperValue <= 0 || lowerValue < 0) {
        statusMsg.textContent = "Targets must be positive.";
        return;
    }

    if (lowerValue >= upperValue) {
        statusMsg.textContent = "Lower target must be below upper target.";
        return;
    }

    let allowed = await requestNotificationPermission();

    alerts[coinId] = {
        upper: upperValue,
        lower: lowerValue,
        previousStatus: null
    };

    saveAlerts();

    statusMsg.textContent = "Alert saved for " + coinId + ".";

    if (allowed) {
        statusMsg.textContent += " Notifications enabled.";
    }
});


function createCard(coin) {
    let card = document.createElement("article");

    card.className = "coin-card";

    let name = document.createElement("h3");
    name.textContent = coin.name;

    let symbol = document.createElement("p");
    symbol.textContent = coin.symbol.toUpperCase();

    let price = document.createElement("p");
    price.className = "price";
    price.textContent = "Price: $" + coin.current_price;

    let change = document.createElement("p");
    change.className = "change";
    change.textContent = "24h Change: " + coin.price_change_percentage_24h + "%";

    let view = document.createElement("button");
    view.textContent = "More details";

    view.addEventListener("click", function() {
        showCoinDetails(coin);
    });

    let remove = document.createElement("button");
    remove.textContent = "Remove";

    remove.addEventListener("click", function() {
        removeCoin(coin.id);
    });

    card.appendChild(name);
    card.appendChild(symbol);
    card.appendChild(price);
    card.appendChild(change);
    card.appendChild(view);
    card.appendChild(remove);

    return card;
}


function search() {
    let searchTerm = searchInput.value.trim().toLowerCase();

    let filteredCoins = data.filter(coin => coin.name.toLowerCase().includes(searchTerm));

    displayCoins(filteredCoins);
}


function displayCoins(coins) {
    coinList.innerHTML = "";

    if (coins.length === 0) {
        coinList.textContent = "No tracked coins found.";
        return;
    }

    coins.forEach(coin => {
        coinList.appendChild(createCard(coin));
    });
}


function showCoinDetails(coin) {
    let coinDetails = document.querySelector("#coinDetails");

    coinDetails.innerHTML = "";

    let title = document.createElement("h2");
    title.textContent = coin.name;

    let high = document.createElement("p");
    high.textContent = "24h High: $" + coin.high_24h;

    let low = document.createElement("p");
    low.textContent = "24h Low: $" + coin.low_24h;

    let marketCap = document.createElement("p");
    marketCap.textContent = "24h Market Cap Change: " + coin.market_cap_change_percentage_24h + "%";

    coinDetails.appendChild(title);
    coinDetails.appendChild(high);
    coinDetails.appendChild(low);
    coinDetails.appendChild(marketCap);
}


function checkAlert(coin) {
    let alert = alerts[coin.id];

    if (!alert) {
        return;
    }

    let price = coin.current_price;

    let currentStatus;

    if (price >= alert.upper) {
        currentStatus = "High";
    }
    else if (price <= alert.lower) {
        currentStatus = "Low";
    }
    else {
        currentStatus = "Normal";
    }

    let previousStatus = alert.previousStatus;

    console.log(coin.name, currentStatus, previousStatus);

    if (previousStatus === null) {
        alert.previousStatus = currentStatus;
        saveAlerts();
        return;
    }

    if (previousStatus === currentStatus) {
        return;
    }

    if (currentStatus === "High") {
        let message = coin.name + " crossed your Upper Target!\nCurrent Price: $" + coin.current_price + "\nUpper Target: $" + alert.upper;

        alertMsg.textContent = message;

        sendNotification("🚨 Crypto Tracker", message);
    }
    else if (currentStatus === "Low") {
        let message = coin.name + " crossed your Lower Target!\nCurrent Price: $" + coin.current_price + "\nLower Target: $" + alert.lower;

        alertMsg.textContent = message;

        sendNotification("🔻 Crypto Tracker", message);
    }

    alert.previousStatus = currentStatus;

    saveAlerts();
}


async function getCoin() {
    if (trackedCoins.length === 0) {
        coinList.textContent = "No coins are being tracked.";
        return;
    }

    try {
        let ids = trackedCoins.join(",");

        let url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=" + encodeURIComponent(ids);

        let response = await fetch(url);

        if (!response.ok) {
            throw new Error("API request failed: " + response.status);
        }

        data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Invalid API response.");
        }

        let now = new Date();

        let time = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0") + ":" + String(now.getSeconds()).padStart(2, "0");

        lastUpdated.textContent = "Last Updated: " + time;

        data.forEach(coin => {
            checkAlert(coin);
        });

        displayCoins(data);
    }
    catch (error) {
        console.log("Failed to fetch cryptocurrency data:", error);

        lastUpdated.textContent = "Failed to update prices.";

        coinList.textContent = "Could not fetch cryptocurrency data. Try again later.";
    }
}


searchButton.addEventListener("click", search);

addCoinButton.addEventListener("click", searchForCoin);

searchInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        search();
    }
});

addCoinInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        searchForCoin();
    }
});


updateAlertCoinOptions();

getCoin();

setInterval(getCoin, 30000);
