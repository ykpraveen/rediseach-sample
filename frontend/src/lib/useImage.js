import { useEffect, useState } from 'react';

export default function useImage(src) {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!src) {
      setStatus('failed');
      return;
    }

    let cancelled = false;
    const img = new Image();
    img.onload = () => { if (!cancelled) setStatus('loaded'); };
    img.onerror = () => { if (!cancelled) setStatus('failed'); };
    img.src = src;

    return () => { cancelled = true; };
  }, [src]);

  return status;
}
