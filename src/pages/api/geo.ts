import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket.remoteAddress) ?? '';

  console.log('[geo] x-forwarded-for:', req.headers['x-forwarded-for']);
  console.log('[geo] remoteAddress:', req.socket.remoteAddress);
  console.log('[geo] resolved ip:', ip);

  const isLocal = !ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.');
  if (isLocal) {
    console.log('[geo] local IP detected, skipping lookup');
    res.json({ country: 'Local' });
    return;
  }

  try {
    const response = await fetch(`https://ipwho.is/${ip}`);
    const data = await response.json();
    console.log('[geo] ipwho.is response:', JSON.stringify(data));
    res.json({ country: data.country ?? 'Unknown' });
  } catch (err) {
    console.error('[geo] fetch error:', err);
    res.json({ country: 'Unknown' });
  }
}
