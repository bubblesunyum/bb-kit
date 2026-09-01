import { Theme } from "@/components/theme"
import { checkPalette, MODES, type Check, type Mode } from "@/tokens/contrast"
import { palettes, ROLES, type PaletteName } from "@/tokens/palette"

/**
 * Every colour pair, both modes, both palettes, with its measured number and a
 * pass mark. It calls the same check function the test does, so this page can
 * never show a pass the test would reject.
 *
 * This is the page to look at before any component exists — a swatch you can
 * see is the only check for the things a number cannot assert.
 */
export default function TokensPage() {
  const paletteNames = Object.keys(palettes) as PaletteName[]

  return (
    <main className="flex flex-1 flex-col gap-px">
      {paletteNames.flatMap((palette) =>
        MODES.map((mode) => <Section key={`${palette}-${mode}`} palette={palette} mode={mode} />),
      )}
    </main>
  )
}

function Section({ palette, mode }: { palette: PaletteName; mode: Mode }) {
  const checks = checkPalette(palette, mode)
  const failing = checks.filter((check) => !check.passes).length

  return (
    <Theme palette={palette} mode={mode} className="p-8">
      <h2 className="mb-1 text-2xl font-semibold tracking-tight">
        {palette} {mode}
      </h2>
      <p className="text-quiet mb-6 text-sm">
        {failing} of {checks.length} checks failing
      </p>
      <Swatches palette={palette} mode={mode} />
      <CheckTable checks={checks} />
    </Theme>
  )
}

function Swatches({ palette, mode }: { palette: PaletteName; mode: Mode }) {
  return (
    <div className="mb-8 grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-3">
      {ROLES.map((role) => (
        <div key={role} className="border-border rounded-md border">
          <div
            className="h-14 rounded-t-md"
            style={{ background: palettes[palette][role][mode] }}
          />
          <div className="px-2 py-1.5">
            <div className="text-sm">{role}</div>
            <div className="text-quiet font-mono text-xs">{palettes[palette][role][mode]}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function CheckTable({ checks }: { checks: Check[] }) {
  return (
    <table className="w-full max-w-2xl text-sm">
      <thead className="text-quiet text-left">
        <tr>
          <th className="py-1 font-normal">Pair</th>
          <th className="py-1 text-right font-normal">Measured</th>
          <th className="py-1 text-right font-normal">Minimum</th>
          <th className="py-1 pl-4 font-normal">Result</th>
        </tr>
      </thead>
      <tbody>
        {checks.map((check) => (
          <tr key={`${check.foreground}-${check.background}`} className="border-border border-t">
            <td className="py-1">
              {check.foreground} on {check.background}
            </td>
            <td className="py-1 text-right font-mono">{check.ratio.toFixed(3)}</td>
            <td className="text-quiet py-1 text-right font-mono">{check.minimum.toFixed(2)}</td>
            <td className={cellClass(check)}>{check.passes ? "pass" : "FAIL"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// A failure is loud on purpose: this page exists to be scanned, and a quiet
// mark in a table of a hundred rows is a mark nobody sees.
const cellClass = (check: Check) =>
  check.passes ? "text-quiet py-1 pl-4" : "text-danger py-1 pl-4 font-semibold"
