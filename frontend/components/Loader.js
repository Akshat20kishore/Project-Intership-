export default function Loader({ message = "Gathering botanical botanicals...", page = false }) {
  const content = (
    <div className="loader" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
  return page ? <div className="loader-page">{content}</div> : content;
}
