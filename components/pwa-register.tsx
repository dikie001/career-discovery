'use client';

import { useEffect } from 'react';
import { PWAInstallPrompt } from './pwa-install-prompt';

export function PWARegister() {
  useEffect(() => {
    // Check if PWA is enabled
    if (!process.env.NEXT_PUBLIC_ENABLE_PWA) {
      console.log('PWA is disabled');
      return;
    }

    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.log('Service Workers are not supported in this browser');
      return;
    }

    const registerServiceWorker = async () => {
      try {
        // Register the new service worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });

        console.log('Service Worker registered successfully:', registration);

        // Check for updates periodically
        const updateInterval = setInterval(() => {
          registration.update();
        }, 60000); // Check every minute

        // Listen for service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                console.log('New service worker available, update ready');
                // Notify user about update if needed
                const event = new Event('swUpdateAvailable');
                window.dispatchEvent(event);
              }
            });
          }
        });

        return () => clearInterval(updateInterval);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    // Wait for the DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', registerServiceWorker);
    } else {
      registerServiceWorker();
    }

    // Cleanup
    return () => {
      document.removeEventListener('DOMContentLoaded', registerServiceWorker);
    };
  }, []);

  return <PWAInstallPrompt />;
}
