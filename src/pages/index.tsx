import Head from 'next/head';
import { GameProvider } from '@/games/pub-coastal-game-spline/GlobalGameContext';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { APP_VERSION } from '@/lib/constants';

const SplineFirebase = dynamic(() => import('@/components/SplineFirebase'), { ssr: false });

interface NavigatorUserAgentDataBrand { brand: string; version: string }
interface NavigatorUserAgentData { brands?: NavigatorUserAgentDataBrand[] }



function HomePage() {

  const [room, setRoom] = useState<string | null>(null);
  const isChrome = navigator?.vendor?.includes('Google') || navigator?.vendor?.includes('google');
  const [uaDebug, setUaDebug] = useState<any | null>(null);
  const url = new URL(window.location.href);
  const currentV = url.searchParams.get('v');
  const allowAnyBrowser = url.searchParams.get('allowAnyBrowser');
  const debugUA = url.searchParams.get('debugUA');

  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  };

  const setCookie = (name: string, value: string, maxAgeSeconds: number): void => {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAgeSeconds}; path=/`;
  };

  // Enforce full-page redirect to include or correct ?v=APP_VERSION
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (currentV === APP_VERSION) return;
    url.searchParams.set('v', APP_VERSION);
    window.location.replace(url.toString());
  }, []);

  // Optional debug info for UA/UA-CH
  useEffect(() => {
    if (!(debugUA === '1' || debugUA === 'true')) return;
    const base: any = {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      vendor: typeof navigator !== 'undefined' ? (navigator as any).vendor : null,
      hasWindowChrome: typeof window !== 'undefined' ? !!(window as any).chrome : null,
    };
    const uaData = (navigator as Navigator & { userAgentData?: any }).userAgentData;
    if (uaData?.getHighEntropyValues) {
      uaData
        .getHighEntropyValues([
          'brands',
          'platform',
          'platformVersion',
          'uaFullVersion',
          'architecture',
          'bitness',
          'model',
          'mobile',
          'fullVersionList',
        ])
        .then((high: any) => setUaDebug({ ...base, high }))
        .catch(() => setUaDebug(base));
    } else {
      setUaDebug(base);
    }
  }, [debugUA]);

  useEffect(() => {
    const COOKIE_NAME = 'room';
    const existingRoom = getCookie(COOKIE_NAME);
    if (existingRoom) {
      setRoom(existingRoom);
      setCookie(COOKIE_NAME, existingRoom, 60 * 60 * 24); // 1 day
      return;
    }

    const getFingerprint = async () => {
      const { default: FingerprintJS } = await import('@fingerprintjs/fingerprintjs');
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      const id = result?.visitorId ?? null;
      if (id) {
        setRoom(id);
        setCookie(COOKIE_NAME, id, 60 * 60 * 24); // 1 day
      }
    };
    getFingerprint();
  }, []);


  const [ sector, setSector ] = useState<string>("sector-1");
  const onClickSector = (sector: string) => {
    setSector(sector);
  }

  if (!currentV || isChrome === null) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{`Coastal Game - Room ${room} Sector ${sector.replace('sector-', '')}`}</title>
        <meta name="description" content={`Coastal protection controller for Room ${room}, Sector ${sector.replace('sector-', '')}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/logo.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/assets/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/assets/icon-512x512.png" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href={`/api/manifest.json?room=${room}&sector=${sector}`} />
        
        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={`Room ${room} S${sector.replace('sector-', '')}`} />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/assets/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/assets/icon-192x192.png" />
        
        {/* Windows/MS */}
        <meta name="msapplication-TileImage" content="/assets/icon-512x512.png" />
        <meta name="msapplication-TileColor" content="#2563eb" />
      </Head>
      <main suppressHydrationWarning className="min-h-screen bg-gradient-to-b from-sky-100 to-blue-200 overflow-hidden">
        
        <GameProvider>
          {!isChrome && (
                      <div 
                      className="absolute inset-0 flex flex-col items-center justify-center z-10"
                    >
                      <div className="absolute inset-0 z-[-1]" style={{
                        backgroundImage: "url('/assets/bg-loading.webp')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: '#008DF0'
                      }} />
                      {/* Map overlay fill based on combined resources percentage */}
                      {(() => {
                        const combined = 100;
                        return (
                          <div
                            className="relative w-full flex items-end justify-center"
                          >
                            <img
                                    src="/assets/Loading Map BG.png"
                                    alt="Loading Map Overlay"
                                    className="w-[25%] h-auto select-none pointer-events-none"
                                    draggable={false}
                                  />
                            
                            <div className="absolute inset-0 flex items-end justify-center">
                              <div className="w-[27%] h-full relative pt-[200px]">
                                <div
                                  className="absolute bottom-[-1vh] left-0 right-0 overflow-hidden flex items-end justify-center"
                                  style={{ height: `${combined}%` }}
                                >
                                  <img
                                    src="/assets/Loading Map Overlay.png"
                                    alt="Loading Map Overlay"
                                    className="w-full h-auto select-none pointer-events-none"
                                    draggable={false}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
          
                      <h2 className="mt-5 text-white text-2xl md:text-4xl font-extrabold tracking-wide text-center uppercase">
                      TO FULLY ENJOY THE GAME, <br />PLEASE VISIT THIS SITE ON GOOGLE CHROME
                      </h2>
                      {(debugUA === '1' || debugUA === 'true') && (
                        <div className="mt-6 w-full max-w-[720px] px-4">
                          <div className="bg-white/90 text-black rounded-lg p-4 shadow-lg text-sm overflow-auto max-h-[40vh]">
                            <div className="font-semibold mb-2">UA Debug</div>
                            <pre className="whitespace-pre-wrap break-words">{JSON.stringify(uaDebug ?? {
                              userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                              vendor: typeof navigator !== 'undefined' ? (navigator as any).vendor : null,
                              hasWindowChrome: typeof window !== 'undefined' ? !!(window as any).chrome : null,
                            }, null, 2)}</pre>
                            <div className="mt-2 text-xs opacity-80">Add <code>?allowAnyBrowser=1</code> to bypass temporarily.</div>
                          </div>
                        </div>
                      )}
                    </div>
          )}
          {isChrome && sector && room && (
            <SplineFirebase roomName={room} sector={sector} onClickSector={onClickSector} />
          )}
        </GameProvider>
      </main>
    </>
  );
}
export default dynamic(() => Promise.resolve(HomePage), { ssr: false });
