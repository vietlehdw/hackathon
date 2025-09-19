export type RoomType = 'dm' | 'group'

export type TimestampLike = any // Firestore Timestamp; keep loose typing for SDK interop

export type RoomBase = {
  id: string
  type: RoomType
  name?: string | null
  createdBy: string
  createdAt: TimestampLike
  lastMessageAt: TimestampLike
  // Denormalized preview fields for chat list
  lastMessageText?: string | null
  lastMessageType?: 'text' | 'image' | null
  lastMessageSenderId?: string | null
  imageURL?: string | null // group avatar optional
}

export type DMRoom = RoomBase & { type: 'dm' }

export type GroupRoom = RoomBase & {
  type: 'group'
  name: string
  memberCount: number
}

export type AnyRoom = DMRoom | GroupRoom

export type RoomMember = {
  id: string // `${roomId}_${uid}`
  roomId: string
  uid: string
  role: 'owner' | 'member'
  joinedAt: TimestampLike
}

export type Message = {
  id: string
  roomId: string
  senderId: string
  type: 'text' | 'image'
  text?: string
  imageURL?: string
  imageThumbURL?: string
  createdAt: TimestampLike
}

export type UserProfile = {
  uid: string
  email: string | null
  displayName: string
  username: string // unique, lowercase
  photoURL: string | null
  bio: string
  createdAt: TimestampLike
  updatedAt: TimestampLike
}
