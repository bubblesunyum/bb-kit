import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { useFilteredItems } from "@/hooks/use-filtered-items"
import { collectTagsWithSelection } from "@/lib/filtering"
import { awkwardItems, TAG_SETS } from "@/test/awkward-content"

import { FilterBar } from "./filter-bar"
import { List } from "./list"
import { VStack } from "./stack"
import { H4, Text } from "./text"

/**
 * A search field and a row of tag toggles. It holds neither the query nor the
 * selection — every story below keeps both, which is what a real page does too.
 *
 * No story pins a palette or a mode; the toolbar supplies both.
 */
const meta = {
  component: FilterBar,
  /* Every prop is required on the component, so without defaults here each
     story would have to declare args it does not use — they all render their
     own stateful `Bar` instead. */
  args: {
    tags: TAG_SETS.few,
    selected: [],
    onSelectedChange: () => {},
    query: "",
    onQueryChange: () => {},
  },
} satisfies Meta<typeof FilterBar>

export default meta

type Story = StoryObj<typeof meta>

/** The default: an empty field and three tags, none of them on. */
export const Defaults: Story = {
  render: () => <Bar tags={TAG_SETS.few} className="w-120" />,
}

/** Selected tags fill with the primary colour, and read as pressed. */
export const Selected: Story = {
  render: () => <Bar tags={TAG_SETS.few} initialTags={["react"]} initialQuery="design" className="w-120" />,
}

/**
 * Twenty-four tags. The row wraps rather than scrolling sideways — a tag
 * pushed off the end of a scroller is a filter nobody learns exists.
 */
export const ManyTags: Story = {
  render: () => <Bar tags={TAG_SETS.many} initialTags={["css"]} className="w-120" />,
}

/** One tag, and none at all. With no tags the search field stands alone. */
export const FewTags: Story = {
  render: () => (
    <VStack gap={6} className="w-120">
      <Bar tags={TAG_SETS.one} />
      <Bar tags={TAG_SETS.none} />
    </VStack>
  ),
}

/**
 * The states of the tag toggles, forced. `focus-visible`, never `focus`:
 * asking for `focus` shows nothing, and the natural wrong fix puts a ring on
 * every mouse click.
 */
export const States: Story = {
  render: () => (
    <VStack gap={5} className="w-120">
      {STATES.map(({ label, className }) => (
        <VStack key={label} gap={2}>
          <H4 size="sm">{label}</H4>
          <div className={className}>
            <Bar tags={TAG_SETS.few} initialTags={["react"]} initialQuery="design" />
          </div>
        </VStack>
      ))}
      <VStack gap={2}>
        <H4 size="sm">disabled — a tag that would leave nothing</H4>
        <Bar tags={[{ tag: "typescript" }, { tag: "react", disabled: true }, { tag: "css", disabled: true }]} />
      </VStack>
    </VStack>
  ),
  parameters: {
    pseudo: {
      hover: [".state-hover [data-slot=filter-bar-tag]"],
      focusVisible: [".state-focus [data-slot=filter-bar-tag]"],
    },
  },
}

/**
 * The whole point, wired up: the bar drives `useFilteredItems`, and the tags
 * come from `collectTagsWithSelection`, so a tag that would empty the list
 * greys out before it is pressed. Only the filtering waits for the typing to
 * stop — the field itself never does.
 */
export const FilteringARealList: Story = {
  render: () => <Filtering />,
}

/** Awkward content: a 24-tag row over titles that are empty, long or unbreakable. */
export const AwkwardContent: Story = {
  render: () => (
    <VStack gap={6} className="w-80">
      <Bar tags={TAG_SETS.many} initialQuery={AWKWARD_QUERY} />
    </VStack>
  ),
}

/** Every part bends from outside — Rule 6, and each part has a data-slot. */
export const Overridden: Story = {
  render: () => (
    <VStack gap={6} className="w-120">
      <Bar tags={TAG_SETS.few} className="[&_[data-slot=filter-bar-tags]]:justify-end" />
      <Bar tags={TAG_SETS.few} className="[&_input]:rounded-none" />
    </VStack>
  ),
}

/** The bar, the hook and the functions, exactly as a page would wire them. */
function Filtering() {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string[]>([])

  // The tags are counted from the criteria the items were filtered by, so the
  // row never runs a keystroke ahead of the list under it.
  const { items, criteria } = useFilteredItems(ITEMS, { text: query, tags: selected }, ACCESSORS)
  const tags = collectTagsWithSelection(ITEMS, criteria, ACCESSORS)

  return (
    <VStack gap={6} className="w-120">
      <FilterBar
        tags={tags}
        selected={selected}
        onSelectedChange={setSelected}
        query={query}
        onQueryChange={setQuery}
      />
      <List
        items={items}
        getKey={(item) => item.id}
        empty={<Text tone="quiet">Nothing matches that.</Text>}
        renderItem={(item) => (
          <VStack gap={1}>
            <Text weight="medium">{item.title || "Untitled"}</Text>
            <Text size="sm" tone="quiet">
              {item.tags.join(" · ") || "no tags"}
            </Text>
          </VStack>
        )}
      />
    </VStack>
  )
}

/** The caller owns the query and the selection; the bar only asks for new ones. */
function Bar({ initialTags = [], initialQuery = "", ...props }: BarProps) {
  const [selected, setSelected] = useState<string[]>(initialTags)
  const [query, setQuery] = useState(initialQuery)

  return (
    <FilterBar
      selected={selected}
      onSelectedChange={setSelected}
      query={query}
      onQueryChange={setQuery}
      {...props}
    />
  )
}

type BarProps = Omit<
  Parameters<typeof FilterBar>[0],
  "selected" | "onSelectedChange" | "query" | "onQueryChange"
> & {
  initialTags?: string[]
  initialQuery?: string
}

const ITEMS = awkwardItems()

// Hoisted, as the hook asks: written inline they would be new functions every
// render and the memo would have nothing to hold on to.
const ACCESSORS = {
  getTags: (item: (typeof ITEMS)[number]) => item.tags,
  getText: (item: (typeof ITEMS)[number]) => item.title,
}

const AWKWARD_QUERY = "a query long enough to run past the end of a narrow field"

// The addon matches by selector, so each row carries the class its rule names.
const STATES: readonly { label: string; className: string }[] = [
  { label: "rest", className: "state-rest" },
  { label: "hover", className: "state-hover" },
  { label: "focus-visible", className: "state-focus" },
]
