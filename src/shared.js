export function amountToString(amount) {
  var real = amount.whole + amount.decimal / 100;
  return (real).toLocaleString(undefined, {minimumFractionDigits: 2});
}
