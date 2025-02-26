export function amountToString(amount) {
  var real = amount.whole + amount.decimal / 100;
  return (real).toLocaleString(undefined, {minimumFractionDigits: 2});
}

export function numberToAmount(number) {
  var whole = Math.floor(number)
  var decimal = Number((number + "").split(".")[1]);
  if (isNaN(decimal)) decimal = 0;
  return {whole, decimal};
}
