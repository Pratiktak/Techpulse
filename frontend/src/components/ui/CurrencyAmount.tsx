export function CurrencyAmount({ amount }: { amount: number }) {
  return (
    <span>
      {new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(amount)}
    </span>
  );
}