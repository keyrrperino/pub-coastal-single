import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                {/* Typekit Font Loading */}
                <link rel="stylesheet" href="https://use.typekit.net/sam0gkj.css" />
                
                {/* Service Worker Registration */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            if ('serviceWorker' in navigator) {
                                window.addEventListener('load', function() {
                                    navigator.serviceWorker.register('/sw.js')
                                        .then(function(registration) {
                                            console.log('SW registered: ', registration);
                                            // Prompt waiting worker to activate immediately
                                            if (registration.waiting) {
                                                registration.waiting.postMessage('SKIP_WAITING');
                                            }
                                            // On update found, listen for installed state and reload once activated
                                            registration.addEventListener('updatefound', function() {
                                                var newWorker = registration.installing;
                                                if (!newWorker) return;
                                                newWorker.addEventListener('statechange', function() {
                                                    if (newWorker.state === 'installed') {
                                                        if (navigator.serviceWorker.controller) {
                                                            newWorker.postMessage('SKIP_WAITING');
                                                            // Reload to get the fresh version
                                                            window.location.reload();
                                                        }
                                                    }
                                                });
                                            });
                                        })
                                        .catch(function(registrationError) {
                                            console.log('SW registration failed: ', registrationError);
                                        });
                                });
                            }
                        `,
                    }}
                />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
