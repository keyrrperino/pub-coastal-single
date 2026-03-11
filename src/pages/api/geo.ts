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

  // Try ipwho.is first
  try {
    const response = await fetch(`https://ipwho.is/${ip}`);
    const data = await response.json();
    console.log('[geo] ipwho.is response:', JSON.stringify(data));
    if (data.success && data.country) {
      res.json({ country: data.country });
      return;
    }
    console.warn('[geo] ipwho.is failed or no country, trying fallback');
  } catch (err) {
    console.error('[geo] ipwho.is error:', err);
  }

  // Fallback: ipapi.co
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    console.log('[geo] ipapi.co response:', JSON.stringify(data));
    if (data.country_name) {
      res.json({ country: data.country_name });
      return;
    }
    console.warn('[geo] ipapi.co failed or no country');
  } catch (err) {
    console.error('[geo] ipapi.co error:', err);
  }

  res.json({ country: 'Unknown' });
}
