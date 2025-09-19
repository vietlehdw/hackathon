import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence, onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, type User, type Auth } from 'firebase/auth'
import { getFirebaseApp } from './app'

let auth: Auth | undefined
let googleProvider: GoogleAuthProvider | undefined

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp())
    // Persist session in local storage
    void setPersistence(auth, browserLocalPersistence)
  }
  return auth
}

export function getGoogleProvider(): GoogleAuthProvider {
  if (!googleProvider) {
    googleProvider = new GoogleAuthProvider()
    googleProvider.setCustomParameters({ prompt: 'select_account' })
  }
  return googleProvider
}

export async function signInWithGooglePopup(): Promise<User> {
  const a = getFirebaseAuth()
  const provider = getGoogleProvider()
  const cred = await signInWithPopup(a, provider)
  return cred.user
}

export async function signInWithGoogleRedirect(): Promise<void> {
  const a = getFirebaseAuth()
  const provider = getGoogleProvider()
  await signInWithRedirect(a, provider)
}

export async function getGoogleRedirectResultUser(): Promise<User | null> {
  const a = getFirebaseAuth()
  const res = await getRedirectResult(a)
  return res?.user ?? null
}

export { onAuthStateChanged }
