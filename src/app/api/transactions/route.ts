import { NextResponse } from 'next/server';

type Controller = TransformStreamDefaultController;
type Message = string | ArrayBufferLike | Blob | ArrayBufferView;

const createMessageQueue = () => {
  const encoder = new TextEncoder();
  const controllers = new Set<Controller>();
  
  return {
    subscribe: (controller: Controller) => {
      controllers.add(controller);
      controller.enqueue(encoder.encode('data: {"status":"connected"}\n\n'));
      
      return () => {
        controllers.delete(controller);
      };
    },
    
    publish: (message: any) => {
      const encodedMessage = encoder.encode(`data: ${JSON.stringify(message)}\n\n`);
      controllers.forEach((controller) => {
        try {
          controller.enqueue(encodedMessage);
        } catch (error) {
          controllers.delete(controller);
        }
      });
      return controllers.size;
    },
    
    getConnectionsCount: () => controllers.size
  };
};

const queue = createMessageQueue();

export async function GET() {
  try {
    let cleanup: (() => void) | undefined;

    const stream = new TransformStream({
      start(controller) {
        cleanup = queue.subscribe(controller);
      },
      transform(chunk, controller) {
        controller.enqueue(chunk);
      },
      flush() {
        if (cleanup) cleanup();
      },
    });

    return new Response(stream.readable, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "text/event-stream",
        "Connection": "keep-alive",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
        "Content-Encoding": "none",
      },
    });
  } catch (error) {
    console.error('GET error:', error);
    return new Response('Error establishing connection', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (queue.getConnectionsCount() === 0) {
      return NextResponse.json(
        { success: false, error: 'No active connections' },
        { status: 503 }
      );
    }

    const activeConnections = queue.publish(data);

    return NextResponse.json({ 
      success: true,
      activeConnections 
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