import { getStorage } from 'firebase/storage'
import { getFirebaseApp } from './app'

export const storage = getStorage(getFirebaseApp())
