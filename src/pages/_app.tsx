import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from 'next/font/google';
import Layout from "@/components/layout/Layout";
import { DefaultSeo } from 'next-seo';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${inter.variable} font-sans`}>
      <DefaultSeo
        title="CryptoView - Premium Crypto Tracker"
        description="Real-time cryptocurrency prices, charts, and market analysis with a premium glassmorphic interface."
        openGraph={{
          type: 'website',
          locale: 'en_IE',
          url: 'https://crypto-view-premium.vercel.app/',
          siteName: 'CryptoView',
        }}
        themeColor="#0a0a0a"
      />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </div>
  );
}
