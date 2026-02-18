import { DefaultSeoProps } from 'next-seo';

const config: DefaultSeoProps = {
    title: 'Crypto SEO SSR - Real-time Cryptocurrency Prices',
    description: 'Track real-time cryptocurrency prices, market cap, and trading volume. SEO-optimized and server-side rendered for best performance.',
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://crypto-seo-ssr.vercel.app/',
        siteName: 'Crypto SEO SSR',
        images: [
            {
                url: 'https://crypto-seo-ssr.vercel.app/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Crypto SEO SSR',
            },
        ],
    },
    twitter: {
        handle: '@handle',
        site: '@site',
        cardType: 'summary_large_image',
    },
};

export default config;
