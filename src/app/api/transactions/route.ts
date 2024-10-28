import { TransactionWebhookData } from '@/types/types';
import { NextResponse } from 'next/server';

// Create a Set to store connected clients
const clients = new Set<ReadableStreamDefaultController>();

// Helper function to send data to all connected clients
function broadcast(data: any) {
  clients.forEach(client => {
    client.enqueue(`data: ${JSON.stringify(data)}\n\n`);
  });
}

// SSE endpoint
export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller);

      // Remove client when connection closes
      return () => clients.delete(controller);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export async function POST(request: Request) {
  try {
    const body: TransactionWebhookData = await request.json();

    if (!body.erc20Transfers || body.erc20Transfers.length === 0) {
      return NextResponse.json(
        { message: 'No ERC20 transfers found' },
        { status: 400 }
      );
    }

    const processedTransfers = body.erc20Transfers.map(transfer => {
      const timestamp = new Date(parseInt(body.block.timestamp) * 1000);
      return {
        id: Date.now(),
        amount: parseFloat(transfer.valueWithDecimals),
        timestamp: timestamp.toISOString(), // Convert to string format
        sender: transfer.from,
        receiver: transfer.to,
        tokenName: transfer.tokenName,
        tokenSymbol: transfer.tokenSymbol,
        transactionHash: transfer.transactionHash,
      };
    });

    // Broadcast the processed transfers to all connected clients
    broadcast(processedTransfers);

    return NextResponse.json({ 
      message: 'Success',
      data: processedTransfers
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error processing transaction:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
