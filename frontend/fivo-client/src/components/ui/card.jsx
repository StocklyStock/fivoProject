export function Card({ children, className = '' }) {
  return <div className={` ${className}`}>{children}</div>;
}

export function CardContent({ children }) {
  return <div>{children}</div>;
}