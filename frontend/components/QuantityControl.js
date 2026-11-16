export default function QuantityControl({ value, max = 20, onChange, label = "Quantity" }) {
  return (
    <div className="qty" role="group" aria-label={label}>
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
      >
        −
      </button>
      <span aria-live="polite" aria-atomic="true">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        +
      </button>
    </div>
  );
}
