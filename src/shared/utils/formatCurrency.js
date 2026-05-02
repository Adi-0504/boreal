const currencyConfigs = {
  "TWD": { "symbol": "NT$", "locale": "zh-TW" },
  "USD": { "symbol": "$", "locale": "en-US" },
  "JPY": { "symbol": "¥", "locale": "ja-JP" },
  "EUR": { "symbol": "€", "locale": "de-DE" },
  "CNY": { "symbol": "¥", "locale": "zh-CN" }
};

export const formatCurrency = (amount, currencyCode) => {
  const config = currencyConfigs[currencyCode] || currencyConfigs["TWD"];
  const safeCurrencyCode = currencyConfigs[currencyCode] ? currencyCode : "TWD";
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: safeCurrencyCode,
    minimumFractionDigits: safeCurrencyCode === "JPY" || safeCurrencyCode === "TWD" ? 0 : 2
  }).format(amount);
};

export const getCurrencySymbol = (currencyCode) => {
  return currencyConfigs[currencyCode]?.symbol || "$";
};

export const getSupportedCurrencies = () => Object.keys(currencyConfigs);
