import "@/styles/globals.css";
import "@/styles/game.css";
import type { AppProps } from "next/app";
import { ServerTimeProvider } from "@/components/ServerTimeContext";
import { useEffect, useState } from "react";

function MobileWarning() {
  return (
    <div className="relative w-full h-[100dvh] overflow-hidden flex flex-col">
      {/* Ocean background */}
      <img
        src="/assets/bg.webp"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Top section */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-8 pt-10">
        <h1
          className="text-white text-center text-[8vw] leading-tight uppercase drop-shadow-lg"
          style={{ fontFamily: 'novecento-sans-narrow, sans-serif', fontWeight: 800 }}
        >
          NOT OPTIMIZED FOR MOBILE, PLEASE PLAY ON DESKTOP OR TABLET
        </h1>
        <img
          src="/assets/Loading Map Overlay.webp"
          alt="Island map"
          className="w-full max-w-[80vw] object-contain mt-6"
        />
      </div>
      {/* Bottom panel */}
      <div className="relative z-10 bg-[#0a1f3d] px-8 py-8 text-center">
        <p
          className="text-white text-[4vw] uppercase leading-snug"
          style={{ fontFamily: 'novecento-sans-narrow, sans-serif', fontWeight: 700 }}
        >
          WE&apos;RE GLAD YOU&apos;RE INTERESTED IN THE GAME! IT&apos;S NOT AVAILABLE ON MOBILE, BUT YOU CAN{' '}
          <span className="text-[#FFD447]">
            ENJOY THE FULL EXPERIENCE ON A TABLET, LAPTOP, OR DESKTOP.
          </span>
        </p>
      </div>
    </div>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const isPhone = () => {
      const ua = navigator.userAgent;
      // Detect phone-class devices via user agent
      const isPhoneUA = /iPhone|Android.*Mobile|Mobile.*Android|BlackBerry|IEMobile|Opera Mini|Windows Phone/i.test(ua);
      // iPads sometimes report as phone-sized in portrait — exclude them
      const isTabletUA = /iPad|Android(?!.*Mobile)/i.test(ua);
      // Also catch phones by screen width (covers landscape too via screen.width which is physical)
      const isSmallScreen = Math.min(window.screen.width, window.screen.height) < 600;
      return (isPhoneUA && !isTabletUA) || isSmallScreen;
    };
    const check = () => setIsMobile(isPhone());
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isMobile) return <MobileWarning />;

  return (
    <ServerTimeProvider>
      <div>
        <Component {...pageProps} />
      </div>
    </ServerTimeProvider>
  );
}