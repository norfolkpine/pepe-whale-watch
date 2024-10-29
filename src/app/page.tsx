'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Transaction, TransactionWebhookData } from '@/types/types'
import { PanelToggleButton } from '@/components/widgets/home/panel-toggle-button'
import { TransactionPanel } from '@/components/ui/home/transaction-panel'
import { WhaleComponent } from '@/components/widgets/home/whale-component'
import TransactionTable from '@/components/widgets/home/transaction-table'

export default function Component() {
  const [whales, setWhales] = useState<Transaction[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const lastYPosition = useRef(10)
  const pollingInterval = 5000 // 5 seconds
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const removeWhale = useCallback((id: number) => {
    setWhales((prevWhales) => prevWhales.filter((whale) => whale.id !== id))
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

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) throw new Error('Network response was not ok')

      const webhookData = (await response.json()) as TransactionWebhookData

      if (webhookData.erc20Transfers && webhookData.erc20Transfers.length > 0) {
        const newTransactions: Transaction[] = webhookData.erc20Transfers.map(
          (transfer, index) => ({
            id: Date.now() + index,
            amount: parseFloat(transfer.valueWithDecimals),
            timestamp: new Date(parseInt(webhookData.block.timestamp) * 1000),
            sender: transfer.from,
            receiver: transfer.to,
            tokenName: transfer.tokenName,
            tokenSymbol: transfer.tokenSymbol,
            transactionHash: transfer.transactionHash,
            yPosition: generateNewYPosition(),
          })
        )

        // Filter out duplicates based on transactionHash
        const uniqueTransactions = newTransactions
        .filter(
          (newTx) =>
            !whales.some(
              (whale) => whale.transactionHash === newTx.transactionHash
            ) &&
            !transactions.some(
              (tx) => tx.transactionHash === newTx.transactionHash
            )
        )

        uniqueTransactions.forEach((transaction) => {
          setWhales((prevWhales) => [...prevWhales, transaction])
          setTransactions((prevTransactions) =>
            [transaction, ...prevTransactions].slice(0, 10)
          )
        })
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }, [generateNewYPosition, whales, transactions])

  useEffect(() => {
    fetchTransactions()

    const intervalId = setInterval(fetchTransactions, pollingInterval)

    return () => {
      clearInterval(intervalId)
    }
  }, [fetchTransactions])

  return (
    <div className='relative h-screen w-full overflow-hidden bg-gradient-to-b from-blue-200 to-blue-400'>
      <h1 className='absolute left-1/2 top-4 z-20 -translate-x-1/2 transform px-4 text-center text-xl font-bold text-white sm:text-2xl md:text-3xl lg:text-4xl'>
        $PEPE Whale Alerts
      </h1>

      <PanelToggleButton
        isPanelOpen={isPanelOpen}
        onToggle={() => setIsPanelOpen(!isPanelOpen)}
      />

      <TransactionPanel isPanelOpen={isPanelOpen} />

      <AnimatePresence>
      {whales.map((whale) => (
          <WhaleComponent
            key={whale.id}
            transaction={whale}
            onComplete={() => removeWhale(whale.id)}
          />
        ))}
      </AnimatePresence>

      <TransactionTable transactions={transactions} />
    </div>
  )
}
