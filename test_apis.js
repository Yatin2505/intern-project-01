
const https = require('https');

const apis = [
    { name: 'CoinGecko', url: 'https://api.coingecko.com/api/v3/ping' },
    { name: 'Binance', url: 'https://api.binance.com/api/v3/ping' },
    { name: 'Coinbase', url: 'https://api.coinbase.com/v2/time' },
    { name: 'CryptoCompare', url: 'https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD' }
];

apis.forEach(api => {
    console.log(`Testing ${api.name}...`);
    https.get(api.url, (res) => {
        console.log(`${api.name}: ${res.statusCode}`);
        res.resume();
    }).on('error', (e) => {
        console.log(`${api.name}: Failed - ${e.message}`);
    });
});
