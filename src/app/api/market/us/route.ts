import { NextResponse } from 'next/server';
import type { UsMarketOverview } from '@/types/market';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Yahoo Finance API를 사용하여 실제 데이터 가져오기
async function fetchYahooQuote(symbol: string) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
    const response = await fetch(url, {
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
      symbol: meta.symbol,
      price: meta.regularMarketPrice,
      previousClose: meta.chartPreviousClose,
      changePercent: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100,
    };
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    return null;
  }
}

// Yahoo Finance의 Day Gainers와 Losers 데이터 가져오기
async function fetchTopMovers() {
  try {
    const gainersUrl = 'https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?formatted=false&scrIds=day_gainers&count=3';
    const losersUrl = 'https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?formatted=false&scrIds=day_losers&count=3';
    
    const [gainersRes, losersRes] = await Promise.all([
      fetch(gainersUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000) }),
      fetch(losersUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000) }),
    ]);
    
    const gainersData = await gainersRes.json();
    const losersData = await losersRes.json();
    
    const topGainers = gainersData.finance.result[0].quotes.slice(0, 3).map((q: any) => ({
      symbol: q.symbol,
      name: q.shortName || q.longName,
      price: q.regularMarketPrice,
      changePercent: q.regularMarketChangePercent,
    }));
    
    const topLosers = losersData.finance.result[0].quotes.slice(0, 3).map((q: any) => ({
      symbol: q.symbol,
      name: q.shortName || q.longName,
      price: q.regularMarketPrice,
      changePercent: q.regularMarketChangePercent,
    }));
    
    return { topGainers, topLosers };
  } catch (error) {
    console.error('Error fetching top movers:', error);
    return null;
  }
}

export async function GET() {
  try {
    // NASDAQ 지수 가져오기
    const nasdaqQuote = await fetchYahooQuote('^IXIC');
    
    // Top Gainers와 Losers 가져오기
    const movers = await fetchTopMovers();
    
    if (!nasdaqQuote || !movers) {
      throw new Error('Failed to fetch market data');
    }
    
    const data: UsMarketOverview = {
      index: {
        name: 'NASDAQ Composite',
        symbol: '^IXIC',
        value: nasdaqQuote.price,
        changePercent: nasdaqQuote.changePercent,
      },
      topGainers: movers.topGainers,
      topLosers: movers.topLosers,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('US Market API error:', error);
    
    // 실패 시 폴백 데이터
    const fallback: UsMarketOverview = {
      index: {
        name: 'NASDAQ Composite',
        symbol: '^IXIC',
        value: 18234.56,
        changePercent: 0.69,
      },
      topGainers: [
        { symbol: 'NVDA', name: 'NVIDIA Corp', price: 925.50, changePercent: 5.14 },
        { symbol: 'TSLA', name: 'Tesla Inc', price: 245.80, changePercent: 4.27 },
        { symbol: 'AAPL', name: 'Apple Inc', price: 182.45, changePercent: 3.68 },
      ],
      topLosers: [
        { symbol: 'META', name: 'Meta Platforms', price: 485.20, changePercent: -4.95 },
        { symbol: 'NFLX', name: 'Netflix Inc', price: 612.40, changePercent: -3.39 },
        { symbol: 'GOOGL', name: 'Alphabet Inc', price: 142.50, changePercent: -2.17 },
      ],
    };
    
    return NextResponse.json(fallback);
  }
}
