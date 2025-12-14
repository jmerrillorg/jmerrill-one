// src/app/api/og/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  return NextResponse.redirect('https://jmerrill.one/og-image.jpg', 302);
}