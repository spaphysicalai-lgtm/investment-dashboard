export interface CryptoOverview {
  btcKrw: {
    price: number;
    exchange: string;
  };
  btcUsd: {
    price: number;
    exchange: string;
  };
  fxUsdKrw: number;
  kimchiPremium: number;
}
