"use client"

import { useEffect, useState } from "react"

/**
 * The value, arriving late. It starts at whatever it was given, so a first
 * render is never delayed, and every change after that waits for the value to
 * hold still for `delay` before it comes through.
 *
 * The point is always the same: one thing on screen keeps up with the reader
 * while the expensive thing behind it waits for them to stop.
 */
export function useDelayedValue<T>(value: T, delay = 200): T {
  const [delayed, setDelayed] = useState(value)

  useEffect(() => {
    if (Object.is(value, delayed)) return

    const timer = setTimeout(() => setDelayed(value), delay)
    return () => clearTimeout(timer)
  }, [value, delayed, delay])

  return delayed
}
