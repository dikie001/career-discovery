'use client';

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    // Only register service worker in production
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.log('Service Workers are not supported in this browser');
      return;
    }

    const registerServiceWorker = async () => {
      try {
        // Unregister any existing service workers first
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          await registration.unregister();
        }

        // Register the new service worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });

        console.log('Service Worker registered successfully:', registration);

        // Check for updates periodically
        setInterval(() => {
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
              }
            });
          }
        });
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

  return null;
}
