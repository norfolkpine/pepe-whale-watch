import { tokenAddresses } from '@/config';
import { Transaction, TransactionWebhookData } from '@/types/types'

let lastYPosition = 10;
let transactionBuffer: Transaction[] = []
const BATCH_SIZE = 10
const BATCH_INTERVAL = 2000 // 2 seconds
const processedHashes = new Set<string>();

function generateNewYPosition() {
  const minDistance = 20
  let newY = lastYPosition + minDistance
  if (newY > 80) {
    newY = 10
  }
  lastYPosition = newY
  return newY
}

function processBatch() {
  if (transactionBuffer.length > 0) {
    self.postMessage({ 
      type: 'newTransactions', 
      data: transactionBuffer.slice(0, BATCH_SIZE) 
    })
    transactionBuffer = transactionBuffer.slice(BATCH_SIZE)
  }
}

async function fetchTransactions(prices: Record<string, number>, addressLookup: Map<string, string>) {
  try {
    const response = await fetch('/api/transactions', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) throw new Error('Network response was not ok')

    const webhookData = await response.json() as TransactionWebhookData

    if (webhookData.erc20Transfers?.length > 0) {
      const newTransfers = webhookData.erc20Transfers.filter(
        transfer => !processedHashes.has(transfer.transactionHash)
      );

      if (newTransfers.length === 0) return;

      const newTransactions = newTransfers.map((transfer, index) => {
        processedHashes.add(transfer.transactionHash);
        
        return {
          id: Date.now() + index,
          amount: parseFloat(transfer.valueWithDecimals),
          timestamp: new Date(parseInt(webhookData.block.timestamp) * 1000),
          sender: transfer.from,
          receiver: transfer.to,
          tokenName: transfer.tokenName,
          tokenSymbol: transfer.tokenSymbol,
          transactionHash: transfer.transactionHash,
          yPosition: generateNewYPosition(),
          usdValue: (prices[tokenAddresses.PEPE] || 0) * parseFloat(transfer.valueWithDecimals),
          senderName: getNameTag(transfer.from, addressLookup),
          receiverName: getNameTag(transfer.to, addressLookup),
        };
      });

      if (newTransactions.length > 0) {
        transactionBuffer.push(...newTransactions);
      }
    }
  } catch (error) {
    self.postMessage({ type: 'error', error: 'Error fetching transactions' })
  }
}

function getNameTag(address: string, addressLookup: Map<string, string>) {
  const normalizedAddress = address.trim().toLowerCase();
  return addressLookup.get(normalizedAddress) || `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function cleanupOldHashes() {
  if (processedHashes.size > 1000) {
    const hashesArray = Array.from(processedHashes);
    const toRemove = hashesArray.slice(0, hashesArray.length - 1000);
    toRemove.forEach(hash => processedHashes.delete(hash));
  }
}

self.onmessage = (event) => {
  const { type, prices, addressLookup, pollingInterval } = event.data
  
  if (type === 'start') {
    const batchInterval = setInterval(processBatch, BATCH_INTERVAL);
    
    const cleanupInterval = setInterval(cleanupOldHashes, 60000);

    const poll = () => {
      fetchTransactions(prices, new Map(addressLookup));
      setTimeout(poll, pollingInterval);
    }
    poll();

    self.addEventListener('close', () => {
      clearInterval(batchInterval);
      clearInterval(cleanupInterval);
    });
  }
} 