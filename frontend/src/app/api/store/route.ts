import { NextResponse } from 'next/server';

const JSONBIN_URL = 'https://api.jsonbin.io/v3/b/67ab2d6de41b4d34e489ec6f';
const JSONBIN_KEY = '$2a$10$wE9.mG9SgS7q1N/2a.NnU.6bN2/x1/qU6Y5wO';

// Server-side fallback memory
let inMemoryStore = {
  courses: [],
  users: [],
};

export async function GET() {
  try {
    const res = await fetch(JSONBIN_URL, {
      headers: {
        'X-Master-Key': JSONBIN_KEY,
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      const record = data?.record || data;
      if (record && (Array.isArray(record.courses) || Array.isArray(record.users))) {
        inMemoryStore = {
          courses: record.courses || [],
          users: record.users || [],
        };
      }
    }
  } catch (err) {
    console.error('API GET sync error:', err);
  }

  return NextResponse.json(inMemoryStore, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const courses = Array.isArray(body?.courses) ? body.courses : inMemoryStore.courses;
    const users = Array.isArray(body?.users) ? body.users : inMemoryStore.users;

    inMemoryStore = { courses, users };

    // Async push to JSONBin from server side (No CORS issues on server side!)
    fetch(JSONBIN_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_KEY,
      },
      body: JSON.stringify({ courses, users }),
    }).catch((err) => console.error('API PUT cloud error:', err));

    return NextResponse.json({ success: true, store: inMemoryStore });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update store' }, { status: 500 });
  }
}
