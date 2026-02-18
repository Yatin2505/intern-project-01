import { GetServerSideProps } from 'next';
import { NextSeo } from 'next-seo';
import Link from 'next/link';
import { getCoins } from '@/lib/coincap';
import { Coin } from '@/types/coin';
import { ArrowUp, ArrowDown, Search } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';
import Hero from '@/components/home/Hero';
import { motion } from 'framer-motion';

interface HomeProps {
  coins: Coin[];
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  const coins = await getCoins(50);
  return {
    props: {
      coins,
    },
  };
};

export default function Home({ coins }: HomeProps) {
  const [search, setSearch] = useState('');

  const filteredCoins = coins.filter(coin =>
    coin.name.toLowerCase().includes(search.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(search.toLowerCase())
  );

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
        title="Top 50 Cryptocurrencies Live Prices"
        description="Track the top 50 cryptocurrencies by market cap with real-time price updates, volume, and trading data."
        canonical="https://crypto-seo-ssr.vercel.app/"
      />

      {/* Hero Section */}
      <Hero topCoins={coins} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="market-table">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-bold">Market Trends</h2>

          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-xl border border-white/10 bg-glass-100 py-2.5 pl-10 pr-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="Search coins..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <motion.div
          className="glass-card overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5">
              <thead className="bg-white/5">
                <tr>
                  <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
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
                {filteredCoins.length > 0 ? (
                  filteredCoins.map((coin) => (
                    <tr key={coin.id} className="hover:bg-white/5 transition-colors group">
                      <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm text-gray-500 font-mono">
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-sm text-gray-500">
                      No coins found matching "{search}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </>
  );
}
