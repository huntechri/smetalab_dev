import * as React from "react"

type FileInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  accept?: string
}

/**
 * File input wrapper. Renders `<input type="file">` with ref forwarding.
 * Use instead of raw `<input type="file">`.
 */
const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ accept, onChange, className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="file"
        accept={accept}
        onChange={onChange}
        className={className}
        {...props}
      />
    )
  }
)
FileInput.displayName = "FileInput"

export { FileInput }
export type { FileInputProps }
