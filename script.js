window.onload = function() {
    const quoteText = document.getElementById('quoteText');
    if (quoteText) fetchQuote();

    if (document.getElementById('dogCarousel')) {
        displayDogImages();
        displayDogBreeds();
    }

    if (document.getElementById('stockTicker')) {
        document.querySelector('.action-btn').addEventListener('click', getStockData);
    }

    if (document.getElementById('stockTicker')) {
        fetchRedditStockData();
    }
};

function fetchQuote() {
    fetch('https://zenquotes.io/api/random')
        .then(response => response.json())
        .then(data => {
            document.getElementById('quoteText').innerText = `"${data[0].q}" — ${data[0].a}`;
        });
}

function getStockData() {
    const ticker = document.getElementById('stockTicker').value.toUpperCase();
    const range = document.getElementById('range').value;
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(new Date().setDate(new Date().getDate() - range)).toISOString().split('T')[0];

    fetch(`https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${startDate}/${endDate}?adjusted=true&sort=asc&apiKey=nKfhqJOZPkKZTQpxhvMPBO0FsAWEzh1u`)
        .then(response => response.json())
        .then(data => {
            if (!data.results || data.results.length === 0) {
                alert('No data found for this ticker.');
                return;
            }

            const dates = data.results.map(d => new Date(d.t).toLocaleDateString());
            const prices = data.results.map(d => d.c);

            const ctx = document.getElementById('stockChart').getContext('2d');
            if (window.chartInstance) {
                window.chartInstance.destroy();
            }
            window.chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [{
                        label: `${ticker} Stock Price`,
                        data: prices,
                        borderColor: '#3498db',
                        fill: false
                    }]
                }
            });
        })
        .catch(err => {
            console.error(err);
            alert('Error fetching stock data.');
        });
}

function displayDogImages() {
    fetch('https://dog.ceo/api/breeds/image/random/10')
        .then(response => response.json())
        .then(data => {
            const carousel = document.getElementById('dogCarousel');
            data.message.forEach(imgUrl => {
                const img = document.createElement('img');
                img.src = imgUrl;
                carousel.appendChild(img);
            });
        });
}

function displayDogBreeds() {
    fetch('https://dog.ceo/api/breeds/list/all')
        .then(response => response.json())
        .then(data => {
            const breedButtons = document.getElementById('breedButtons');
            Object.keys(data.message).forEach(breed => {
                const button = document.createElement('button');
                button.textContent = breed;
                button.classList.add('action-btn');
                button.onclick = () => showBreedInfo(breed);
                breedButtons.appendChild(button);
            });
        });
}

function showBreedInfo(breed) {
    fetch(`https://dog.ceo/api/breed/${breed}/images/random`)
        .then(response => response.json())
        .then(data => {
            const breedInfo = document.getElementById('breedInfo');
            breedInfo.innerHTML = `
                <h3>${breed}</h3>
                <img src="${data.message}" alt="${breed}">
            `;
            breedInfo.style.display = 'block';
        });
}

function fetchRedditStockData() {
    fetch('https://www.reddit.com/r/stocks.json')
        .then(response => response.json())
        .then(data => {
            const table = document.getElementById('redditTable').getElementsByTagName('tbody')[0];
            const stocks = data.data.children.slice(0, 5);

            stocks.forEach(stock => {
                const row = table.insertRow();
                const tickerCell = row.insertCell(0);
                const commentsCell = row.insertCell(1);
                const sentimentCell = row.insertCell(2);

                tickerCell.textContent = stock.data.title.split(' ')[0]; // Assuming ticker is at the start
                commentsCell.textContent = stock.data.num_comments;
                sentimentCell.textContent = stock.data.ups > stock.data.downs ? 'Positive' : 'Negative';
            });
        });
}
