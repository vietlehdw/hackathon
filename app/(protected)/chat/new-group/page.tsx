"use client"

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { searchUsersByName } from '@/lib/users'
import { useAuth } from '@/hooks/use-auth'
import { createGroupRoom } from '@/lib/chat'

export default function NewGroupPage() {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Array<{ uid: string; displayName: string }>>([])
  const [selected, setSelected] = useState<Record<string, { uid: string; displayName: string }>>({})
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!query.trim()) { setResults([]); return }
      const r = await searchUsersByName(query.trim(), 8)
      setResults(r.filter((u) => u.uid !== user?.uid).map((u) => ({ uid: u.uid, displayName: u.displayName })))
    }, 300)
    return () => clearTimeout(t)
  }, [query, user?.uid])

  function toggle(uid: string, displayName: string) {
    setSelected((prev) => {
      const next = { ...prev }
      if (next[uid]) delete next[uid]
      else next[uid] = { uid, displayName }
      return next
    })
  }

  async function onCreate() {
    if (!user) return
    if (!name.trim()) return
    const memberUids = Object.keys(selected)
    if (memberUids.length === 0) return
    try {
      setCreating(true)
      const room = await createGroupRoom(user.uid, name.trim(), memberUids)
      window.location.href = `/chat/${room.id}`
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h1 className="text-lg font-semibold">New Group</h1>
      <div className="space-y-2">
        <label className="text-sm">Group name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Hackathon Team" />
      </div>
      <div className="space-y-2">
        <label className="text-sm">Add members</label>
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users by name" />
        <div className="space-y-1">
          {results.map((u) => (
            <button key={u.uid} onClick={() => toggle(u.uid, u.displayName)} className="w-full text-left px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900">
              <input type="checkbox" className="mr-2" readOnly checked={Boolean(selected[u.uid])} />
              {u.displayName}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Button onClick={() => void onCreate()} disabled={creating || !name.trim() || Object.keys(selected).length === 0}>Create Group</Button>
      </div>
    </div>
  )
}
