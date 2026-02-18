import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { NextSeo, ArticleJsonLd } from 'next-seo';
import Link from 'next/link';
import { getCoinDetails, getCoinHistory } from '@/lib/coincap';
import { Coin, CoinHistory } from '@/types/coin';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ArrowLeft, ArrowUp, ArrowDown, ExternalLink, Clock } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface CoinDetailProps {
    coin: Coin | null;
    history: CoinHistory[];
    lastUpdated: string;
}

export const getServerSideProps: GetServerSideProps<CoinDetailProps> = async (context) => {
    const { id } = context.params as { id: string };
    const [coin, history] = await Promise.all([
        getCoinDetails(id),
        getCoinHistory(id, '1D'), // Default to 1 Day
    ]);

    if (!coin) {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            coin,
            history,
            lastUpdated: new Date().toISOString(),
        },
    };
};

const TIME_RANGES = [
    { label: '1H', value: '1H' },
    { label: '1D', value: '1D' },
    { label: '1W', value: '1W' },
    { label: '1M', value: '1M' },
    { label: '1Y', value: '1Y' },
];

export default function CoinDetail({ coin, history: initialHistory, lastUpdated }: CoinDetailProps) {
    const [history, setHistory] = useState<CoinHistory[]>(initialHistory);
    const [interval, setInterval] = useState('1D');
    const [isLoading, setIsLoading] = useState(false);

    // Effect to fetch history when interval changes (client-side)
    useEffect(() => {
        if (!coin || interval === '1D') return; // Initial load handled by SSR for 1D

        const fetchHistory = async () => {
            setIsLoading(true);
            try {
                // We need an API endpoint for this to avoid exposing API keys or huge client-side logic
                // But since our fetch logic is in lib/coincap.ts which uses public APIs, we can technically call it via API route
                // For now, let's create a simple API route or just refetch via client-side mapped calls
                // Actually, nextjs lib files can be imported client side if they don't use server secrets.
                // However, CORS might be an issue with Binance from client.
                // BEST PRACTICE: Create an API route /api/history

                // Temporary: call internal API route
                const res = await fetch(`/api/history?id=${coin.id}&interval=${interval}`);
                const data = await res.json();
                if (data.history) {
                    setHistory(data.history);
                }
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [interval, coin]);

    // Update history state if initialHistory changes (re-validation)
    useEffect(() => {
        if (interval === '1D') {
            setHistory(initialHistory);
        }
    }, [initialHistory, interval]);


    if (!coin) return null;

    const chartData = history.map(point => ({
        date: new Date(point.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
        price: parseFloat(point.priceUsd),
    }));

    const formatCurrency = (value: string | number) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
        }).format(num);
    };

    const priceChange = parseFloat(coin.changePercent24Hr);
    const isPositive = priceChange >= 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-8 px-4 sm:px-6 lg:px-8">
            <NextSeo
                title={`${coin.name} (${coin.symbol}) Price Live Chart & News | Crypto SEO`}
                description={`Get real-time ${coin.name} (${coin.symbol}) price, market cap, and trading volume. View live charts and historical data for ${coin.name}.`}
                openGraph={{
                    title: `${coin.name} Price - Live Chart`,
                    description: `Current price of ${coin.name} is ${formatCurrency(coin.priceUsd)}. Market Cap: ${formatCurrency(coin.marketCapUsd)}.`,
                    images: [
                        {
                            url: `https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`,
                            width: 200,
                            height: 200,
                            alt: coin.name,
                        },
                    ],
                }}
            />
            <ArticleJsonLd
                url={`https://crypto-seo-ssr.vercel.app/coin/${coin.id}`}
                title={`${coin.name} Price Analysis`}
                images={[`https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`]}
                datePublished={lastUpdated}
                authorName={['Crypto SEO SSR']}
                publisherName="Crypto SEO SSR"
                description={`Detailed analysis and real-time price data for ${coin.name}.`}
            />

            <main className="max-w-7xl mx-auto py-8">
                <Link href="/" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to List
                </Link>

                <div className="glass-card overflow-hidden">
                    <div className="p-6 sm:p-8">
                        {/* Header Section */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <img
                                    src={`https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`}
                                    alt={coin.name}
                                    className="w-16 h-16 rounded-full ring-2 ring-white/10"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 width=%2264%22 height=%2264%22%3E%3Ccircle cx=%2212%22 cy=%2212%22 r=%2212%22 fill=%22%23262626%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2214%22 fill=%22%23525252%22%3E%3F%3C/text%3E%3C/svg%3E';
                                    }}
                                />
                                <div>
                                    <h1 className="text-3xl font-bold text-white">{coin.name}</h1>
                                    <span className="text-lg text-primary-500 font-medium">{coin.symbol}</span>
                                </div>
                            </div>
                            <div className="text-left sm:text-right">
                                <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                                    {formatCurrency(coin.priceUsd)}
                                </p>
                                <p className={`text-lg font-medium inline-flex items-center gap-1 ${isPositive ? 'text-secondary-500' : 'text-accent-500'}`}>
                                    {isPositive ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                                    {priceChange.toFixed(2)}% (24h)
                                </p>
                            </div>
                        </div>

                        {/* Chart Section */}
                        <div className="mt-8 h-[500px] w-full bg-white/5 rounded-xl p-4 border border-white/5 relative">
                            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                                <h2 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
                                    Price History <span className="text-sm font-normal text-gray-500">({interval})</span>
                                </h2>
                                <div className="flex p-1 bg-black/20 rounded-lg backdrop-blur-sm">
                                    {TIME_RANGES.map((range) => (
                                        <button
                                            key={range.value}
                                            onClick={() => setInterval(range.value)}
                                            className={clsx(
                                                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                                interval === range.value
                                                    ? "bg-white/10 text-white shadow-sm"
                                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                            )}
                                        >
                                            {range.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {isLoading && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-xl">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                                </div>
                            )}

                            <ResponsiveContainer width="100%" height="85%">
                                <LineChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={isPositive ? '#8b5cf6' : '#f43f5e'} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={isPositive ? '#8b5cf6' : '#f43f5e'} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis
                                        dataKey="date"
                                        minTickGap={40}
                                        tick={{ fontSize: 11, fill: '#6B7280' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        domain={['auto', 'auto']}
                                        tickFormatter={(val) => `$${val.toLocaleString()}`}
                                        tick={{ fontSize: 11, fill: '#6B7280' }}
                                        axisLine={false}
                                        tickLine={false}
                                        width={60}
                                    />
                                    <Tooltip
                                        formatter={(value: any) => [`${formatCurrency(value)}`, 'Price']}
                                        contentStyle={{
                                            backgroundColor: 'rgba(10, 10, 10, 0.8)',
                                            backdropFilter: 'blur(12px)',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#fff',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                                        }}
                                        itemStyle={{ color: '#fff' }}
                                        labelStyle={{ color: '#9ca3af', marginBottom: '0.5rem' }}
                                        cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="price"
                                        stroke={isPositive ? '#8b5cf6' : '#f43f5e'}
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6, fill: '#fff', strokeWidth: 0 }}
                                        fill="url(#colorPrice)"
                                        filter="drop-shadow(0 0 8px rgba(139, 92, 246, 0.3))"
                                        animationDuration={1500}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
                            <motion.div
                                className="p-5 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                                whileHover={{ y: -5 }}
                            >
                                <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                                    Market Cap
                                </p>
                                <p className="text-2xl font-bold text-white tracking-tight">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(parseFloat(coin.marketCapUsd))}
                                </p>
                            </motion.div>
                            <motion.div
                                className="p-5 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                                whileHover={{ y: -5 }}
                            >
                                <p className="text-sm text-gray-400 mb-2">Volume (24h)</p>
                                <p className="text-2xl font-bold text-white tracking-tight">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(parseFloat(coin.volumeUsd24Hr))}
                                </p>
                            </motion.div>
                            <motion.div
                                className="p-5 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                                whileHover={{ y: -5 }}
                            >
                                <p className="text-sm text-gray-400 mb-2">Circulating Supply</p>
                                <p className="text-2xl font-bold text-white tracking-tight">
                                    {new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(parseFloat(coin.supply))} {coin.symbol}
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
