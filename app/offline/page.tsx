'use client';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-border bg-gradient-to-br from-slate-800 to-card" />
            <div className="absolute inset-2 flex items-center justify-center">
              <svg
                className="h-8 w-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.111 16.251a.75.75 0 0 0 1.06 1.06m0-1.06a.75.75 0 1 1 1.06 1.06m-1.06-1.06L7.05 17.311m2.121-2.121a3 3 0 1 1 4.242 0M7.05 17.311a3 3 0 0 0 4.242 0"
                />
              </svg>
            </div>
          </div>
        </div>

        <h1 className="mb-3 text-3xl font-bold text-foreground">You're Offline</h1>
        <p className="mb-8 text-muted-foreground">
          Pathfinder requires an internet connection to work. Please check your network and try
          again.
        </p>

        <div className="space-y-3 text-sm text-muted-foreground">
          <p>✓ Check your internet connection</p>
          <p>✓ Try refreshing the page</p>
          <p>✓ Restart your device if needed</p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="mt-8 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-medium text-white transition-all hover:shadow-lg hover:shadow-blue-500/50"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}
