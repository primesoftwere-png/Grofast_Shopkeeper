"use client";

import React, { useState, useEffect } from 'react';
import { getOrders } from '@/services/orderService';
import { getAllProducts } from '@/services/productService';
import { getToken } from '@/lib/axios';
import { initializeSocket, getSocket } from '@/services/socketService';

const ApiConnectionTest = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [socketStatus, setSocketStatus] = useState('Not Connected');

  useEffect(() => {
    // Initialize socket and check status
    const socket = initializeSocket();
    if (socket) {
      setSocketStatus(socket.connected ? 'Connected ✅' : 'Connecting...');
      
      socket.on('connect', () => {
        setSocketStatus('Connected ✅');
      });
      
      socket.on('disconnect', () => {
        setSocketStatus('Disconnected ❌');
      });
    }
  }, []);

  const testEndpoint = async (name, apiCall) => {
    setLoading(true);
    try {
      const response = await apiCall();
      setResults(prev => ({
        ...prev,
        [name]: { success: true, data: response }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [name]: { success: false, error: error.message || error.error || 'Unknown error' }
      }));
    } finally {
      setLoading(false);
    }
  };

  const testAll = async () => {
    setResults({});
    await testEndpoint('Orders', () => getOrders());
    await testEndpoint('Products', () => getAllProducts());
  };

  const token = getToken();

  return (
    <div className="p-6 bg-card rounded-2xl border border-border/50 space-y-4">
      <h2 className="text-xl font-bold">API Connection Test</h2>
      
      <div className="space-y-2">
        <div className="text-sm">
          <strong>Token Status:</strong> {token ? '✅ Present' : '❌ Missing'}
        </div>
        {token && (
          <div className="text-xs text-muted-foreground break-all">
            Token: {token.substring(0, 20)}...
          </div>
        )}
        <div className="text-sm">
          <strong>Socket Status:</strong> {socketStatus}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={testAll}
          disabled={loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test All Endpoints'}
        </button>
        <button
          onClick={() => testEndpoint('Orders', () => getOrders())}
          disabled={loading}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 disabled:opacity-50"
        >
          Test Orders
        </button>
        <button
          onClick={() => testEndpoint('Products', () => getAllProducts())}
          disabled={loading}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 disabled:opacity-50"
        >
          Test Products
        </button>
      </div>

      <div className="space-y-3">
        {Object.entries(results).map(([name, result]) => (
          <div key={name} className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold">{name}:</span>
              <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                {result.success ? '✅ Success' : '❌ Failed'}
              </span>
            </div>
            {result.success ? (
              <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            ) : (
              <div className="text-sm text-destructive">
                Error: {result.error}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiConnectionTest;
