import { forwardRef, useState } from 'react'

// Wraps a plain password <input> with a show/hide toggle. forwardRef so it
// still works as a react-hook-form registered field (register() returns a
// ref among its props) — everything else just passes through to the input.
export const PasswordInput = forwardRef(function PasswordInput({ className = '', ...props }, ref) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        ref={ref}
        type={visible ? 'text' : 'password'}
        className={`${className} pr-14`}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-slate-500 hover:text-slate-700"
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  )
})
