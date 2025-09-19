import { getFirestore, serverTimestamp, collection, doc } from 'firebase/firestore'
import { getFirebaseApp } from './app'

const db = getFirestore(getFirebaseApp())

export { db, serverTimestamp, collection, doc }
