import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(['Test 1', 'Test 2', 'Test 3']);
}