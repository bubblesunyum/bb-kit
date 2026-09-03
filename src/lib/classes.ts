/**
 * Looks a prop value up in a table of classes, and says so in development when
 * the value is not in it. Without the warning a wrong guess — `variant="soft"`
 * — lands as an ignored attribute and looks like it worked.
 *
 * `what` names the component and prop: "Surface's variant".
 *
 * The value is allowed to be a number because Stack's gaps are keyed by one.
 *
 * Warning rather than throwing, because a wrong variant is a cosmetic mistake
 * and taking the page down over one is worse than the mistake.
 */
export function classFor<T extends Record<string, string>>(
  table: T,
  value: string | number,
  what: string,
): string {
  if (value in table) return table[value as keyof T]

  // Compared to the string rather than checked for "development", so a test
  // run — where NODE_ENV is "test" — warns too, and a production build drops
  // the whole branch.
  if (process.env.NODE_ENV !== "production") {
    warnOnce(
      `bb-kit: unknown ${what} "${value}". Expected ${Object.keys(table).join(", ")}.`,
    )
  }

  return ""
}

/** A component re-renders; the reader only needs telling once. */
function warnOnce(message: string) {
  if (WARNED.has(message)) return
  WARNED.add(message)
  console.warn(message)
}

const WARNED = new Set<string>()
