import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { Coin } from '@/types/coin';

interface HeroProps {
    topCoins: Coin[];
}

export default function Hero({ topCoins }: HeroProps) {
    // Taking top 3 coins for the hero cards
    const heroCoins = topCoins.slice(0, 3);

    return (
        <div className="relative overflow-hidden py-16 sm:py-24">
            {/* Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary-600/20 rounded-full blur-3xl -z-10 opacity-50 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[400px] bg-secondary-600/10 rounded-full blur-3xl -z-10 opacity-30 pointer-events-none" />

            <div className="text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-glass-100 border border-white/10 text-sm font-medium mb-6">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary-500"></span>
                        </span>
                        Live Market Updates
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
                        Track the Future of <br />
                        <span className="text-gradient">Digital Currency</span>
                    </h1>

                    <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                        Real-time prices, advanced charts, and market analysis for the top cryptocurrencies.
                        Experience a premium interface built for the modern investor.
                    </p>

                    <div className="flex items-center justify-center gap-4">
                        <Link href="#market-table" className="glass-button flex items-center gap-2 text-lg px-8 py-3">
                            Explore Market <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </motion.div>

                {/* Floating Cards */}
                <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
                    {heroCoins.map((coin, index) => (
                        <motion.div
                            key={coin.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                        >
                            <Link href={`/coin/${coin.id}`} className="block group">
                                <div className="glass-card p-6 h-full hover:border-primary-500/50 transition-colors text-left relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <TrendingUp className="w-24 h-24 text-white" />
                                    </div>

                                    <div className="flex items-center gap-3 mb-4">
                                        <img
                                            src={`https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`}
                                            alt={coin.name}
                                            className="w-10 h-10 rounded-full"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 width=%2240%22 height=%2240%22%3E%3Ccircle cx=%2212%22 cy=%2212%22 r=%2212%22 fill=%22%23262626%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2210%22 fill=%22%23525252%22%3E%3F%3C/text%3E%3C/svg%3E';
                                            }}
                                        />
                                        <div>
                                            <h3 className="font-bold text-lg">{coin.name}</h3>
                                            <span className="text-xs text-gray-400">{coin.symbol}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-2xl font-bold">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(coin.priceUsd))}
                                        </div>
                                        <div className={`text-sm font-medium flex items-center gap-1 ${parseFloat(coin.changePercent24Hr) >= 0 ? 'text-secondary-500' : 'text-accent-500'}`}>
                                            {parseFloat(coin.changePercent24Hr) >= 0 ? '+' : ''}{parseFloat(coin.changePercent24Hr).toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
