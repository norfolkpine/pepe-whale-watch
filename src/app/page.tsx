"use client"

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Transaction, TransactionWebhookData } from '@/types/types'


const useAnimationProgress = (duration: number, delay: number = 0) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let rafId: number
    let startTime: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime - delay
      const newProgress = Math.min(elapsed / duration, 1)
      setProgress(newProgress)

      if (newProgress < 1) {
        rafId = requestAnimationFrame(animate)
      }
    }

    rafId = requestAnimationFrame(animate)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [duration, delay])

  return progress
}

const WhaleComponent = ({ transaction, onComplete }: { transaction: Transaction; onComplete: () => void }) => {
  const progress = useAnimationProgress(15000) // 15 seconds duration
  
  const minSize = 80
  const maxSize = 400 
  const minAmount = 100000 
  const maxAmount = 10000000 
  
  const whaleSize = Math.min(
    Math.max(
      minSize + ((transaction.amount - minAmount) / (maxAmount - minAmount)) * (maxSize - minSize),
      minSize
    ),
    maxSize
  )

  useEffect(() => {
    if (progress === 1) {
      onComplete()
    }
  }, [progress, onComplete])

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: `${progress * 120 - 10}%`, // Start slightly off-screen left and end slightly off-screen right
        top: `${transaction.yPosition}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pepe%20whale-tCYY02MMoyjV58qO5P8g79M4JICxWM.png"
              alt="Pepe Whale"
              style={{
                width: `${whaleSize}px`,
                height: 'auto',
                transform: 'scaleX(1)', // No horizontal flip
              }}
            />
          </TooltipTrigger>
          <TooltipContent 
            side="top" 
            align="start" 
            sideOffset={5}
          >
            <p>Amount: {transaction.amount.toLocaleString()} {transaction.tokenSymbol}</p>
            <p>From: {transaction.sender.slice(0, 6)}...{transaction.sender.slice(-4)}</p>
            <p>To: {transaction.receiver.slice(0, 6)}...{transaction.receiver.slice(-4)}</p>
            <p>Token: {transaction.tokenName}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  )
}

export default function Component() {
  const [whales, setWhales] = useState<Transaction[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const lastYPosition = useRef(10)

  const removeWhale = useCallback((id: number) => {
    setWhales(prevWhales => prevWhales.filter(whale => whale.id !== id))
  }, [])

  const generateNewYPosition = useCallback(() => {
    const minDistance = 20
    let newY = lastYPosition.current + minDistance
    if (newY > 80) {
      newY = 10
    }
    lastYPosition.current = newY
    return newY
  }, [])

  const connectSSE = useCallback(() => {
    let isConnected = false;
    const eventSource = new EventSource('/api/transactions', {
      withCredentials: true
    });

    const handleOpen = () => {
      console.log('SSE Connection established');
      isConnected = true;
    };

    const handleError = (error: Event) => {
      console.warn('SSE Connection Error:', error);
      if (isConnected) {
        // Only attempt reconnect if we were previously connected
        isConnected = false;
        eventSource.close();
        setTimeout(connectSSE, 1000);
      }
    };

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.connected) {
          console.log('Initial connection established');
          return;
        }

        const webhookData = data as TransactionWebhookData;
        
        // Process each ERC20 transfer as a transaction
        const newTransactions: Transaction[] = webhookData.erc20Transfers.map((transfer, index) => ({
          id: Date.now() + index, // Generate unique ID
          amount: parseFloat(transfer.valueWithDecimals),
          timestamp: new Date(parseInt(webhookData.block.timestamp) * 1000),
          sender: transfer.from,
          receiver: transfer.to,
          tokenName: transfer.tokenName,
          tokenSymbol: transfer.tokenSymbol,
          transactionHash: transfer.transactionHash,
          yPosition: generateNewYPosition()
        }));

        // Add each transaction to state
        newTransactions.forEach(transaction => {
          setWhales(prevWhales => [...prevWhales, transaction]);
          setTransactions(prevTransactions => 
            [transaction, ...prevTransactions].slice(0, 10)
          );
        });

      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    eventSource.addEventListener('open', handleOpen);
    eventSource.addEventListener('message', handleMessage);
    eventSource.addEventListener('error', handleError);

    return () => {
      isConnected = false;
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    const cleanup = connectSSE();
    return () => {
      cleanup();
    };
  }, [connectSSE]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-blue-200 to-blue-400">
      <h1 className="absolute top-4 left-1/2 transform -translate-x-1/2 text-4xl font-bold text-white z-20 shadow-lg">
        $PEPE Whale Alerts
      </h1>
      
      <AnimatePresence>
        {whales.map((whale) => (
          <WhaleComponent
            key={whale.id}
            transaction={whale}
            onComplete={() => removeWhale(whale.id)}
          />
        ))}
      </AnimatePresence>

      <div className="absolute bottom-4 left-4 right-4 max-w-4xl mx-auto bg-white bg-opacity-80 rounded-lg p-2 overflow-x-auto">
        <Table className="w-full text-xs">
          <TableHeader>
            <TableRow>
              <TableHead className="py-1">Amount</TableHead>
              <TableHead className="py-1">Token</TableHead>
              <TableHead className="py-1">From</TableHead>
              <TableHead className="py-1">To</TableHead>
              <TableHead className="py-1">Time</TableHead>
              <TableHead className="py-1">Tx Hash</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="py-1">{transaction.amount.toLocaleString()} {transaction.tokenSymbol}</TableCell>
                <TableCell className="py-1">{transaction.tokenName}</TableCell>
                <TableCell className="py-1">{transaction.sender.slice(0, 6)}...{transaction.sender.slice(-4)}</TableCell>
                <TableCell className="py-1">{transaction.receiver.slice(0, 6)}...{transaction.receiver.slice(-4)}</TableCell>
                <TableCell className="py-1">{transaction.timestamp.toLocaleString()}</TableCell>
                <TableCell className="py-1">
                  <a href={`https://etherscan.io/tx/${transaction.transactionHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {transaction.transactionHash.slice(0, 6)}...{transaction.transactionHash.slice(-4)}
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
