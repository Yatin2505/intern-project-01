import type { NextApiRequest, NextApiResponse } from 'next';
import { getCoinsByIds } from '@/lib/coincap';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { ids } = req.query;

    if (!ids || typeof ids !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid ids parameter' });
    }

    const idList = ids.split(',').filter(id => id.trim() !== '');

    try {
        const coins = await getCoinsByIds(idList);
        res.status(200).json({ coins });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Failed to fetch coins' });
    }
}
