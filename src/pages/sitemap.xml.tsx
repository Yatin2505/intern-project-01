import { GetServerSideProps } from 'next';
import { getCoins } from '@/lib/coincap';

function generateSiteMap(coins: any[]) {
    const baseUrl = 'https://crypto-seo-ssr.vercel.app';
    return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>${baseUrl}</loc>
       <changefreq>hourly</changefreq>
       <priority>1.0</priority>
     </url>
     ${coins
            .map(({ id }) => {
                return `
       <url>
           <loc>${baseUrl}/coin/${id}</loc>
           <changefreq>hourly</changefreq>
           <priority>0.8</priority>
       </url>
     `;
            })
            .join('')}
   </urlset>
 `;
}

function SiteMap() {
    // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
    // We make an API call to gather the URLs for our site
    const coins = await getCoins(100);

    // We generate the XML sitemap with the posts data
    const sitemap = generateSiteMap(coins);

    res.setHeader('Content-Type', 'text/xml');
    // we send the XML to the browser
    res.write(sitemap);
    res.end();

    return {
        props: {},
    };
};

export default SiteMap;
