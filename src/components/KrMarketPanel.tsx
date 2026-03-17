'use client';

import { useState, useEffect } from 'react';
import type { KrMarketOverview } from '@/types/market';

export default function KrMarketPanel() {
  const [marketData, setMarketData] = useState<KrMarketOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/market/kr', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch Korea market data');
      }
      
      const data: KrMarketOverview = await response.json();
      setMarketData(data);
      
      const now = new Date();
      const timeString = now.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setLastUpdated(timeString);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Korea market data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    
    // 1분마다 자동 갱신
    const interval = setInterval(fetchMarketData, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchMarketData();
  };

  if (loading && !marketData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">🇰🇷 Korea Market</h2>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !marketData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">🇰🇷 Korea Market</h2>
        <div className="flex items-center justify-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!marketData) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🇰🇷 Korea Market</h2>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-3 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-md transition-colors"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {/* 코스피 지수 */}
      <div className="mb-6 bg-green-50 rounded-lg p-4">
        <div className="text-sm text-gray-600 mb-1">{marketData.index.name}</div>
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold text-gray-900">
            {marketData.index.value.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`text-lg font-bold ${
            marketData.index.changePercent >= 0 ? 'text-red-600' : 'text-blue-600'
          }`}>
            {marketData.index.changePercent >= 0 ? '+' : ''}{Number(marketData.index.changePercent).toFixed(2)}%
          </span>
        </div>
      </div>

      {/* 상승률 상위 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-red-600">📈 상승 상위</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="py-2 text-left text-xs font-semibold text-gray-600">종목코드</th>
              <th className="py-2 text-left text-xs font-semibold text-gray-600">종목명</th>
              <th className="py-2 text-right text-xs font-semibold text-gray-600">현재가</th>
              <th className="py-2 text-right text-xs font-semibold text-gray-600">등락률</th>
            </tr>
          </thead>
          <tbody>
            {marketData.topGainers.map((stock) => (
              <tr key={stock.symbol} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 text-sm font-medium text-gray-900">{stock.symbol}</td>
                <td className="py-3 text-sm text-gray-600">{stock.name}</td>
                <td className="py-3 text-sm text-right font-semibold">₩{stock.price.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}</td>
                <td className="py-3 text-sm text-right font-bold text-red-600">
                  +{stock.changePercent.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 하락률 상위 */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-3 text-blue-600">📉 하락 상위</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="py-2 text-left text-xs font-semibold text-gray-600">종목코드</th>
              <th className="py-2 text-left text-xs font-semibold text-gray-600">종목명</th>
              <th className="py-2 text-right text-xs font-semibold text-gray-600">현재가</th>
              <th className="py-2 text-right text-xs font-semibold text-gray-600">등락률</th>
            </tr>
          </thead>
          <tbody>
            {marketData.topLosers.map((stock) => (
              <tr key={stock.symbol} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 text-sm font-medium text-gray-900">{stock.symbol}</td>
                <td className="py-3 text-sm text-gray-600">{stock.name}</td>
                <td className="py-3 text-sm text-right font-semibold">₩{stock.price.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}</td>
                <td className="py-3 text-sm text-right font-bold text-blue-600">
                  {stock.changePercent.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

