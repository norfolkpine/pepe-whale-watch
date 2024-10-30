'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Transaction } from '@/types/types'
import { PanelToggleButton } from '@/components/widgets/home/panel-toggle-button'
import { TransactionPanel } from '@/components/ui/home/transaction-panel'
import { WhaleComponent } from '@/components/widgets/home/whale-component'
import TransactionTable from '@/components/widgets/home/transaction-table'
import { usePriceStore } from '@/store/usePriceStore'
import { useInterval } from '@/hooks/useInterval'

export default function Component() {
  const [whales, setWhales] = useState<Transaction[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const lastYPosition = useRef(10)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const fetchPrice = usePriceStore((state) => state.fetchPrice)
  const prices = usePriceStore((state) => state.prices)
  const delayCallPrice = 5 * 60 * 1000
  const tokenAddress = '0x6982508145454ce325ddbe47a25d4ec3d2311933'
  const [lastTimestamp, setLastTimestamp] = useState(0)


  const generateNewYPosition = useCallback(() => {
    const minDistance = 20
    let newY = lastYPosition.current + minDistance
    if (newY > 80) {
      newY = 10
    }
    lastYPosition.current = newY
    return newY
  }, [])


  const processTransactions = useCallback((webhookData: any) => {
    if (webhookData.erc20Transfers && webhookData.erc20Transfers.length > 0) {
      const tokenPrice = prices[tokenAddress] || 0
      
      const newTransactions: Transaction[] = webhookData.erc20Transfers.map(
        (transfer: any, index: number) => ({
          id: Date.now() + index,
          amount: parseFloat(transfer.valueWithDecimals),
          usdValue: tokenPrice * parseFloat(transfer.valueWithDecimals),
          timestamp: new Date(parseInt(webhookData.block.timestamp) * 1000),
          sender: transfer.from,
          receiver: transfer.to,
          tokenName: transfer.tokenName,
          tokenSymbol: transfer.tokenSymbol,
          transactionHash: transfer.transactionHash,
          contractAddress: transfer.contractAddress,
          yPosition: generateNewYPosition(),
        })
      )

      const uniqueTransactions = newTransactions.filter((newTx) => {
        const isDuplicate =
          whales.some((whale) => whale.transactionHash === newTx.transactionHash) ||
          transactions.some((tx) => tx.transactionHash === newTx.transactionHash)
        return !isDuplicate
      })

      if (uniqueTransactions.length > 0) {
        setWhales((prevWhales) => {
          const newWhales = [...prevWhales]
          uniqueTransactions.forEach((tx) => {
            if (!newWhales.some((whale) => whale.transactionHash === tx.transactionHash)) {
              newWhales.push(tx)
            }
          })
          return newWhales
        })

        setTransactions((prevTransactions) => {
          const newTransactions = [...uniqueTransactions, ...prevTransactions]
          const uniqueTransactionsMapped = Array.from(
            new Map(newTransactions.map((tx) => [tx.transactionHash, tx])).values()
          )
          return uniqueTransactionsMapped.slice(0, 10)
        })
      }
    }
  }, [prices, tokenAddress, whales, transactions, generateNewYPosition])


  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch('/api/transactions');
      const { data, timestamp } = await response.json();
      
      if (data && timestamp > lastTimestamp) {
        setLastTimestamp(timestamp);
        processTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }, [lastTimestamp, processTransactions]);

  const removeWhale = useCallback((id: number) => {
    setWhales((prevWhales) => prevWhales.filter((whale) => whale.id !== id))
  }, [])

  
  useEffect(() => {
    fetchPrice(tokenAddress);
  }, [fetchPrice])

  useEffect(() => {
    if (prices[tokenAddress]) {
      // Initial fetch
      fetchTransactions();
      
      const transactionInterval = setInterval(fetchTransactions, 3000); // Poll every 3 seconds
      const priceInterval = setInterval(() => {
        fetchPrice(tokenAddress);
      }, delayCallPrice);

      return () => {
        clearInterval(transactionInterval);
        clearInterval(priceInterval);
      };
    }
  }, [fetchTransactions, fetchPrice, delayCallPrice, prices]);

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
