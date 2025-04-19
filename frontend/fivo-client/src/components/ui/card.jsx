export function Card({ children, className = '' }) {
  return <div className={` bg-white ${className}`}>{children}</div>;
}

export function CardContent({ children }) {
  return <div>{children}</div>;
}