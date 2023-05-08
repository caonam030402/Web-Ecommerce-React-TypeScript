import { forwardRef, InputHTMLAttributes, useState } from 'react'

export interface InputNumberProps extends InputHTMLAttributes<HTMLInputElement> {
  errorMessage?: string
  classNameInput?: string
  classNameError?: string
}

const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(function InputNumberInner(
  {
    classNameInput = 'w-full rounded-sm border-[0.5px] border-gray-300 py-2 px-3 outline-none focus:border-gray-700',
    className,
    onChange,
    errorMessage,
    value = '',
    classNameError = 'mt-1 min-h-[1rem] text-xs text-red-600',
    ...rest
  },
  ref
) {
  const [localValue, setLocalValue] = useState<string>(value as string)
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    const regaxNumber = /^[0-9]+$/
    if (regaxNumber.test(value) || value === '') {
      onChange && onChange(event)
      setLocalValue(value)
    }
  }

  return (
    <div className={className}>
      <input className={classNameInput} {...rest} value={value || localValue} onChange={handleChange} ref={ref} />
      <div className={classNameError}>{errorMessage}</div>
    </div>
  )
})

export default InputNumber
