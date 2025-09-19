import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { token } = await req.json().catch(() => ({}))
    if (!token) {
      return NextResponse.json({ error: 'token required' }, { status: 400 })
    }
    // Token is persisted client-side into Firestore for now.
    // This endpoint is reserved for server-side validation and admin writes if/when firebase-admin is added.
    return new NextResponse(null, { status: 204 })
  } catch (e) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }
}
