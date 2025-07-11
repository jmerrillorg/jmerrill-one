// src/app/api/og/route.ts
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import type { JSX } from 'react';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const element: JSX.Element = (
    <div
      style={{
        fontSize: 48,
        background: '#fff',
        color: '#111',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      J Merrill One
    </div>
  );

  return new ImageResponse(element, {
    width: 1200,
    height: 630,
  });
}