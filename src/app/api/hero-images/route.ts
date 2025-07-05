import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'public', 'hero');
    const files = fs.existsSync(dir)
      ? fs.readdirSync(dir).filter((file) => /\.(png|jpe?g|webp|svg)$/i.test(file))
      : [];

    const images = files.map((file) => `/hero/${file}`);
    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error reading hero images directory:', error);
    return NextResponse.json({ images: [] }, { status: 500 });
  }
}
