import { NextRequest } from 'next/server';

import { POST as refreshPost } from '@/app/api/refresh/route';

export async function POST(request: NextRequest) {
  return refreshPost(request);
}
