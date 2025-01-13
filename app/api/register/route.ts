import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // TODO: Implement actual user registration logic
  // For now, we'll just return a mock user
  return NextResponse.json({ id: '1', email });
}

