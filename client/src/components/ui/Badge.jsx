import './Badge.css';

export default function Badge({ children, variant = 'default', size = 'sm', icon }) {
  return (
    <span className={`badge badge--${variant} badge--${size}`}>
      {icon && <span className="badge__icon">{icon}</span>}
      {children}
    </span>
  );
}
