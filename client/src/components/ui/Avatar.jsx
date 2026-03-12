import './Avatar.css';

export default function Avatar({ src, name = '', size = 'md', ring = false, className = '' }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div className={`avatar avatar--${size} ${ring ? 'avatar--ring' : ''} ${className}`}>
      {src ? (
        <img src={src} alt={name} className="avatar__img" />
      ) : (
        <span className="avatar__initials">{initials}</span>
      )}
    </div>
  );
}
