import { db, serverTimestamp } from '@/lib/firebase/firestore'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  startAfter,
  updateDoc,
  where,
  type DocumentData,
  type DocumentReference,
  type QueryConstraint,
  type Unsubscribe,
} from 'firebase/firestore'
import type { AnyRoom, DMRoom, GroupRoom, Message, RoomMember } from '@/lib/types/chat'

// Deterministic DM room id for a pair of UIDs
function dmRoomIdFor(u1: string, u2: string): string {
  const [a, b] = [u1, u2].sort()
  return `dm_${a}_${b}`
}

export async function createOrOpenDMRoom(currentUid: string, peerUid: string): Promise<DMRoom> {
  if (currentUid === peerUid) {
    throw new Error('Cannot start a DM with yourself')
  }
  const roomId = dmRoomIdFor(currentUid, peerUid)
  const roomRef = doc(db, 'rooms', roomId)
  const snap = await getDoc(roomRef)
  if (!snap.exists()) {
    await setDoc(roomRef, {
      id: roomId,
      type: 'dm',
      createdBy: currentUid,
      createdAt: serverTimestamp(),
      lastMessageAt: serverTimestamp(),
    })
    const members: Array<Pick<RoomMember, 'id' | 'roomId' | 'uid' | 'role' | 'joinedAt'>> = [currentUid, peerUid].map((uid) => ({
      id: `${roomId}_${uid}`,
      roomId,
      uid,
      role: 'member',
      joinedAt: serverTimestamp(),
    }))
    for (const m of members) {
      await setDoc(doc(db, 'roomMembers', m.id), m)
    }
  }
  const data = (await getDoc(roomRef)).data()!
  return data as unknown as DMRoom
}

export async function createGroupRoom(currentUid: string, name: string, memberUids: string[]): Promise<GroupRoom> {
  // Ensure creator is included and unique
  const uniqueMembers = Array.from(new Set([currentUid, ...memberUids]))
  const roomRef = await addDoc(collection(db, 'rooms'), {
    type: 'group',
    name,
    createdBy: currentUid,
    createdAt: serverTimestamp(),
    lastMessageAt: serverTimestamp(),
    memberCount: uniqueMembers.length,
  })
  const roomId = roomRef.id
  const batchMembers = uniqueMembers.map((uid, idx) => ({
    id: `${roomId}_${uid}`,
    roomId,
    uid,
    role: uid === currentUid ? 'owner' : 'member',
    joinedAt: serverTimestamp(),
  }))
  for (const m of batchMembers) {
    await setDoc(doc(db, 'roomMembers', m.id), m)
  }
  const data = (await getDoc(roomRef)).data()!
  return { ...(data as any), id: roomId } as GroupRoom
}

export async function inviteMembers(roomId: string, inviterUid: string, memberUids: string[]): Promise<void> {
  const unique = Array.from(new Set(memberUids)).filter((uid) => uid !== inviterUid)
  for (const uid of unique) {
    const memberId = `${roomId}_${uid}`
    const ref = doc(db, 'roomMembers', memberId)
    const s = await getDoc(ref)
    if (!s.exists()) {
      await setDoc(ref, {
        id: memberId,
        roomId,
        uid,
        role: 'member',
        joinedAt: serverTimestamp(),
      })
    }
  }
  // Update `memberCount` accurately by recounting
  const membersSnap = await getDocs(query(collection(db, 'roomMembers'), where('roomId', '==', roomId)))
  await updateDoc(doc(db, 'rooms', roomId), { memberCount: membersSnap.size })
}

export async function leaveRoom(roomId: string, uid: string): Promise<void> {
  const ref = doc(db, 'roomMembers', `${roomId}_${uid}`)
  const s = await getDoc(ref)
  if (s.exists()) {
    // naive delete via set to placeholder removedAt? For simplicity, delete
    // Firestore modular delete
    const { deleteDoc } = await import('firebase/firestore')
    await deleteDoc(ref)
    const membersSnap = await getDocs(query(collection(db, 'roomMembers'), where('roomId', '==', roomId)))
    await updateDoc(doc(db, 'rooms', roomId), { memberCount: membersSnap.size })
  }
}

export async function sendTextMessage(roomId: string, senderId: string, text: string): Promise<void> {
  text = text.trim()
  if (!text) return
  const ref = await addDoc(collection(db, 'messages'), {
    roomId,
    senderId,
    type: 'text',
    text,
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'rooms', roomId), {
    lastMessageAt: serverTimestamp(),
    lastMessageText: text.slice(0, 500),
    lastMessageType: 'text',
    lastMessageSenderId: senderId,
  })
}

export async function sendImageMessage(roomId: string, senderId: string, imageURL: string, imageThumbURL?: string): Promise<void> {
  await addDoc(collection(db, 'messages'), {
    roomId,
    senderId,
    type: 'image',
    imageURL,
    imageThumbURL: imageThumbURL ?? null,
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'rooms', roomId), {
    lastMessageAt: serverTimestamp(),
    lastMessageText: '[Image]',
    lastMessageType: 'image',
    lastMessageSenderId: senderId,
  })
}

export type MessagesSubscribeOptions = {
  roomId: string
  pageSize?: number
  onUpdate: (messages: Message[], opts: { reachedEnd: boolean; cursor: DocumentData | null }) => void
}

export function subscribeToLatestMessages({ roomId, pageSize = 30, onUpdate }: MessagesSubscribeOptions): Unsubscribe {
  const q = query(
    collection(db, 'messages'),
    where('roomId', '==', roomId),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
  )
  return onSnapshot(
    q,
    (snap) => {
      const msgs: Message[] = []
      snap.forEach((doc) => {
        const d = doc.data() as DocumentData
        msgs.push({ ...(d as any), id: doc.id } as Message)
      })
      onUpdate(msgs, { reachedEnd: snap.size < pageSize, cursor: snap.docs[snap.docs.length - 1] ?? null })
    },
    (err) => {
      // Handle missing/busy index gracefully to avoid crashing the UI
      // FirebaseError code 'failed-precondition' is thrown while the index is building
      if ((err as any)?.code === 'failed-precondition') {
        console.warn('Messages index is building; messages will appear once ready.')
        onUpdate([], { reachedEnd: true, cursor: null })
        return
      }
      console.error('subscribeToLatestMessages error', err)
    },
  )
}

export async function fetchOlderMessages(roomId: string, cursor: DocumentData | null, pageSize = 30): Promise<{ messages: Message[]; newCursor: DocumentData | null; reachedEnd: boolean }> {
  if (!cursor) return { messages: [], newCursor: null, reachedEnd: true }
  const q = query(
    collection(db, 'messages'),
    where('roomId', '==', roomId),
    orderBy('createdAt', 'desc'),
    startAfter(cursor),
    limit(pageSize),
  )
  try {
    const snap = await getDocs(q)
    const msgs: Message[] = snap.docs.map((d) => ({ ...(d.data() as any), id: d.id } as Message))
    return { messages: msgs, newCursor: snap.docs[snap.docs.length - 1] ?? null, reachedEnd: snap.size < pageSize }
  } catch (err: any) {
    if (err?.code === 'failed-precondition') {
      console.warn('Messages index is building; cannot load older messages yet.')
      return { messages: [], newCursor: null, reachedEnd: true }
    }
    throw err
  }
}

export async function getRoomMembers(roomId: string): Promise<RoomMember[]> {
  const snap = await getDocs(query(collection(db, 'roomMembers'), where('roomId', '==', roomId)))
  return snap.docs.map((d) => ({ ...(d.data() as any), id: d.id } as RoomMember))
}

export async function markRoomRead(roomId: string, uid: string): Promise<void> {
  const memberId = `${roomId}_${uid}`
  await updateDoc(doc(db, 'roomMembers', memberId), { lastReadAt: serverTimestamp() })
}

export async function getPeerUidForDM(roomId: string, currentUid: string): Promise<string | null> {
  // dm_<a>_<b>
  if (!roomId.startsWith('dm_')) return null
  const ids = roomId.replace('dm_', '').split('_')
  const [a, b] = ids
  return a === currentUid ? b : a
}
