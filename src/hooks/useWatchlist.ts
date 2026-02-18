import { useState, useEffect } from 'react';

const STORAGE_KEY = 'crypto_watchlist';

export const useWatchlist = () => {
    const [watchlist, setWatchlist] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setWatchlist(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Failed to load watchlist from localStorage', error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    const toggleWatchlist = (coinId: string) => {
        setWatchlist(prev => {
            const newWatchlist = prev.includes(coinId)
                ? prev.filter(id => id !== coinId)
                : [...prev, coinId];

            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newWatchlist));
            } catch (error) {
                console.error('Failed to save watchlist to localStorage', error);
            }

            return newWatchlist;
        });
    };

    const isInWatchlist = (coinId: string) => watchlist.includes(coinId);

    return { watchlist, toggleWatchlist, isInWatchlist, isLoaded };
};
