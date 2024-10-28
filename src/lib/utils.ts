import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function delay(ms = 1000) {
  return function (x: any) {
    return new Promise((resolve) => setTimeout(() => resolve(x), ms))
  }
}

export const formatCurrency = (value: number, useShortForm: boolean = true) => {
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'USD',
  }

  if (useShortForm) {
    if (Math.abs(value) >= 1000000) {
      options.minimumFractionDigits = 0
      options.maximumFractionDigits = 1
      return (value / 1000000).toLocaleString('en-US', options) + 'M'
    } else if (Math.abs(value) >= 1000) {
      options.minimumFractionDigits = 0
      options.maximumFractionDigits = 1
      return (value / 1000).toLocaleString('en-US', options) + 'K'
    } else if (Math.abs(value) >= 1) {
      options.minimumFractionDigits = 2
      options.maximumFractionDigits = 2
    } else {
      options.minimumFractionDigits = 2
      options.maximumFractionDigits = 6
    }
  } else {
    if (Math.abs(value) >= 10000) {
      options.minimumFractionDigits = 0
      options.maximumFractionDigits = 0
    } else if (Math.abs(value) >= 1) {
      options.minimumFractionDigits = 2
      options.maximumFractionDigits = 2
    } else if (Math.abs(value) >= 0.0001) {
      options.minimumFractionDigits = 6
      options.maximumFractionDigits = 6
    } else {
      options.minimumFractionDigits = 9
      options.maximumFractionDigits = 9
    }
  }

  return value.toLocaleString('en-US', options)
}
