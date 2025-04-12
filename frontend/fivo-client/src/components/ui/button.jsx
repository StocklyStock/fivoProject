export function Button({ children, className = '', ...props }) {
  const base = "px-4 py-2 rounded";
  return <button className={`${base} ${className}`} {...props}>{children}</button>;
}