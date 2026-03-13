export interface Ticker {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface IndexSummary {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface CryptoData {
  btcKrw: { price: number; exchange: string };
  btcUsd: { price: number; exchange: string };
  fxUsdKrw: number;
  kimchiPremium: number;
}

export interface MarketData {
  index: IndexSummary;
  topGainers: Ticker[];
  topLosers: Ticker[];
}
