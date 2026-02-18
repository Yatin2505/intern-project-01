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

export const getCoinHistory = async (id: string, interval = 'd1'): Promise<CoinHistory[]> => {
    try {
        // 1. Get symbol first (we need it for Binance)
        // We can optimistically guessing symbol from ID? No.
        // We need to fetch details or passed symbol. 
        // For efficiency, we assume specific common mappings or fetch details.
        // Let's fetch details to get the symbol.
        const coin = await getCoinDetails(id);
        if (!coin) throw new Error(`Coin ${id} not found for history.`);

        const symbol = coin.symbol.toUpperCase();
        const pair = `${symbol}USDT`;

        // Map interval
        const binanceInterval = interval === 'h1' ? '1h' : '1d';
        const limit = interval === 'h1' ? '24' : '30';

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
            time: kline[0],
            date: new Date(kline[0]).toISOString()
        }));

    } catch (error) {
        console.warn(`Error fetching history for ${id} from Binance, using mock data:`, error);

        // Generate mock history
        const now = Date.now();
        const history: CoinHistory[] = [];
        let price = id === 'bitcoin' ? 95000 : id === 'ethereum' ? 3500 : 0.35;

        const points = interval === 'h1' ? 24 : 30;
        const timeStep = interval === 'h1' ? 3600 * 1000 : 24 * 3600 * 1000;

        for (let i = 0; i < points; i++) {
            price = price * (1 + (Math.random() * 0.1 - 0.05));
            history.push({
                priceUsd: price.toString(),
                time: now - (points - i) * timeStep,
                date: new Date(now - (points - i) * timeStep).toISOString(),
            });
        }
        return history;
    }
};
