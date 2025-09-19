"use client"

export function TypingBanner({ typingUids, namesByUid }: { typingUids: string[]; namesByUid: Record<string, string> }) {
  if (typingUids.length === 0) return null
  const names = typingUids.map((u) => namesByUid[u] ?? 'Someone')
  const label = names.length === 1 ? `${names[0]} is typing…` : names.length === 2 ? `${names[0]} and ${names[1]} are typing…` : `${names.slice(0, 2).join(', ')} and others are typing…`
  return (
    <div className="text-xs text-neutral-500 px-3 py-1">{label}</div>
  )
}
