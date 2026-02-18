import { GetServerSideProps } from 'next';
import { NextSeo } from 'next-seo';
import Link from 'next/link';
import { getCoins } from '@/lib/coincap';
import { Coin } from '@/types/coin';
import { ArrowUp, ArrowDown, Search } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

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
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-8 px-4 sm:px-6 lg:px-8">
      <NextSeo
        title="Top 50 Cryptocurrencies Live Prices"
        description="Track the top 50 cryptocurrencies by market cap with real-time price updates, volume, and trading data."
        canonical="https://crypto-seo-ssr.vercel.app/"
      />

      <main className="max-w-7xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-4xl sm:tracking-tight">
              Cryptocurrency Prices
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Real-time prices and market caps for the top 50 assets.
            </p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
                placeholder="Search coins..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg bg-white dark:bg-zinc-800">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-zinc-700">
            <thead className="bg-gray-50 dark:bg-zinc-900">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">
                  Rank
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Name
                </th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  Price
                </th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  24h Change
                </th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  Market Cap
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700 bg-white dark:bg-zinc-800">
              {filteredCoins.length > 0 ? (
                filteredCoins.map((coin) => (
                  <tr key={coin.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 dark:text-gray-400 sm:pl-6">
                      {coin.rank}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      <Link href={`/coin/${coin.id}`} className="flex items-center gap-2 hover:underline">
                        <img
                          src={`https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`}
                          alt={coin.name}
                          className="w-6 h-6 rounded-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 width=%2224%22 height=%2224%22%3E%3Ccircle cx=%2212%22 cy=%2212%22 r=%2212%22 fill=%22%23E5E7EB%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2214%22 fill=%22%236B7280%22%3E%3F%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        <span className="font-bold">{coin.name}</span>
                        <span className="text-gray-500 dark:text-gray-400 font-normal">{coin.symbol}</span>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900 dark:text-white font-mono">
                      {formatCurrency(coin.priceUsd)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium">
                      <div className={clsx(
                        "flex items-center justify-end gap-1",
                        parseFloat(coin.changePercent24Hr) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      )}>
                        {parseFloat(coin.changePercent24Hr) >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                        {Math.abs(parseFloat(coin.changePercent24Hr)).toFixed(2)}%
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-500 dark:text-gray-400">
                      {formatMarketCap(coin.marketCapUsd)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    No coins found matching "{search}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
