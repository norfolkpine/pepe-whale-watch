import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { tokenAddresses } from '@/config/token-address'
import { formatNumber } from '@/lib/utils'
import { usePriceStore } from '@/store/usePriceStore'
import { useTransactionStore } from '@/store/useTransactionStore'
import { AddressData, Transaction } from '@/types/types'
import { Loader2 } from 'lucide-react'
import { useEffect, useState, useCallback, useMemo } from 'react'

interface TransactionPanelProps {
  isPanelOpen: boolean
  transactions: Transaction[]
}

export function TransactionPanel({
  isPanelOpen,
  transactions: streamedTransactions,
}: TransactionPanelProps) {
  const { fetchTransactions, transactions, isLoading, error } =
    useTransactionStore()
  const prices = usePriceStore((state) => state.prices)

  const [historyTransactions, setHistoryTransactions] = useState<Transaction[]>([])

  const [addressData, setAddressData] = useState<AddressData[]>([])

  const addressLookup = useMemo(() => {
    const lookup = new Map<string, string>()
    addressData.forEach((data) => {
      const cleanAddress = data.address
        .replace(/['"]/g, '')
        .trim()
        .toLowerCase()
      const cleanNameTag = data.nameTag?.replace(/['"]/g, '').trim() || ''
      if (cleanAddress && cleanNameTag) {
        lookup.set(cleanAddress, cleanNameTag)
      }
    })
    return lookup
  }, [addressData])

  const getNameTag = useCallback(
    (address: string) => {
      const normalizedAddress = address.trim().toLowerCase()
      return (
        addressLookup.get(normalizedAddress) ||
        `${address.slice(0, 6)}...${address.slice(-4)}`
      )
    },
    [addressLookup]
  )

  useEffect(() => {
    const loadAddressData = async () => {
      try {
        const response = await fetch('sample/accounts.csv')
        const csvText = await response.text()
        const rows = csvText.split('\n').slice(1)
        const parsed = rows
          .filter((row) => row.trim())
          .map((row) => {
            const [address, _chainId, _label, nameTag] = row.split(',')
            return {
              address: address.replace(/['"]/g, '').trim().toLowerCase(),
              nameTag: nameTag?.replace(/['"]/g, '').trim(),
            }
          })
        setAddressData(parsed)
      } catch (error) {
        console.error('Error loading CSV:', error)
      }
    }
    loadAddressData()
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchTransactions(tokenAddresses.PEPE)
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    loadData()
  }, [fetchTransactions])

  useEffect(() => {
    if (transactions.length > 0) {
      const tokenPrice = prices[tokenAddresses.PEPE] || 0
      const newTransactions = transactions.map((transaction) => {
        const typedTransaction: Transaction = {
          id: Math.random(),
          amount: Number(transaction.value_decimal),
          timestamp: new Date(transaction.block_timestamp),
          sender: transaction.from_address,
          receiver: transaction.to_address,
          tokenName: transaction.token_name,
          tokenSymbol: transaction.token_symbol,
          transactionHash: transaction.transaction_hash,
          senderName: getNameTag(transaction.from_address),
          receiverName: getNameTag(transaction.to_address),
          usdValue: tokenPrice * parseFloat(transaction.value_decimal),
          yPosition: 0,
        }
        return typedTransaction
      })
      setHistoryTransactions((prev) => [...prev, ...newTransactions])
    }
  }, [transactions])

  useEffect(() => {
    if (streamedTransactions.length > 0 && transactions.length > 0) {
      setHistoryTransactions((prev) => [...streamedTransactions, ...prev])
    }
  }, [streamedTransactions])


  const handleAddressClick = useCallback((address: string) => {
    window.open(`https://etherscan.io/address/${address}`, '_blank')
  }, [])

  const handleTxClick = useCallback((txHash: string) => {
    window.open(`https://etherscan.io/tx/${txHash}`, '_blank')
  }, [])

  const transactionRows = useMemo(
    () =>
      historyTransactions.map((transaction, index) => (
        <TableRow
          key={`${transaction.transactionHash}-${index}`}
          className='hover:bg-gray-50'
        >
          <TableCell className='py-1 text-black sm:py-2'>
            <span className='block truncate'>
              {formatNumber(transaction.amount.toString().split('.')[0])}{' '}
              {transaction.tokenSymbol}
            </span>
          </TableCell>
          <TableCell className='py-1 text-black'>
            $
            {transaction.usdValue.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
              useGrouping: true,
            })}
          </TableCell>
          <TableCell
            className='cursor-pointer py-1 text-black underline hover:text-blue-500 sm:py-2'
            onClick={() => handleAddressClick(transaction.sender)}
          >
            <span className='block truncate'>
              {transaction.senderName ?? transaction.sender}
            </span>
          </TableCell>
          <TableCell
            className='cursor-pointer py-1 text-black underline hover:text-blue-500 sm:py-2'
            onClick={() => handleAddressClick(transaction.receiver)}
          >
            <span className='block truncate'>
              {transaction.receiverName ?? transaction.receiver}
            </span>
          </TableCell>
          <TableCell
            className='py-1 text-black underline hover:text-blue-500 sm:py-2'
            onClick={() => handleTxClick(transaction.transactionHash)}
          >
            <span className='block truncate'>
              <span className='hidden sm:inline'>
                {transaction.transactionHash.slice(0, 6)}...
                {transaction.transactionHash.slice(-6)}
              </span>
              <span className='sm:hidden'>
                {transaction.transactionHash.slice(0, 4)}...
                {transaction.transactionHash.slice(-4)}
              </span>
            </span>
          </TableCell>
        </TableRow>
      )),
    [historyTransactions, handleAddressClick, handleTxClick]
  )

  return (
    <div
      className={`fixed right-0 top-0 pt-2 z-20 h-full w-full transform bg-white shadow-lg transition-transform duration-300 ease-in-out sm:w-[80%] md:w-[70%] lg:w-[600px] ${
        isPanelOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className='flex h-full flex-col p-2 sm:p-4'>
        <h2 className='mb-1 text-base font-semibold sm:text-lg'>
          Transaction History
        </h2>
        {isLoading ? (
          <div className='flex h-40 items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin' />
          </div>
        ) : error ? (
          <div className='text-sm text-red-500'>{error}</div>
        ) : (
          <div className='flex min-h-0 flex-1 flex-col'>
            <div className='w-full overflow-y-auto'>
              <Table className='w-full text-[10px] sm:text-xs'>
                <TableHeader className='sticky top-0 z-10'>
                  <TableRow className='border-none'>
                    <TableHead className='h-6 bg-white py-1 sm:h-8'>
                      Amount
                    </TableHead>
                    <TableHead className='h-6 bg-white py-1 sm:h-8'>
                      USD Value
                    </TableHead>
                    <TableHead className='h-6 bg-white py-1 sm:h-8'>
                      From
                    </TableHead>
                    <TableHead className='h-6 bg-white py-1 sm:h-8'>
                      To
                    </TableHead>
                    <TableHead className='h-6 bg-white py-1 sm:h-8'>
                      Tx Hash
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{transactionRows}</TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
