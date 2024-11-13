'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { AddressData, Transaction } from '@/types/types'
import { PanelToggleButton } from '@/components/widgets/home/panel-toggle-button'
import { TransactionPanel } from '@/components/ui/home/transaction-panel'
import { WhaleComponent } from '@/components/widgets/home/whale-component'
import TransactionTable from '@/components/widgets/home/transaction-table'
import { usePriceStore } from '@/store/usePriceStore';
import { tokenAddresses } from '@/config/token-address'
import { throttle } from 'lodash'

export default function Component() {
  const [whales, setWhales] = useState<Transaction[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [pendingWhales, setPendingWhales] = useState<Transaction[]>([])
  const maxWhalesDisplayed = 5
  const pollingInterval = 500
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const fetchPrice = usePriceStore((state) => state.fetchPrice)
  const prices = usePriceStore((state) => state.prices)
  const delayCallPrice = 5 * 60 * 1000

  const [addressData, setAddressData] = useState<AddressData[]>([]);

    const addressLookup = useMemo(() => {
        const lookup = new Map<string, string>();
        addressData.forEach(data => {
            const cleanAddress = data.address.replace(/['"]/g, '').trim().toLowerCase();
            const cleanNameTag = data.nameTag?.replace(/['"]/g, '').trim() || '';
            if (cleanAddress && cleanNameTag) {
                lookup.set(cleanAddress, cleanNameTag);
            }
        });
        return lookup;
    }, [addressData]);


    useEffect(() => {
        const loadAddressData = async () => {
            try {
                const response = await fetch('sample/accounts.csv');
                const csvText = await response.text();
                const rows = csvText.split('\n').slice(1);
                const parsed = rows
                    .filter(row => row.trim()) 
                    .map(row => {
                        const [address, _chainId, _label, nameTag] = row.split(',');
                        return {
                            address: address.replace(/['"]/g, '').trim().toLowerCase(),
                            nameTag: nameTag?.replace(/['"]/g, '').trim()
                        };
                    });
                setAddressData(parsed);
            } catch (error) {
                console.error('Error loading CSV:', error);
            }   
        };
        loadAddressData();
    }, []);

  const updateTransactions = useCallback(
    throttle((newTransactions: Transaction[]) => {
      setTransactions(prev => [...newTransactions, ...prev].slice(0, 1000))
    }, 1000),
    []
  )

  useEffect(() => {
    if (pendingWhales.length > 0 && whales.length < maxWhalesDisplayed) {
      const nextWhale = pendingWhales[0]
      setWhales(prev => [...prev, nextWhale])
      setPendingWhales(prev => prev.slice(1))
    }
  }, [pendingWhales, whales])

  const workerRef = useRef<Worker>()

  useEffect(() => {
    if (typeof window !== 'undefined' && prices[tokenAddresses.PEPE] && addressLookup.size > 0) {
      workerRef.current = new Worker(
        new URL('../workers/transaction.worker.ts', import.meta.url)
      )

      workerRef.current.onmessage = (event) => {
        const { type, data, error } = event.data
        
        if (type === 'newTransactions') {
          const uniqueTransactions = data.filter(
            (newTx: Transaction) =>
              !whales.some((whale) => whale.transactionHash === newTx.transactionHash) &&
              !transactions.some((tx) => tx.transactionHash === newTx.transactionHash) &&
              !pendingWhales.some((whale) => whale.transactionHash === newTx.transactionHash)
          )

          if (uniqueTransactions.length > 0) {
            updateTransactions(uniqueTransactions)

            setPendingWhales(prev => [...prev, ...uniqueTransactions])
          }
        } else if (type === 'error') {
          console.error(error)
        }
      }

      workerRef.current.postMessage({
        type: 'start',
        prices,
        addressLookup: Array.from(addressLookup.entries()),
        pollingInterval
      })
    }

    return () => {
      workerRef.current?.terminate()
      updateTransactions.cancel()
    }
  }, [prices, addressLookup, pollingInterval, updateTransactions])

  useEffect(() => {
    fetchPrice(tokenAddresses.PEPE);

    const priceInterval = setInterval(() => {
      fetchPrice(tokenAddresses.PEPE);
    }, delayCallPrice);

    return () => {
      clearInterval(priceInterval);
    };
  }, [fetchPrice, delayCallPrice]);

  const removeWhale = useCallback((id: number) => {
    setWhales(prevWhales => prevWhales.filter(whale => whale.id !== id))
  }, [])

  return (
    <div className='relative h-screen w-full overflow-hidden bg-gradient-to-b from-blue-200 to-blue-400'>
      <h1 className='absolute left-1/2 top-4 z-20 -translate-x-1/2 transform px-4 text-center text-xl font-bold text-white sm:text-2xl md:text-3xl lg:text-4xl'>
        $PEPE Whale Alerts
      </h1>

      <PanelToggleButton
        isPanelOpen={isPanelOpen}
        onToggle={() => setIsPanelOpen(!isPanelOpen)}
      />

      <TransactionPanel isPanelOpen={isPanelOpen} transactions={transactions} />

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
