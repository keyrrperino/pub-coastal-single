import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket.remoteAddress) ?? '';

  console.log('[geo] resolved ip:', ip);

  const isLocal = !ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.');
  if (isLocal) {
    res.json({ country: 'Local' });
    return;
  }

  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    console.log('[geo] ipapi.co response:', JSON.stringify(data));
    res.json({ country: data.country_name ?? 'Unknown' });
  } catch (err) {
    console.error('[geo] error:', err);
    res.json({ country: 'Unknown' });
  }
}
