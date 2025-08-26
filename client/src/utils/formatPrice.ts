// utils/numberFormat.ts
export function formatPrice(
  num: number | string | null | undefined,
  priceSymbol?: string
): string {
  const symbol = priceSymbol ? priceSymbol : "Rs ";
  if (num === null || num === undefined) return `${symbol}0.00`;

  const str = num.toString();

  // Split integer and decimal parts
  const [intPart, decimalPart] = str.split(".");

  // Handle last 3 digits
  let lastThree = intPart.slice(-3);
  let otherNumbers = intPart.slice(0, -3);

  if (otherNumbers !== "") {
    lastThree = "," + lastThree;
  }

  const formatted =
    otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;

  // Prefix Rs

  return decimalPart
    ? `${symbol} ${formatted}.${decimalPart}`
    : `${symbol} ${formatted}`;
}
