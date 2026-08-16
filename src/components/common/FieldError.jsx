export default function FieldError({ id, children }) {
  if (!children) return null
  return (
    <p id={id} role="alert" className="field-error">
      {children}
    </p>
  )
}