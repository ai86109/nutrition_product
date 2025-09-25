export default function ConditionalContent({ 
  condition,
  fallback,
  children
}: { 
  condition: boolean,
  fallback: string | React.ReactNode,
  children: React.ReactNode 
}) {
  if (condition) return <>{children}</>
  return <span>{fallback}</span>
}