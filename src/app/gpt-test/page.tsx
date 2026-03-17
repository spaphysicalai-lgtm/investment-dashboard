'use client';

import { useState } from 'react';
import Link from 'next/link';

type ModeType = 'text' | 'image';

export default function GptTestPage() {
  const [mode, setMode] = useState<ModeType>('text');
  const [prompt, setPrompt] = useState('Hello! Tell me about investing in simple terms.');
  const [imagePrompt, setImagePrompt] = useState('A beautiful landscape with mountains and a lake at sunset');
  const [response, setResponse] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTest = async () => {
    const currentPrompt = mode === 'text' ? prompt : imagePrompt;
    
    if (!currentPrompt.trim()) {
      setError('프롬프트를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setResponse('');
    setImageUrl('');

    try {
      const res = await fetch('/api/gpt/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: currentPrompt,
          type: mode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'API 호출 실패');
      }

      if (mode === 'text') {
        setResponse(data.response);
      } else {
        setImageUrl(data.imageUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'API 호출 중 오류 발생');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-900">🤖 Replicate AI 테스트</h1>
          <Link
            href="/"
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white transition-colors"
          >
            ← 홈으로
          </Link>
        </div>

        {/* Mode Tabs */}
        <div className="bg-white rounded-lg shadow-lg p-2 mb-6 flex gap-2">
          <button
            onClick={() => setMode('text')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
              mode === 'text'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            💬 텍스트 생성 (Claude 4.5)
          </button>
          <button
            onClick={() => setMode('image')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
              mode === 'image'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🎨 이미지 생성 (Flux Schnell)
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 mb-2">
            💡 <strong>Replicate API 설정:</strong> 프로젝트 루트에 <code className="bg-blue-100 px-2 py-1 rounded">.env.local</code> 파일을 생성하고 다음 정보를 입력하세요:
          </p>
          <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded font-mono mb-2">
            REPLICATE_API_TOKEN=r8_your-token-here<br />
            REPLICATE_TEXT_MODEL=anthropic/claude-4.5-sonnet<br />
            REPLICATE_IMAGE_MODEL=black-forest-labs/flux-schnell
          </div>
          <details className="text-xs text-blue-700 mt-2">
            <summary className="cursor-pointer font-semibold">📌 API 토큰 발급 및 모델 정보</summary>
            <ol className="mt-2 ml-4 space-y-1 list-decimal">
              <li><a href="https://replicate.com/account/api-tokens" target="_blank" rel="noopener noreferrer" className="underline">Replicate API 토큰 페이지</a> 접속</li>
              <li><strong>"Create token"</strong> 클릭하여 새 API 토큰 생성</li>
              <li>생성된 토큰을 복사 (r8_로 시작)</li>
              <li>사용 모델:
                <ul className="ml-4 mt-1">
                  <li>💬 텍스트: <code className="bg-blue-100 px-1 rounded">anthropic/claude-4.5-sonnet</code> (Anthropic Claude)</li>
                  <li>🎨 이미지: <code className="bg-blue-100 px-1 rounded">black-forest-labs/flux-schnell</code> (Black Forest Labs Flux Schnell)</li>
                </ul>
              </li>
            </ol>
          </details>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {mode === 'text' ? '텍스트 프롬프트:' : '이미지 설명 (영어):'}
          </label>
          {mode === 'text' ? (
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="GPT에게 질문을 입력하세요..."
            />
          ) : (
            <textarea
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Generate an image of..."
            />
          )}
          <button
            onClick={handleTest}
            disabled={loading}
            className={`mt-4 w-full px-6 py-3 text-white font-semibold rounded-lg transition-colors ${
              mode === 'text'
                ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400'
                : 'bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400'
            }`}
          >
            {loading 
              ? (mode === 'text' ? '텍스트 생성 중... (최대 90초)' : '이미지 생성 중... (최대 90초)')
              : (mode === 'text' ? '💬 텍스트 생성' : '🎨 이미지 생성')
            }
          </button>
          {loading && (
            <p className="mt-2 text-xs text-gray-500 text-center">
              {mode === 'text' 
                ? '⏳ LLM 모델 추론 중입니다. 첫 호출은 시간이 더 걸릴 수 있습니다.'
                : '⏳ 이미지 생성 중입니다. 고품질 이미지를 만들고 있습니다.'
              }
            </p>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">
              <strong>오류:</strong> {error}
            </p>
          </div>
        )}

        {/* Text Response Display */}
        {mode === 'text' && response && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">💬 텍스트 응답:</h2>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-800 whitespace-pre-wrap">{response}</p>
            </div>
          </div>
        )}

        {/* Image Response Display */}
        {mode === 'image' && imageUrl && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">🎨 생성된 이미지:</h2>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <img 
                src={imageUrl} 
                alt="Generated" 
                className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
              />
              <div className="mt-4 text-center">
                <a 
                  href={imageUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  🔗 새 탭에서 열기
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
