import './Button.css';

export default function Button({ 
  children, variant = 'primary', size = 'md', icon, 
  loading, disabled, fullWidth, className = '', ...props 
}) {
  return (
    <button
      className={`btn btn--${variant} btn--${size} ${fullWidth ? 'btn--full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="btn__spinner">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="60" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </span>
      )}
      {icon && !loading && <span className="btn__icon">{icon}</span>}
      <span className="btn__text">{children}</span>
    </button>
  );
}
