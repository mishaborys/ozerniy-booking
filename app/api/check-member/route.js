import { checkUserMembership } from '@/lib/telegram';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const isMember = await checkUserMembership(userId);
    
    return NextResponse.json({ isMember });
  } catch (error) {
    console.error('Check membership error:', error);
    return NextResponse.json(
      { error: 'Failed to check membership' },
      { status: 500 }
    );
  }
}
