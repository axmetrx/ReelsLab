import { NextResponse } from 'next/server';

const UPSTASH_URL = 'https://climbing-trout-36070.upstash.io';
const UPSTASH_TOKEN = 'AYz2ACQgZDc0Yzc5MDctZDMzMi00MThkLWFmYTktMWFiMjI4MWRiNTVhMTJiNmI2MWFlNmI2NGQzOGJkOTQ5MGI2YTkzMjFhNDQ=';

// In-Memory Server Fallback (Guarantees HTTP 200 Response)
let serverMemoryStore = {
  courses: [],
  users: [],
};

export async function GET() {
  try {
    const res = await fetch(UPSTASH_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(['GET', 'reelslab_db_store']),
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      if (data.result) {
        const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
        if (parsed && (Array.isArray(parsed.courses) || Array.isArray(parsed.users))) {
          serverMemoryStore = {
            courses: parsed.courses || [],
            users: parsed.users || [],
          };
        }
      }
    }
  } catch (err) {
    console.error('Database GET error:', err);
  }

  return NextResponse.json(serverMemoryStore, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const courses = Array.isArray(body?.courses) ? body.courses : serverMemoryStore.courses;
    const users = Array.isArray(body?.users) ? body.users : serverMemoryStore.users;

    serverMemoryStore = { courses, users };

    // Redis Command ["SET", "key", "value"] - standard Upstash format
    fetch(UPSTASH_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(['SET', 'reelslab_db_store', JSON.stringify(serverMemoryStore)]),
    }).catch((err) => console.error('Cloud DB Save error:', err));

    return NextResponse.json({ success: true, store: serverMemoryStore }, { status: 200 });
  } catch (err) {
    console.error('Database POST error:', err);
    // Always return HTTP 200 with current in-memory store instead of 500 error!
    return NextResponse.json({ success: false, store: serverMemoryStore }, { status: 200 });
  }
}
