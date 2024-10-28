import { TransactionWebhookData } from '@/types/types';
import { NextResponse } from 'next/server';
import { EventEmitter } from 'events';

// Increase the limit
EventEmitter.defaultMaxListeners = 20;  // or any number higher than current listeners

// Track active connections
const clients = new Set<ReadableStreamDefaultController>();

// Broadcast to all connected clients
function broadcast(data: any) {
  const encoder = new TextEncoder();
  clients.forEach((controller) => {
    try {
      if (controller.desiredSize !== null) {  // Check if controller is still valid
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }
    } catch (error) {
      console.error('Error sending to client:', error);
      // Remove failed controller
      clients.delete(controller);
    }
  });
}

// GET endpoint for SSE connections
export async function GET() {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start: (controller) => {
      clients.add(controller);
      
      // Send initial connection message
      controller.enqueue(encoder.encode('data: {"connected": true}\n\n'));
      
      // Remove client when connection closes
      return () => {
        clients.delete(controller);
        console.log('Client disconnected, remaining clients:', clients.size);
      };
    },
    cancel: () => {
      // Clean up when client disconnects
      console.log('Stream cancelled by client');
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// POST endpoint for receiving webhook data
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (clients.size > 0) {
      broadcast(data);
      return NextResponse.json({ success: true, clientCount: clients.size });
    } else {
      return NextResponse.json({ success: false, message: 'No connected clients' });
    }
    
  } catch (error) {
    console.error('Error processing transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process transaction' },
      { status: 500 }
    );
  }
}

// Optional: Cleanup function for when server restarts/closes
export function cleanup() {
  clients.forEach((controller) => {
    try {
      controller.close();
    } catch (error) {
      console.error('Error closing controller:', error);
    }
  });
  clients.clear();
}
