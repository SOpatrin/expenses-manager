'use client'

import { useCallback, useEffect, useState } from 'react'

export function useLocalStorage(
  key: string,
  defaultValue: string,
): [string, (value: string) => void] {
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    const stored = localStorage.getItem(key)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored !== null) setValue(stored)
  }, [key])

  const set = useCallback(
    (newValue: string) => {
      setValue(newValue)
      localStorage.setItem(key, newValue)
    },
    [key],
  )

  return [value, set]
}
