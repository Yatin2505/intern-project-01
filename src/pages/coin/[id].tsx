import { GetServerSideProps } from 'next';
import { NextSeo, ArticleJsonLd } from 'next-seo';
import Link from 'next/link';
import { getCoinDetails, getCoinHistory } from '@/lib/coincap';
import { Coin, CoinHistory } from '@/types/coin';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ArrowLeft, ExternalLink } from 'lucide-react';

interface CoinDetailProps {
    coin: Coin | null;
    history: CoinHistory[];
    lastUpdated: string;
}

export const getServerSideProps: GetServerSideProps<CoinDetailProps> = async (context) => {
    const { id } = context.params as { id: string };
    const [coin, history] = await Promise.all([
        getCoinDetails(id),
        getCoinHistory(id, 'h1'), // Hour intervals for last 24h
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

export default function CoinDetail({ coin, history, lastUpdated }: CoinDetailProps) {
    if (!coin) return null;

    const chartData = history.map(point => ({
        date: new Date(point.time).toLocaleTimeString(),
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

            <main className="max-w-7xl mx-auto">
                <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to List
                </Link>

                <div className="bg-white dark:bg-zinc-800 shadow rounded-lg overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <img
                                    src={`https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`}
                                    alt={coin.name}
                                    className="w-16 h-16 rounded-full"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 width=%2264%22 height=%2264%22%3E%3Ccircle cx=%2212%22 cy=%2212%22 r=%2212%22 fill=%22%23E5E7EB%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2214%22 fill=%22%236B7280%22%3E%3F%3C/text%3E%3C/svg%3E';
                                    }}
                                />
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{coin.name}</h1>
                                    <span className="text-lg text-gray-500 dark:text-gray-400 font-medium">{coin.symbol}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(coin.priceUsd)}</p>
                                <p className={`text-lg font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                    {isPositive ? '+' : ''}{priceChange.toFixed(2)}% (24h)
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 h-96 w-full">
                            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Price History (24h)</h2>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="date"
                                        minTickGap={30}
                                        tick={{ fontSize: 12, fill: '#6B7280' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        domain={['auto', 'auto']}
                                        tickFormatter={(val) => `$${val.toLocaleString()}`}
                                        tick={{ fontSize: 12, fill: '#6B7280' }}
                                        axisLine={false}
                                        tickLine={false}
                                        width={80}
                                    />
                                    <Tooltip
                                        formatter={(value: any) => [`${formatCurrency(value)}`, 'Price']}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="price"
                                        stroke={isPositive ? '#16A34A' : '#DC2626'}
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="bg-gray-50 dark:bg-zinc-700/50 overflow-hidden rounded-lg p-4">
                                <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Market Cap</dt>
                                <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{formatCurrency(coin.marketCapUsd)}</dd>
                            </div>
                            <div className="bg-gray-50 dark:bg-zinc-700/50 overflow-hidden rounded-lg p-4">
                                <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Volume (24h)</dt>
                                <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{formatCurrency(coin.volumeUsd24Hr)}</dd>
                            </div>
                            <div className="bg-gray-50 dark:bg-zinc-700/50 overflow-hidden rounded-lg p-4">
                                <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Supply</dt>
                                <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                                    {parseFloat(coin.supply).toLocaleString()} {coin.symbol}
                                </dd>
                            </div>
                            <div className="bg-gray-50 dark:bg-zinc-700/50 overflow-hidden rounded-lg p-4">
                                <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Details</dt>
                                <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                                    {coin.explorer && (
                                        <a href={coin.explorer} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                                            Explorer <ExternalLink className="w-4 h-4 ml-1" />
                                        </a>
                                    )}
                                </dd>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
