const REQUIREMENTS = [
  { test: (v) => v.length >= 8, label: 'At least 8 characters' },
  { test: (v) => /[A-Z]/.test(v), label: 'An uppercase letter' },
  { test: (v) => /[0-9]/.test(v), label: 'A number' },
]

// Live checklist under a password field — shown only once the user starts
// typing, so an empty field doesn't open with a wall of red.
export function PasswordRequirements({ value }) {
  if (!value) return null

  return (
    <ul className="mt-1.5 space-y-0.5 text-xs">
      {REQUIREMENTS.map(({ test, label }) => {
        const met = test(value)
        return (
          <li key={label} className={met ? 'text-emerald-600' : 'text-slate-400'}>
            {met ? '✓' : '·'} {label}
          </li>
        )
      })}
    </ul>
  )
}
