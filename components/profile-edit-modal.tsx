"use client"

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { db, serverTimestamp } from '@/lib/firebase/firestore'
import { doc, getDoc, runTransaction, setDoc, deleteDoc } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { uploadUserAvatar } from '@/lib/upload'

const usernameRegex = /^[a-z0-9_\-]{3,20}$/

type Props = {
  open: boolean
  onClose: () => void
}

export default function ProfileEditModal({ open, onClose }: Props) {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [photoURL, setPhotoURL] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availability, setAvailability] = useState<'idle' | 'checking' | 'available' | 'unavailable' | 'invalid'>('idle')

  // Load current profile
  useEffect(() => {
    let active = true
    ;(async () => {
      if (!open || !user) return
      try {
        const s = await getDoc(doc(db, 'users', user.uid))
        if (!active) return
        if (s.exists()) {
          const d = s.data() as any
          setDisplayName(d.displayName ?? user.displayName ?? '')
          setUsername(d.username ?? '')
          setPhotoURL(d.photoURL ?? user.photoURL ?? null)
        } else {
          setDisplayName(user.displayName ?? '')
          setUsername('')
          setPhotoURL(user.photoURL ?? null)
        }
        setAvatarFile(null)
        setError(null)
      } catch {
        if (active) setError('Failed to load profile')
      }
    })()
    return () => { active = false }
  }, [open, user?.uid])

  // Username availability check
  useEffect(() => {
    if (!open) return
    if (!username) { setAvailability('idle'); return }
    if (!usernameRegex.test(username)) { setAvailability('invalid'); return }
    let canceled = false
    setAvailability('checking')
    const t = setTimeout(async () => {
      try {
        const ref = doc(db, 'usernames', username)
        const snap = await getDoc(ref)
        if (!canceled) setAvailability(snap.exists() ? 'unavailable' : 'available')
      } catch {
        if (!canceled) setAvailability('idle')
      }
    }, 300)
    return () => { canceled = true; clearTimeout(t) }
  }, [open, username])

  const previewURL = useMemo(() => {
    if (avatarFile) return URL.createObjectURL(avatarFile)
    return photoURL
  }, [avatarFile, photoURL])

  useEffect(() => {
    return () => {
      if (avatarFile) URL.revokeObjectURL(previewURL || '')
    }
  }, [avatarFile, previewURL])

  async function onSave() {
    if (!user) return
    setError(null)
    // Basic validation
    const name = displayName.trim()
    if (!name) { setError('Display name is required'); return }
    if (!usernameRegex.test(username)) { setError('Invalid username format'); return }
    if (availability === 'unavailable' || availability === 'checking') { setError('Username not available'); return }

    setLoading(true)
    try {
      // Upload avatar if provided
      let newPhotoURL: string | null = photoURL
      try {
        if (avatarFile) {
          newPhotoURL = await uploadUserAvatar(user.uid, avatarFile)
        }
      } catch {
        // keep going without blocking save
      }

      // Atomically update username mapping and user doc
      await runTransaction(db, async (tx) => {
        const userRef = doc(db, 'users', user.uid)
        const userSnap = await tx.get(userRef)
        const current = userSnap.exists() ? (userSnap.data() as any) : null
        const oldUsername: string | undefined = current?.username
        if (username !== oldUsername) {
          const newRef = doc(db, 'usernames', username)
          const newSnap = await tx.get(newRef)
          if (newSnap.exists() && (newSnap.data() as any)?.uid !== user.uid) {
            throw new Error('USERNAME_TAKEN')
          }
          tx.set(newRef, { uid: user.uid })
          if (oldUsername && oldUsername !== username) {
            tx.delete(doc(db, 'usernames', oldUsername))
          }
        }
        tx.set(userRef, {
          uid: user.uid,
          email: user.email ?? null,
          displayName: name,
          username,
          photoURL: newPhotoURL ?? null,
          updatedAt: serverTimestamp(),
          profileComplete: true,
        }, { merge: true })
      })

      // Update Firebase Auth profile for immediate UX
      try {
        await updateProfile(user, { displayName: name, photoURL: avatarFile ? undefined : (photoURL ?? undefined) })
      } catch {
        // ignore
      }

      onClose()
    } catch (err: any) {
      if (err?.message === 'USERNAME_TAKEN') setError('Username already taken. Please choose another.')
      else setError('Failed to save changes')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div role="dialog" aria-modal="true" className="relative bg-white dark:bg-neutral-950 rounded-lg shadow-lg w-full max-w-md mx-4 p-4">
        <div className="text-lg font-semibold mb-3">Edit profile</div>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="displayName">Display name</Label>
            <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="yourname" />
            <div className="text-xs h-4">
              {availability === 'checking' && <span className="text-neutral-500">Checking…</span>}
              {availability === 'available' && <span className="text-green-600">Available</span>}
              {availability === 'unavailable' && <span className="text-red-600">Unavailable</span>}
              {availability === 'invalid' && <span className="text-red-600">Invalid format</span>}
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="avatar">Avatar</Label>
            <input id="avatar" type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)} />
            {previewURL && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewURL} alt="Preview" className="mt-2 w-16 h-16 rounded-full object-cover" />
            )}
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button onClick={() => void onSave()} disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
