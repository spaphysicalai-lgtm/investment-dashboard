'use client';

import { useState, useEffect } from 'react';
import CryptoPanel from '@/components/CryptoPanel';
import UsMarketPanel from '@/components/UsMarketPanel';
import KrMarketPanel from '@/components/KrMarketPanel';

export default function DashboardPage() {
  const [lastUpdate, setLastUpdate] = useState('');

  useEffect(() => {
    // 클라이언트 사이드에서만 초기 시간 설정
    setLastUpdate(new Date().toLocaleString('ko-KR'));
  }, []);

  const handleRefresh = () => {
    setLastUpdate(new Date().toLocaleString('ko-KR'));
    // TODO: API 호출하여 실제 데이터 갱신
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📊 Investment Dashboard
              </h1>
              {lastUpdate && (
                <p className="mt-1 text-sm text-gray-600">
                  마지막 갱신: {lastUpdate}
                </p>
              )}
            </div>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CryptoPanel />
          <UsMarketPanel />
          <KrMarketPanel />
        </div>
      </div>
    </div>
  );
}
