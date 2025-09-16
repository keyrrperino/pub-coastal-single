import Head from 'next/head';
import { GameProvider } from '@/games/pub-coastal-game-spline/GlobalGameContext';
import { useEffect, useState } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import dynamic from 'next/dynamic';
import { UserSectorEnum } from '@/lib/enums';

const SplineFirebase = dynamic(() => import('@/components/SplineFirebase'), { ssr: false });

function HomePage() {
  const [room, setRoom] = useState<string | null>("testing");

  // useEffect(() => {
  //   const getFingerprint = async () => {
  //     const fp = await FingerprintJS.load();
  //     const result = await fp.get();
  //     if (result) {
  //       setRoom(result.visitorId ?? null);
  //     }
  //   };
  //   getFingerprint();
  // }, []);


  const [ sector, setSector ] = useState<string>("sector-1");
  const onClickSector = (sector: string) => {
    setSector(sector);
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
          {sector && room && (
            <SplineFirebase roomName={room} sector={sector} onClickSector={onClickSector} />
          )}
        </GameProvider>
      </main>
    </>
  );
}
export default dynamic(() => Promise.resolve(HomePage), { ssr: false });
