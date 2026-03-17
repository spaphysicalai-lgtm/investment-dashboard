'use client';

import { useState, useEffect } from 'react';
import type { CryptoOverview } from '@/types/crypto';

export default function CryptoPanel() {
  const [cryptoData, setCryptoData] = useState<CryptoOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchCryptoData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/crypto/overview', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch crypto data');
      }
      
      const data: CryptoOverview = await response.json();
      setCryptoData(data);
      
      const now = new Date();
      const timeString = now.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setLastUpdated(timeString);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load crypto data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoData();
    
    // 1분마다 자동 갱신
    const interval = setInterval(fetchCryptoData, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchCryptoData();
  };

  if (loading && !cryptoData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">🪙 Crypto</h2>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Loading Crypto Data...</p>
        </div>
      </div>
    );
  }

  if (error && !cryptoData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">🪙 Crypto</h2>
        <div className="flex items-center justify-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!cryptoData) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🪙 Crypto</h2>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-3 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-md transition-colors"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      <div className="space-y-3">
        {/* BTC-KRW */}
        <div className="flex justify-between items-center py-3 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-600">
            BTC-KRW ({cryptoData.btcKrw.exchange})
          </span>
          <span className="text-lg font-bold text-gray-900">
            ₩{cryptoData.btcKrw.price.toLocaleString('ko-KR')}
          </span>
        </div>

        {/* BTC-USD */}
        <div className="flex justify-between items-center py-3 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-600">
            BTC-USD ({cryptoData.btcUsd.exchange})
          </span>
          <span className="text-lg font-bold text-gray-900">
            ${cryptoData.btcUsd.price.toLocaleString('en-US')}
          </span>
        </div>

        {/* USD/KRW */}
        <div className="flex justify-between items-center py-3 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-600">USD/KRW</span>
          <span className="text-lg font-bold text-gray-900">
            ₩{cryptoData.fxUsdKrw.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Kimchi Premium */}
        <div className="flex justify-between items-center py-3 bg-purple-50 rounded-lg px-4">
          <span className="text-sm font-medium text-gray-700">Kimchi Premium</span>
          <span className={`text-lg font-bold ${
            cryptoData.kimchiPremium >= 0 ? 'text-red-600' : 'text-blue-600'
          }`}>
            {cryptoData.kimchiPremium >= 0 ? '+' : ''}{cryptoData.kimchiPremium.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Last updated: {lastUpdated}
        </div>
      )}
    </div>
  );
}
