import * as React from "react"

type HiddenInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  name: string
  value: string | number | readonly string[] | undefined
}

/**
 * Hidden input wrapper. Renders `<input type="hidden">`.
 * Use instead of raw `<input type="hidden">` or `<Input type="hidden">`.
 */
function HiddenInput({ value, ...props }: HiddenInputProps) {
  return <input type="hidden" value={value} {...props} />
}

export { HiddenInput }
export type { HiddenInputProps }
