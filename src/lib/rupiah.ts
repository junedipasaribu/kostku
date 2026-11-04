export function formatRupiahInput(value: string | number): string {
  const digits = String(value).replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function parseRupiahInput(value: string): number {
  return Number(value.replace(/\D/g, "")) || 0;
}
