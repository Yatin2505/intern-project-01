import React, { ReactNode } from 'react';
import Link from 'next/link';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const [isConnected, setIsConnected] = React.useState(false);

    const handleConnect = () => {
        setIsConnected(!isConnected);
    };

    return (
        <div className="min-h-screen flex flex-col font-sans text-foreground bg-background selection:bg-primary-500/30">
            <header className="fixed top-0 w-full z-50 glass-card rounded-none border-x-0 border-t-0 border-b border-white/10 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                        C
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        CryptoView
                    </span>
                </Link>
                <nav className="flex items-center gap-6">
                    <Link href="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                        Market
                    </Link>
                    <Link href="/watchlist" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                        Watchlist
                    </Link>
                    <button
                        onClick={handleConnect}
                        className={`text-sm py-1.5 px-4 rounded-lg transition-all ${isConnected
                                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50'
                                : 'glass-button'
                            }`}
                    >
                        {isConnected ? 'Connected: 0x...1234' : 'Connect Wallet'}
                    </button>
                </nav>
            </header>

            <main className="flex-grow pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full animate-fade-in">
                {children}
            </main>

            <footer className="border-t border-white/5 py-8 mt-auto">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
                    <p>© 2026 CryptoView. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-primary-500 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-primary-500 transition-colors">Terms</a>
                        <a href="#" className="hover:text-primary-500 transition-colors">API</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
