import type { NextApiRequest, NextApiResponse } from 'next';
import { getCoinHistory } from '@/lib/coincap';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id, interval } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid id parameter' });
    }

    try {
        const history = await getCoinHistory(id, typeof interval === 'string' ? interval : '1D');
        res.status(200).json({ history });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
}
