export interface Stock {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
}

export interface MarketIndex {
  name: string;
  symbol: string;
  value: number;
  changePercent: number;
}

export interface UsMarketOverview {
  index: MarketIndex;
  topGainers: Stock[];
  topLosers: Stock[];
}

export interface KrMarketOverview {
  index: MarketIndex;
  topGainers: Stock[];
  topLosers: Stock[];
}
