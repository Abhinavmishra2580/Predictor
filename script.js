async function fetchResults() {
    const apiUrl = 'https://api.bdg88zf.com/api/webapi/GetNoaverageEmerdList';
    const requestData = {
        "pageSize": 10,
        "pageNo": 1,
        "typeId": 1,
        "language": 0,
        "random": "c2505d9138da4e3780b2c2b34f2fb789",
        "signature": "7D637E060DA35C0C6E28DC6D23D71BED",
        "timestamp": Math.floor(Date.now() / 1000),
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                'Accept': 'application/json, text/plain, */*',
            },
            body: JSON.stringify(requestData),
        });

        if (response.ok) {
            const data = await response.json();
            if (data.code === 0) {
                return data.data.list; // Return the fetched data
            } else {
                console.error('API Error:', data.msg);
                return null;
            }
        } else {
            console.error('HTTP Error:', response.statusText);
            return null;
        }
    } catch (error) {
        console.error('Network Error:', error.message);
        return null;
    }
}

function getCurrentPeriod1Min() {
    const now = new Date();
    const minutes = now.getMinutes();
    const period = Math.floor(minutes / 5) + 1;
    return `Period ${period}`;
}

// Moving Average Prediction
function calculateMovingAverage(results, N = 5) {
    if (results.length < N) return null;
    const recentResults = results.slice(-N);
    const total = recentResults.reduce((acc, result) => acc + parseInt(result.number), 0);
    return Math.round(total / recentResults.length);
}

// Frequency-Based Prediction
function getMostFrequentNumber(results) {
    const countMap = {};
    results.forEach(result => {
        const num = parseInt(result.number);
        countMap[num] = (countMap[num] || 0) + 1;
    });

    // Find number with max frequency
    return Object.keys(countMap).reduce((a, b) => (countMap[a] > countMap[b] ? a : b), null);
}

// Generate Prediction
function generatePrediction(results) {
    if (!results || results.length === 0) return "Prediction unavailable";

    const movingAvg = calculateMovingAverage(results, 5);
    const mostFrequent = getMostFrequentNumber(results);

    return `Predicted Number: ${movingAvg || mostFrequent || "N/A"}`;
}

// Update Results Table
function updateResults(resultList) {
    const historyTable = document.getElementById('recentResults');
    historyTable.innerHTML = ''; // Clear previous data

    resultList.forEach(result => {
        const { issueNumber, number, colour } = result;

        const row = document.createElement('tr');

        const issueCell = document.createElement('td');
        issueCell.textContent = issueNumber;
        issueCell.classList.add('px-4', 'py-2');
        row.appendChild(issueCell);

        const colourCell = document.createElement('td');
        colourCell.textContent = colour;
        colourCell.classList.add('px-4', 'py-2');
        row.appendChild(colourCell);

        const numberCell = document.createElement('td');
        numberCell.textContent = number;
        numberCell.classList.add('px-4', 'py-2');
        row.appendChild(numberCell);

        historyTable.appendChild(row);
    });

    // Update prediction
    const predictionElement = document.getElementById('bestPrediction');
    predictionElement.textContent = generatePrediction(resultList);
}

// Fetch and update data
async function fetchResultsAndUpdate() {
    const resultList = await fetchResults();
    if (resultList) {
        updateResults(resultList);
    } else {
        console.error("Failed to fetch or update results.");
    }
}

// Fetch data every 1 minute
fetchResultsAndUpdate();
setInterval(fetchResultsAndUpdate, 60000);
