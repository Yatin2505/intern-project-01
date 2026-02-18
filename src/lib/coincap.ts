import axios from 'axios';
import { Coin, CoinCapResponse, CoinHistory } from '@/types/coin';

const API_URL = 'https://api.coincap.io/v2';

const MOCK_COINS: Coin[] = [
    {
        id: 'bitcoin',
        rank: '1',
        symbol: 'BTC',
        name: 'Bitcoin',
        supply: '19000000',
        maxSupply: '21000000',
        marketCapUsd: '800000000000',
        volumeUsd24Hr: '30000000000',
        priceUsd: '42000.50',
        changePercent24Hr: '2.5',
        vwap24Hr: '41500.00',
        explorer: 'https://blockchain.info/'
    },
    {
        id: 'ethereum',
        rank: '2',
        symbol: 'ETH',
        name: 'Ethereum',
        supply: '120000000',
        maxSupply: null,
        marketCapUsd: '350000000000',
        volumeUsd24Hr: '15000000000',
        priceUsd: '2900.25',
        changePercent24Hr: '-1.2',
        vwap24Hr: '2950.00',
        explorer: 'https://etherscan.io/'
    },
    {
        id: 'dogecoin',
        rank: '10',
        symbol: 'DOGE',
        name: 'Dogecoin',
        supply: '132000000000',
        maxSupply: null,
        marketCapUsd: '20000000000',
        volumeUsd24Hr: '1000000000',
        priceUsd: '0.15',
        changePercent24Hr: '5.0',
        vwap24Hr: '0.14',
        explorer: 'https://dogechain.info/'
    }
];

export const getCoins = async (limit = 50): Promise<Coin[]> => {
    try {
        const response = await axios.get<CoinCapResponse<Coin[]>>(`${API_URL}/assets`, {
            params: { limit },
            timeout: 5000 // 5 second timeout
        });
        return response.data.data;
    } catch (error) {
        console.warn('Error fetching coins, using mock data:', error);
        return MOCK_COINS.slice(0, limit);
    }
};

export const getCoinDetails = async (id: string): Promise<Coin | null> => {
    try {
        const response = await axios.get<CoinCapResponse<Coin>>(`${API_URL}/assets/${id}`, {
            timeout: 5000
        });
        return response.data.data;
    } catch (error) {
        console.warn(`Error fetching details for ${id}, using mock data:`, error);
        return MOCK_COINS.find(c => c.id === id) || null;
    }
};

export const getCoinHistory = async (id: string, interval = 'd1'): Promise<CoinHistory[]> => {
    try {
        const response = await axios.get<CoinCapResponse<CoinHistory[]>>(`${API_URL}/assets/${id}/history`, {
            params: { interval },
            timeout: 5000
        });
        return response.data.data;
    } catch (error) {
        console.warn(`Error fetching history for ${id}, using mock data:`, error);

        // Generate mock history
        const now = Date.now();
        const history: CoinHistory[] = [];
        let price = id === 'bitcoin' ? 42000 : id === 'ethereum' ? 2900 : 0.15;

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
