export default function Field({ label, name, error, hint, ...inputProps }) {
  const id = `field-${name}`;
  return (
    <div className={`field${error ? " field-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <input id={id} name={name} {...inputProps} />
      {hint && !error && <span className="hint">{hint}</span>}
      {error && <span className="error" role="alert">{error}</span>}
    </div>
  );
}
