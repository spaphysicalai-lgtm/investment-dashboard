import { NextResponse } from 'next/server';
import type { CryptoOverview } from '@/types/crypto';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fallback 데이터
    const fallback: CryptoOverview = {
      btcKrw: { price: 100000000, exchange: 'Upbit' },
      btcUsd: { price: 70000, exchange: 'Binance' },
      fxUsdKrw: 1300,
      kimchiPremium: 0,
    };

    let btcKrwPrice = fallback.btcKrw.price;
    let btcUsdPrice = fallback.btcUsd.price;
    let fxUsdKrw = fallback.fxUsdKrw;

    // 1. 업비트 BTC-KRW 호출
    try {
      const upbitResponse = await fetch('https://api.upbit.com/v1/ticker?markets=KRW-BTC', {
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      if (upbitResponse.ok) {
        const upbitData = await upbitResponse.json();
        if (upbitData && upbitData[0] && upbitData[0].trade_price) {
          btcKrwPrice = upbitData[0].trade_price;
        }
      }
    } catch (error) {
      console.error('Upbit API error:', error);
    }

    // 2. Binance BTC-USDT 호출 (CoinGecko 대신 사용 - Rate Limit이 더 넉넉함)
    try {
      const binanceResponse = await fetch(
        'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT',
        {
          cache: 'no-store',
          next: { revalidate: 0 }
        }
      );
      if (binanceResponse.ok) {
        const binanceData = await binanceResponse.json();
        if (binanceData && binanceData.price) {
          btcUsdPrice = parseFloat(binanceData.price);
        }
      }
    } catch (error) {
      console.error('Binance API error:', error);
    }

    // 3. 환율 USD/KRW 호출
    try {
      const exchangeResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      if (exchangeResponse.ok) {
        const exchangeData = await exchangeResponse.json();
        if (exchangeData && exchangeData.rates && exchangeData.rates.KRW) {
          fxUsdKrw = exchangeData.rates.KRW;
        }
      }
    } catch (error) {
      console.error('Exchange Rate API error:', error);
    }

    // 4. 김치프리미엄 계산
    const kimchiPremium = ((btcKrwPrice - btcUsdPrice * fxUsdKrw) / (btcUsdPrice * fxUsdKrw)) * 100;

    const result: CryptoOverview = {
      btcKrw: {
        price: btcKrwPrice,
        exchange: 'Upbit',
      },
      btcUsd: {
        price: btcUsdPrice,
        exchange: 'Binance',
      },
      fxUsdKrw: fxUsdKrw,
      kimchiPremium: kimchiPremium,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('API error:', error);
    
    // 전체 실패 시 fallback 반환
    const fallback: CryptoOverview = {
      btcKrw: { price: 100000000, exchange: 'Upbit' },
      btcUsd: { price: 70000, exchange: 'Binance' },
      fxUsdKrw: 1300,
      kimchiPremium: 0,
    };
    
    return NextResponse.json(fallback);
  }
}
