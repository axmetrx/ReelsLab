import { NextResponse } from 'next/server';

// Upstash REST Persistent Cloud Database configuration for ReelsLab
const UPSTASH_URL = 'https://climbing-trout-36070.upstash.io';
const UPSTASH_TOKEN = 'AYz2ACQgZDc0Yzc5MDctZDMzMi00MThkLWFmYTktMWFiMjI4MWRiNTVhMTJiNmI2MWFlNmI2NGQzOGJkOTQ5MGI2YTkzMjFhNDQ=';

export async function GET() {
  try {
    const res = await fetch(`${UPSTASH_URL}/get/reelslab_db_store`, {
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      if (data.result) {
        const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
        return NextResponse.json(parsed, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        });
      }
    }
  } catch (err) {
    console.error('Database GET error:', err);
  }

  return NextResponse.json({ courses: [], users: [] }, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const courses = Array.isArray(body?.courses) ? body.courses : [];
    const users = Array.isArray(body?.users) ? body.users : [];

    const dbPayload = { courses, users };

    // Save permanently to Upstash Persistent Database
    const res = await fetch(`${UPSTASH_URL}/set/reelslab_db_store`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(JSON.stringify(dbPayload)),
    });

    if (!res.ok) {
      throw new Error(`DB write status: ${res.status}`);
    }

    return NextResponse.json({ success: true, store: dbPayload });
  } catch (err) {
    console.error('Database POST error:', err);
    return NextResponse.json({ error: 'Failed to write to database' }, { status: 500 });
  }
}
