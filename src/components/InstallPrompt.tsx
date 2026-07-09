import React, { useState, useEffect } from 'react';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
      return;
    }

    // Android/Chrome install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setIsIOS(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSPrompt(true);
      return;
    }
    
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  if (isStandalone) return null;
  // If not iOS and no prompt available, browser might not support it or it's already installed
  if (!deferredPrompt && !isIOS) return null; 

  return (
    <>
      <button 
        onClick={handleInstallClick}
        className="fixed bottom-4 right-4 bg-primary text-on-primary px-4 py-2 rounded-full shadow-lg font-bold z-50 flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        Instalar App
      </button>

      {showIOSPrompt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60]" onClick={() => setShowIOSPrompt(false)}>
          <div className="bg-surface p-6 rounded-xl max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Instalar en iPhone</h3>
            <p className="mb-6 text-on-surface/80">
              Para instalar la app, pulsa el icono de <strong>Compartir</strong> (el cuadrado con la flecha hacia arriba) en el menú inferior y luego selecciona <strong>"Añadir a la pantalla de inicio"</strong>.
            </p>
            <button 
              onClick={() => setShowIOSPrompt(false)}
              className="bg-primary text-on-primary w-full py-3 rounded-lg font-bold"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
