
const https = require('https');

function get(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function test() {
    try {
        console.log('Testing CoinLore Tickers...');
        const clTickers = await get('https://api.coinlore.net/api/tickers/?start=0&limit=5');
        console.log('CoinLore Data[0]:', clTickers.data[0]);

        // console.log('Testing CoinPaprika Tickers...');
        // const cpTickers = await get('https://api.coinpaprika.com/v1/tickers?limit=5');
        // console.log('CoinPaprika Map:', cpTickers[0]);

        console.log('Testing Binance Klines (BTCUSDT)...');
        const binanceKlines = await get('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=5');
        console.log('Binance Klines[0]:', binanceKlines[0]);
    } catch (e) {
        console.error(e);
    }
}

test();
