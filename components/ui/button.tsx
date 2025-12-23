import React from 'react'
import { ActivityIndicator, Pressable, Text } from 'react-native'

type ButtonProps = React.ComponentProps<typeof Pressable> & {
  title: string
  loading?: boolean
  variant?: 'primary' | 'secondary'
  className?: string
}

const RNPressable: any = Pressable
const RNText: any = Text

export const Button = React.forwardRef(function Button(
  { title, loading = false, variant = 'primary', className = '', ...props }: ButtonProps,
  ref: React.ForwardedRef<React.ComponentRef<typeof Pressable>>,
) {
  const base = 'rounded-md px-4 py-3 items-center justify-center'
  const variantClasses =
    variant === 'primary' ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-100 dark:bg-gray-800'
  const textClasses = variant === 'primary' ? 'text-white font-semibold' : 'text-gray-800 dark:text-gray-100'

  return (
    <RNPressable
      ref={ref}
      className={`${base} ${variantClasses} ${className}`}
      accessibilityRole="button"
      disabled={loading || (props as any).disabled}
      {...(props as any)}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#111'} />
      ) : (
        <RNText className={textClasses}>{title}</RNText>
      )}
    </RNPressable>
  )
})

Button.displayName = 'Button'
