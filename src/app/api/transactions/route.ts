import { NextResponse } from 'next/server';

// We'll use a simple in-memory cache with timestamp
let transactionCache = {
  data: null,
  timestamp: Date.now()
};

export async function GET() {
  try {
    return NextResponse.json({
      data: transactionCache.data,
      timestamp: transactionCache.timestamp
    });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Update cache with new data
    transactionCache = {
      data,
      timestamp: Date.now()
    };

    return NextResponse.json({ 
      success: true,
      timestamp: transactionCache.timestamp
    });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process transaction' },
      { status: 500 }
    );
  }
}

export const runtime = "edge";