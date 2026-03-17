'use client';

import { useState, useEffect } from 'react';
import type { CryptoOverview } from '@/types/crypto';

export default function CryptoPanel() {
  const [cryptoData, setCryptoData] = useState<CryptoOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string>('');

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

  const fetchAIAdvice = async () => {
    if (!cryptoData) return;

    setAiLoading(true);
    setAiError('');

    try {
      const prompt = `현재 비트코인 시장 상황:
- 한국 가격 (업비트): ${cryptoData.btcKrw.price.toLocaleString('ko-KR')}원
- 미국 가격 (CoinGecko): $${cryptoData.btcUsd.price.toLocaleString('en-US')}
- 환율 (USD/KRW): ${cryptoData.fxUsdKrw.toFixed(2)}원
- 김치프리미엄: ${cryptoData.kimchiPremium.toFixed(2)}%

위 데이터를 바탕으로 비트코인 투자 의견을 3-4문장으로 간단명료하게 제시해주세요. 매수, 매도, 관망 중 하나를 추천하고 그 이유를 설명해주세요.`;

      const response = await fetch('/api/gpt/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          type: 'text',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'AI 조언을 가져오는데 실패했습니다.');
      }

      setAiAdvice(data.response);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'AI 조언을 가져오는데 실패했습니다.');
    } finally {
      setAiLoading(false);
    }
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

      {/* AI Investment Advice */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={fetchAIAdvice}
          disabled={aiLoading || !cryptoData}
          className="w-full px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 rounded-lg transition-all shadow-md hover:shadow-lg"
        >
          {aiLoading ? '🤖 AI 분석 중...' : '🤖 AI 투자 의견 받기'}
        </button>

        {aiError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{aiError}</p>
          </div>
        )}

        {aiAdvice && !aiError && (
          <div className="mt-3 p-4 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-2xl">🤖</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800 mb-1">AI 투자 의견</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {aiAdvice}
                </p>
              </div>
            </div>
          </div>
        )}
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
