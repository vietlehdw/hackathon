import { getDatabase } from 'firebase/database'
import { getFirebaseApp } from './app'

export const rtdb = getDatabase(getFirebaseApp())
