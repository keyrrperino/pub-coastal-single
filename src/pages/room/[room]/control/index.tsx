import Head from 'next/head';
import dynamic from 'next/dynamic';
import { GameProvider } from '@/games/pub-coastal-game-spline/GlobalGameContext';
import { GetStaticPaths, GetStaticProps } from 'next';
import SplineFirebase from '@/components/SplineFirebase';
import { useState } from 'react';

const SectorControl = dynamic(() => import('@/components/coastal-protection/SectorControl'), { ssr: false });

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking"
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { room } = params as { room: string; };

  console.log('Room:', room);

  // const allowedSectors = ['sector-1', 'sector-2', 'sector-3'];

  return {
    props: { room },
  };
};

export default function SectorPage({ room }: { room: string }) {
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
      <GameProvider>
        {/* <SplineFirebase roomName={room} /> */}
        {sector && room && <SectorControl onClickSector={onClickSector} sector={sector} roomName={room} />}
      </GameProvider>
    </>
  );
}