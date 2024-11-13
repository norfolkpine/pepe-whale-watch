'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { AddressData, Transaction, TransactionWebhookData } from '@/types/types'
import { PanelToggleButton } from '@/components/widgets/home/panel-toggle-button'
import { TransactionPanel } from '@/components/ui/home/transaction-panel'
import { WhaleComponent } from '@/components/widgets/home/whale-component'
import TransactionTable from '@/components/widgets/home/transaction-table'
import { usePriceStore } from '@/store/usePriceStore';
import { tokenAddresses } from '@/config/token-address'

export default function Component() {
  const [whales, setWhales] = useState<Transaction[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const lastYPosition = useRef(10)
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

    const getNameTag = useCallback((address: string) => {
        const normalizedAddress = address.trim().toLowerCase();
        return addressLookup.get(normalizedAddress) || `${address.slice(0, 6)}...${address.slice(-4)}`;
    }, [addressLookup]);

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
        const tokenPrice = prices[tokenAddresses.PEPE] || 0

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
            usdValue: tokenPrice * parseFloat(transfer.valueWithDecimals),
            senderName: getNameTag(transfer.from),
            receiverName: getNameTag(transfer.to),
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
            [transaction, ...prevTransactions]
          )
        })
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }, [generateNewYPosition, whales, transactions, prices, getNameTag])


  useEffect(() => {
    fetchPrice(tokenAddresses.PEPE);

    const priceInterval = setInterval(() => {
      fetchPrice(tokenAddresses.PEPE);
    }, delayCallPrice);

    return () => {
      clearInterval(priceInterval);
    };
  }, [fetchPrice, delayCallPrice]);

  useEffect(() => {
    if (prices[tokenAddresses.PEPE]) {
      fetchTransactions();

      const intervalId = setInterval(fetchTransactions, pollingInterval);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [fetchTransactions, prices]);


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
