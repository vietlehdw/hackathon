"use client"

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail as fbSendPasswordResetEmail,
  signOut,
  type User,
  onIdTokenChanged,
} from 'firebase/auth'
import { getFirebaseAuth, onAuthStateChanged, signInWithGooglePopup, signInWithGoogleRedirect, getGoogleRedirectResultUser } from '@/lib/firebase/auth'
import { db, serverTimestamp } from '@/lib/firebase/firestore'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export type AuthContextValue = {
  user: User | null
  loading: boolean
  signUpWithEmail: (email: string, password: string) => Promise<User>
  signInWithEmail: (email: string, password: string) => Promise<User>
  signInWithGoogle: () => Promise<void>
  sendPasswordResetEmail: (email: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function ensureUserDoc(u: User): Promise<void> {
  const ref = doc(db, 'users', u.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    const profileComplete = Boolean(u.displayName)
    await setDoc(ref, {
      uid: u.uid,
      email: u.email ?? null,
      displayName: u.displayName ?? '',
      username: '',
      photoURL: u.photoURL ?? null,
      bio: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      profileComplete,
      providerData: u.providerData.map((p) => ({ providerId: p.providerId, uid: p.uid })),
    }, { merge: true })
  } else {
    // touch updatedAt on login
    await setDoc(ref, { updatedAt: serverTimestamp() }, { merge: true })
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const auth = getFirebaseAuth()

    // Handle redirect result (Google) on initial load
    void (async () => {
      try {
        const redirectUser = await getGoogleRedirectResultUser()
        if (redirectUser) {
          await ensureUserDoc(redirectUser)
        }
      } catch {
        // ignore
      }
    })()

    const unsub = onAuthStateChanged(auth, async (u: User | null) => {
      setUser(u)
      if (u) {
        try {
          await ensureUserDoc(u)
        } catch {
          // ignore
        }
      }
      setLoading(false)
    })

    // Keep ID token fresh
    const unsubToken = onIdTokenChanged(auth, () => {})

    return () => {
      unsub()
      unsubToken()
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    async signUpWithEmail(email: string, password: string) {
      const auth = getFirebaseAuth()
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await ensureUserDoc(cred.user)
      return cred.user
    },
    async signInWithEmail(email: string, password: string) {
      const auth = getFirebaseAuth()
      const cred = await signInWithEmailAndPassword(auth, email, password)
      await ensureUserDoc(cred.user)
      return cred.user
    },
    async signInWithGoogle() {
      try {
        await signInWithGooglePopup()
      } catch {
        // Fallback for popup blockers/browsers
        await signInWithGoogleRedirect()
      }
    },
    async sendPasswordResetEmail(email: string) {
      const auth = getFirebaseAuth()
      await fbSendPasswordResetEmail(auth, email)
    },
    async logout() {
      const auth = getFirebaseAuth()
      await signOut(auth)
      // user will be set to null by listener
    },
  }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within <AuthProvider>')
  return ctx
}
