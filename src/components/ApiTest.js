"use client";

import { useEffect, useState } from 'react';

export default function ApiTest() {
  const [apiUrl, setApiUrl] = useState('');
  
  useEffect(() => {
    // Read from environment variable, fallback to localhost
    let url = process.env.NEXT_PUBLIC_API_URL || 'http://172.20.10.5:8000';
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    setApiUrl(url);
    console.log('🔧 Axios Base URL:', url);
    console.log('🔧 Example Login URL:', `${url}/api/shopkeeper/auth/login`);
    console.log('🔧 Example Register URL:', `${url}/api/shopkeeper/auth/register/basic`);
    console.log('🔧 Example Products URL:', `${url}/api/shopkeeper/product/all`);
    console.log('🔧 Example Orders URL:', `${url}/api/shopkeeper/orders`);
  }, []);
  
  return (
    <div className="fixed bottom-4 right-4 bg-card border border-border rounded-xl p-3 shadow-elevated text-xs max-w-xs z-50">
      <div className="font-semibold text-foreground mb-1">✅ Axios Configuration</div>
      <div className="text-muted-foreground">
        <span className="font-medium">Base URL:</span> {apiUrl}
      </div>
      <div className="text-muted-foreground text-[10px] mt-1">
        All API calls go to: {apiUrl}
      </div>
      <div className="text-primary-dark text-[10px] mt-1 font-medium">
        Check console for API request logs
      </div>
    </div>
  );
}
