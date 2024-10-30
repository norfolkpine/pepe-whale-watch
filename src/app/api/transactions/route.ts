import { NextResponse } from 'next/server';

let latestTransactions: any = null;

export async function GET() {
  const encoder = new TextEncoder();
  
  // Create a streaming response
  const stream = new ReadableStream({
    async start(controller) {
      // Initial data
      if (latestTransactions) {
        controller.enqueue(encoder.encode(JSON.stringify(latestTransactions)));
      }
      
      // Keep the stream open for future updates
      const interval = setInterval(() => {
        if (latestTransactions) {
          controller.enqueue(encoder.encode(JSON.stringify(latestTransactions)));
          latestTransactions = null; // Clear after sending
        }
      }, 1000);
      
      // Cleanup on close
      return () => clearInterval(interval);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/json',
      'Transfer-Encoding': 'chunked',
    },
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    latestTransactions = data;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process transaction' },
      { status: 500 }
    );
  }
}
