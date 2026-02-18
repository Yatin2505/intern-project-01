import { useState, useEffect } from 'react';
import { NextSeo } from 'next-seo';
import Link from 'next/link';
import { Coin } from '@/types/coin';
import { ArrowUp, ArrowDown, Star, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useWatchlist } from '@/hooks/useWatchlist';
import { motion } from 'framer-motion';

export default function Watchlist() {
    const { watchlist, toggleWatchlist, isLoaded } = useWatchlist();
    const [coins, setCoins] = useState<Coin[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded) return;

        const fetchWatchlistCoins = async () => {
            if (watchlist.length === 0) {
                setCoins([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const res = await fetch(`/api/coins?ids=${watchlist.join(',')}`);
                const data = await res.json();
                if (data.coins) {
                    setCoins(data.coins);
                }
            } catch (error) {
                console.error("Failed to fetch watchlist coins", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWatchlistCoins();
    }, [watchlist, isLoaded]);

    const formatCurrency = (value: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(parseFloat(value));
    };

    const formatMarketCap = (value: string) => {
        const num = parseFloat(value);
        if (num >= 1e9) {
            return `$${(num / 1e9).toFixed(2)}B`;
        }
        if (num >= 1e6) {
            return `$${(num / 1e6).toFixed(2)}M`;
        }
        return `$${num.toLocaleString()}`;
    };

    return (
        <>
            <NextSeo
                title="My Watchlist | CryptoView"
                description="Your personalized list of cryptocurrencies to track."
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-4">My Watchlist</h1>
                    <p className="text-gray-400">Keep track of your favorite assets in one place.</p>
                </div>

                {!isLoaded || isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                    </div>
                ) : coins.length > 0 ? (
                    <motion.div
                        className="glass-card overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-white/5">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th scope="col" className="w-12 py-4 pl-6 pr-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        </th>
                                        <th scope="col" className="py-4 pl-3 pr-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Rank
                                        </th>
                                        <th scope="col" className="px-3 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th scope="col" className="px-3 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th scope="col" className="px-3 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            24h Change
                                        </th>
                                        <th scope="col" className="px-3 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Market Cap
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 bg-transparent">
                                    {coins.map((coin) => (
                                        <tr key={coin.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm text-gray-500 font-mono">
                                                <button
                                                    onClick={() => toggleWatchlist(coin.id)}
                                                    className="text-yellow-500 hover:text-gray-400 transition-colors focus:outline-none"
                                                >
                                                    <Star className="w-4 h-4 fill-current" />
                                                </button>
                                            </td>
                                            <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm text-gray-500 font-mono">
                                                {coin.rank}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-white">
                                                <Link href={`/coin/${coin.id}`} className="flex items-center gap-3">
                                                    <img
                                                        src={`https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`}
                                                        alt={coin.name}
                                                        className="w-8 h-8 rounded-full transition-transform group-hover:scale-110"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 width=%2224%22 height=%2224%22%3E%3Ccircle cx=%2212%22 cy=%2212%22 r=%2212%22 fill=%22%23262626%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2210%22 fill=%22%23525252%22%3E%3F%3C/text%3E%3C/svg%3E';
                                                        }}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-bold">{coin.name}</span>
                                                        <span className="text-gray-500 text-xs">{coin.symbol}</span>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-white font-mono">
                                                {formatCurrency(coin.priceUsd)}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium">
                                                <div className={clsx(
                                                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold",
                                                    parseFloat(coin.changePercent24Hr) >= 0 ? "bg-secondary-500/10 text-secondary-500" : "bg-accent-500/10 text-accent-500"
                                                )}>
                                                    {parseFloat(coin.changePercent24Hr) >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                                    {Math.abs(parseFloat(coin.changePercent24Hr)).toFixed(2)}%
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-400 font-mono">
                                                {formatMarketCap(coin.marketCapUsd)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                ) : (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5">
                        <Star className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-white mb-2">Your watchlist is empty</h3>
                        <p className="text-gray-400 mb-6">Star coins to add them to your favorites.</p>
                        <Link href="/" className="glass-button inline-flex items-center gap-2">
                            Explore Coins
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}
