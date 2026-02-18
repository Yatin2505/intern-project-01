import axios from 'axios';
import { Coin, CoinCapResponse, CoinHistory } from '@/types/coin';

const COINLORE_API_URL = 'https://api.coinlore.net/api';
const BINANCE_API_URL = 'https://api.binance.com/api/v3';

// Mock Data for Fallback
const MOCK_COINS: Coin[] = [
    {
        id: 'bitcoin',
        rank: '1',
        symbol: 'BTC',
        name: 'Bitcoin',
        supply: '19000000',
        maxSupply: '21000000',
        marketCapUsd: '1500000000000',
        volumeUsd24Hr: '50000000000',
        priceUsd: '95000.00',
        changePercent24Hr: '2.5',
        vwap24Hr: '94500.00',
        explorer: 'https://blockchain.info/'
    },
    {
        id: 'ethereum',
        rank: '2',
        symbol: 'ETH',
        name: 'Ethereum',
        supply: '120000000',
        maxSupply: null,
        marketCapUsd: '400000000000',
        volumeUsd24Hr: '20000000000',
        priceUsd: '3500.00',
        changePercent24Hr: '-1.2',
        vwap24Hr: '3550.00',
        explorer: 'https://etherscan.io/'
    },
    {
        id: 'dogecoin',
        rank: '10',
        symbol: 'DOGE',
        name: 'Dogecoin',
        supply: '140000000000',
        maxSupply: null,
        marketCapUsd: '25000000000',
        volumeUsd24Hr: '1000000000',
        priceUsd: '0.35',
        changePercent24Hr: '5.0',
        vwap24Hr: '0.34',
        explorer: 'https://dogechain.info/'
    }
];

interface CoinLoreTicker {
    id: string;
    symbol: string;
    name: string;
    nameid: string; // "bitcoin"
    rank: number;
    price_usd: string;
    percent_change_24h: string;
    percent_change_1h: string;
    percent_change_7d: string;
    market_cap_usd: string;
    volume24: number;
    volume24a: number; // volume 24h alt
    csupply: string; // circulating supply
    tsupply: string; // total supply
    msupply: string; // max supply
}

const mapCoinLoreToCoin = (ticker: CoinLoreTicker): Coin => ({
    id: ticker.nameid,
    rank: ticker.rank.toString(),
    symbol: ticker.symbol,
    name: ticker.name,
    supply: ticker.csupply,
    maxSupply: ticker.msupply || null,
    marketCapUsd: ticker.market_cap_usd,
    volumeUsd24Hr: ticker.volume24.toString(),
    priceUsd: ticker.price_usd,
    changePercent24Hr: ticker.percent_change_24h,
    vwap24Hr: ticker.price_usd, // CoinLore doesn't give VWAP, use price
    explorer: null, // Construct later if needed
});

export const getCoins = async (limit = 50): Promise<Coin[]> => {
    try {
        const response = await axios.get<{ data: CoinLoreTicker[] }>(`${COINLORE_API_URL}/tickers/`, {
            params: { start: 0, limit },
            timeout: 5000
        });
        return response.data.data.map(mapCoinLoreToCoin);
    } catch (error) {
        console.warn('Error fetching coins from CoinLore, using mock data:', error);
        return MOCK_COINS.slice(0, limit);
    }
};

export const getCoinDetails = async (id: string): Promise<Coin | null> => {
    try {
        // CoinLore detail endpoint requires numeric ID, but we have slug (id).
        // Strategy: Fetch top 100 tickers and find the one with matching nameid (slug).
        // This acts as a cache/lookup.
        const response = await axios.get<{ data: CoinLoreTicker[] }>(`${COINLORE_API_URL}/tickers/`, {
            params: { start: 0, limit: 100 },
            timeout: 5000
        });

        const ticker = response.data.data.find(t => t.nameid === id);

        if (!ticker) {
            // If not in top 100, try mock data or return null
            console.warn(`Coin ${id} not found in top 100 on CoinLore.`);
            return MOCK_COINS.find(c => c.id === id) || null;
        }

        return mapCoinLoreToCoin(ticker);
    } catch (error) {
        console.warn(`Error fetching details for ${id}, using mock data:`, error);
        return MOCK_COINS.find(c => c.id === id) || null;
    }
};

export const getCoinHistory = async (id: string, interval = '1D'): Promise<CoinHistory[]> => {
    try {
        const coin = await getCoinDetails(id);
        if (!coin) throw new Error(`Coin ${id} not found for history.`);

        const symbol = coin.symbol.toUpperCase();
        // Handle special cases or default generic pairing
        // Most alts trade against USDT. 
        // If symbol is USDT (Tether), maybe trade against USDC or ignore? 
        // For simplicity, assume USDT pair.
        const pair = symbol === 'USDT' ? 'USDCUSDT' : `${symbol}USDT`;

        // Map UI intervals to Binance API params
        // Binance Intervals: 1s, 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M
        let binanceInterval = '1d';
        let limit = 30;

        switch (interval) {
            case '1H':
                binanceInterval = '1m'; // 1 minute candles for last hour
                limit = 60;
                break;
            case '1D':
                binanceInterval = '1h'; // 1 hour candles for last 24h
                limit = 24;
                break;
            case '1W':
                binanceInterval = '4h'; // 4 hour candles for last week (4h * 42 = 7 days)
                limit = 42;
                break;
            case '1M':
                binanceInterval = '1d'; // 1 day candles for last 30 days
                limit = 30;
                break;
            case '1Y':
                binanceInterval = '1w'; // 1 week candles for last year
                limit = 52;
                break;
            default:
                binanceInterval = '1d';
                limit = 30;
        }

        const response = await axios.get<any[]>(`${BINANCE_API_URL}/klines`, {
            params: {
                symbol: pair,
                interval: binanceInterval,
                limit: limit
            },
            timeout: 5000
        });

        // Map Binance Kline [OpenTime, Open, High, Low, Close, Volume, ...]
        return response.data.map((kline: any[]) => ({
            priceUsd: kline[4], // Close price
            time: kline[0], // Open time
            date: new Date(kline[0]).toISOString()
        }));

    } catch (error) {
        console.warn(`Error fetching history for ${id} (${interval}) from Binance, using mock data:`, error);

        // Generate mock history fallback
        const now = Date.now();
        const history: CoinHistory[] = [];
        let basePrice = id === 'bitcoin' ? 95000 : id === 'ethereum' ? 3500 : 100;

        let points = 30;
        let timeStep = 24 * 3600 * 1000;

        switch (interval) {
            case '1H': points = 60; timeStep = 60 * 1000; break;
            case '1D': points = 24; timeStep = 3600 * 1000; break;
            case '1W': points = 42; timeStep = 4 * 3600 * 1000; break;
            case '1M': points = 30; timeStep = 24 * 3600 * 1000; break;
            case '1Y': points = 52; timeStep = 7 * 24 * 3600 * 1000; break;
        }

        for (let i = 0; i < points; i++) {
            const randomChange = 1 + (Math.random() * 0.04 - 0.02); // +/- 2%
            basePrice = basePrice * randomChange;

            const time = now - (points - i - 1) * timeStep;
            history.push({
                priceUsd: basePrice.toFixed(2),
                time: time,
                date: new Date(time).toISOString(),
            });
        }
        return history;
    }
};
