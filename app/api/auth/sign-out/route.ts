import { deleteSession, broadcastSignOut } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function GET() {
  await deleteSession();
  await broadcastSignOut();
  return NextResponse.json({ ok: true });
}

export async function POST() {
  await deleteSession();
  await broadcastSignOut();
  return NextResponse.json({ ok: true });
}
