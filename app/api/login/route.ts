import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // TODO: Implement actual user authentication logic
  if (email === 'user@example.com' && password === 'password') {
    return NextResponse.json({ id: '1', email });
  } else {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
}

