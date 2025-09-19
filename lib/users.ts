import { db } from '@/lib/firebase/firestore'
import { collection, endAt, getDocs, limit, orderBy, query, startAt, where } from 'firebase/firestore'
import type { UserProfile } from '@/lib/types/chat'

export async function searchUsersByName(prefix: string, max = 10): Promise<UserProfile[]> {
  const q = query(
    collection(db, 'users'),
    orderBy('displayName'),
    startAt(prefix),
    endAt(prefix + '\uf8ff'),
    limit(max),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data() as UserProfile)
}
