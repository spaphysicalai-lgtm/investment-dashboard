import { NextResponse } from 'next/server';
import type { KrMarketOverview } from '@/types/market';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Yahoo Finance API를 사용하여 KOSPI 지수 가져오기
async function fetchKospiIndex() {
  try {
    const url = 'https://query1.finance.yahoo.com/v8/finance/chart/%5EKS11';
    const response = await fetch(url, {
      cache: 'no-store',
      next: { revalidate: 0 },
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      signal: AbortSignal.timeout(8000),
    });
    
    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }
    
    const data = await response.json();
    const quote = data.chart.result[0];
    const meta = quote.meta;
    
    return {
      name: 'KOSPI',
      symbol: 'KS11',
      value: meta.regularMarketPrice,
      changePercent: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100,
    };
  } catch (error) {
    console.error('Error fetching KOSPI:', error);
    return null;
  }
}

// Yahoo Finance에서 한국 주식 상위 종목 가져오기
async function fetchKoreanStocks() {
  try {
    // 한국의 주요 종목 심볼 (Yahoo Finance 형식)
    const symbols = [
      '005930.KS', // 삼성전자
      '000660.KS', // SK하이닉스  
      '005380.KS', // 현대차
      '005490.KS', // POSCO홀딩스
      '035720.KS', // 카카오
      '006400.KS', // 삼성SDI
      '000270.KS', // 기아
      '105560.KS', // KB금융
      '051910.KS', // LG화학
      '035420.KS', // NAVER
    ];
    
    const promises = symbols.map(async (symbol) => {
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
        const response = await fetch(url, {
          cache: 'no-store',
          next: { revalidate: 0 },
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(5000),
        });
        
        if (!response.ok) return null;
        
        const data = await response.json();
        const quote = data.chart.result[0];
        const meta = quote.meta;
        
        return {
          symbol: symbol.replace('.KS', ''),
          name: meta.longName || meta.shortName || symbol,
          price: meta.regularMarketPrice,
          changePercent: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100,
        };
      } catch {
        return null;
      }
    });
    
    const results = await Promise.all(promises);
    const validStocks = results.filter((s) => s !== null);
    
    // 등락률 기준으로 정렬
    validStocks.sort((a, b) => b.changePercent - a.changePercent);
    
    return {
      topGainers: validStocks.slice(0, 3),
      topLosers: validStocks.slice(-3).reverse(),
    };
  } catch (error) {
    console.error('Error fetching Korean stocks:', error);
    return null;
  }
}

export async function GET() {
  try {
    // KOSPI 지수와 종목 데이터 동시에 가져오기
    const [kospiIndex, stocks] = await Promise.all([
      fetchKospiIndex(),
      fetchKoreanStocks(),
    ]);
    
    if (!kospiIndex || !stocks) {
      throw new Error('Failed to fetch Korea market data');
    }
    
    const data: KrMarketOverview = {
      index: kospiIndex,
      topGainers: stocks.topGainers,
      topLosers: stocks.topLosers,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Korea Market API error:', error);
    
    // 실패 시 폴백 데이터
    const fallback: KrMarketOverview = {
      index: {
        name: 'KOSPI',
        symbol: 'KOSPI',
        value: 2654.32,
        changePercent: 0.70,
      },
      topGainers: [
        { symbol: '005930', name: '삼성전자', price: 76500, changePercent: 4.79 },
        { symbol: '000660', name: 'SK하이닉스', price: 185000, changePercent: 4.52 },
        { symbol: '035720', name: '카카오', price: 48200, changePercent: 3.56 },
      ],
      topLosers: [
        { symbol: '005380', name: '현대차', price: 238000, changePercent: -4.80 },
        { symbol: '000270', name: '기아', price: 102500, changePercent: -3.47 },
        { symbol: '012330', name: '현대모비스', price: 265000, changePercent: -2.16 },
      ],
    };
    
    return NextResponse.json(fallback);
  }
}
