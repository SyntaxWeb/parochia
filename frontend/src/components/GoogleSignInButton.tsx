import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    google?: { accounts: { id: { initialize(options: { client_id: string; callback: (response: { credential?: string }) => void }): void; renderButton(element: HTMLElement, options: Record<string, unknown>): void; } } };
  }
}

export function GoogleSignInButton({ onCredential, text = 'signin_with' }: { onCredential: (credential: string) => void; text?: 'signin_with' | 'signup_with' | 'continue_with' }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  useEffect(() => {
    if (!clientId) return;
    if (window.google) { setReady(true); return; }
    const existing = document.getElementById('google-identity-services');
    if (existing) { existing.addEventListener('load', () => setReady(true), { once: true }); return; }
    const script = document.createElement('script');
    script.id = 'google-identity-services';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setReady(true);
    document.body.appendChild(script);
  }, [clientId]);

  useEffect(() => {
    if (!clientId || !ready || !window.google || !ref.current) return;
    ref.current.innerHTML = '';
    window.google.accounts.id.initialize({ client_id: clientId, callback: (response) => { if (response.credential) onCredential(response.credential); } });
    window.google.accounts.id.renderButton(ref.current, { theme: 'outline', size: 'large', width: '100%', text, shape: 'rectangular' });
  }, [clientId, ready, onCredential, text]);

  if (!clientId) return <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">Login com Google indisponivel: configure VITE_GOOGLE_CLIENT_ID.</p>;
  return <div ref={ref} className="min-h-10 w-full" />;
}
