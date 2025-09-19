import { storage } from '@/lib/firebase/storage'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'

export async function uploadRoomImage(roomId: string, file: File): Promise<string> {
  if (!file || !file.type.startsWith('image/')) throw new Error('Invalid image file')
  const ext = file.name.split('.').pop() ?? 'jpg'
  const id = crypto.randomUUID()
  const path = `rooms/${roomId}/images/${id}.${ext}`
  const r = ref(storage, path)
  const data = await file.arrayBuffer()
  await uploadBytes(r, new Uint8Array(data), { contentType: file.type })
  const url = await getDownloadURL(r)
  return url
}

export async function uploadUserAvatar(uid: string, file: File): Promise<string> {
  if (!file || !file.type.startsWith('image/')) throw new Error('Invalid image file')
  if (file.size > 5 * 1024 * 1024) throw new Error('Image too large (max 5MB)')
  const ext = file.name.split('.').pop() ?? 'jpg'
  const id = crypto.randomUUID()
  const path = `users/${uid}/avatar/${id}.${ext}`
  const r = ref(storage, path)
  const data = await file.arrayBuffer()
  await uploadBytes(r, new Uint8Array(data), { contentType: file.type })
  return await getDownloadURL(r)
}
