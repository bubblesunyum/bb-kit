import { HStack, VStack } from "@/components/stack"
import { H1, Text } from "@/components/text"

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-24">
      <VStack gap={4}>
        <H1>bb-kit</H1>
        <Text tone="quiet" size="lg">
          A web UI kit. Tokens, components, and filtering logic, installed
          through a registry.
        </Text>
        <HStack gap={6}>
          <PageLink href="/kitchen-sink">Kitchen sink</PageLink>
          <PageLink href="/tokens">Tokens</PageLink>
        </HStack>
      </VStack>
    </main>
  )
}

/* A real <a> rather than LinkButton, which is a button: these go somewhere.
   Private to this page — the kit has no link primitive yet, and one page's two
   links is not enough to know what it should be. */
function PageLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      className="text-primary rounded-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
    >
      {children}
    </a>
  )
}
