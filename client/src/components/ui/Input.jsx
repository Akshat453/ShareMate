import { forwardRef } from 'react';
import './Input.css';

const Input = forwardRef(({ label, error, icon, type = 'text', className = '', ...props }, ref) => {
  return (
    <div className={`input-group ${error ? 'input-group--error' : ''} ${className}`}>
      {icon && <span className="input-group__icon">{icon}</span>}
      <input
        ref={ref}
        type={type}
        className={`input-group__field ${icon ? 'input-group__field--icon' : ''}`}
        placeholder=" "
        {...props}
      />
      {label && <label className="input-group__label">{label}</label>}
      <span className="input-group__underline" />
      {error && <span className="input-group__error">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
