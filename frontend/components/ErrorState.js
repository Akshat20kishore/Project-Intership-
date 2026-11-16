export default function ErrorState({
  title = "Something went wrong",
  message = "We could not complete your request. Please try again.",
  onRetry,
}) {
  return (
    <div className="state">
      <h2>{title}</h2>
      <p>{message}</p>
      {onRetry && (
        <button className="btn" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
