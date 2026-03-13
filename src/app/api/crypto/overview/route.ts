import { NextResponse } from 'next/server';
import type { CryptoOverview } from '@/types/crypto';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fallback 데이터
    const fallback: CryptoOverview = {
      btcKrw: { price: 100000000, exchange: 'Upbit' },
      btcUsd: { price: 70000, exchange: 'CoinGecko' },
      fxUsdKrw: 1300,
      kimchiPremium: 0,
    };

    let btcKrwPrice = fallback.btcKrw.price;
    let btcUsdPrice = fallback.btcUsd.price;
    let fxUsdKrw = fallback.fxUsdKrw;

    // 1. 업비트 BTC-KRW 호출
    try {
      const upbitResponse = await fetch('https://api.upbit.com/v1/ticker?markets=KRW-BTC');
      if (upbitResponse.ok) {
        const upbitData = await upbitResponse.json();
        if (upbitData && upbitData[0] && upbitData[0].trade_price) {
          btcKrwPrice = upbitData[0].trade_price;
        }
      }
    } catch (error) {
      console.error('Upbit API error:', error);
    }

    // 2. CoinGecko BTC-USD 호출
    try {
      const coingeckoResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
      );
      if (coingeckoResponse.ok) {
        const coingeckoData = await coingeckoResponse.json();
        if (coingeckoData && coingeckoData.bitcoin && coingeckoData.bitcoin.usd) {
          btcUsdPrice = coingeckoData.bitcoin.usd;
        }
      }
    } catch (error) {
      console.error('CoinGecko API error:', error);
    }

    // 3. 환율 USD/KRW 호출
    try {
      const exchangeResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
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
        exchange: 'CoinGecko',
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
      btcUsd: { price: 70000, exchange: 'CoinGecko' },
      fxUsdKrw: 1300,
      kimchiPremium: 0,
    };
    
    return NextResponse.json(fallback);
  }
}
