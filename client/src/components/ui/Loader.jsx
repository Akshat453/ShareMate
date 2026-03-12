import './Loader.css';

export default function Loader({ size = 48 }) {
  return (
    <div className="loader" role="status" aria-label="Loading">
      <svg className="loader__svg" width={size} height={size} viewBox="0 0 100 100">
        <polygon
          className="loader__hex loader__hex--outer"
          points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
          fill="none"
          strokeWidth="3"
        />
        <polygon
          className="loader__hex loader__hex--inner"
          points="50,20 75,35 75,65 50,80 25,65 25,35"
          fill="none"
          strokeWidth="3"
        />
      </svg>
    </div>
  );
}
