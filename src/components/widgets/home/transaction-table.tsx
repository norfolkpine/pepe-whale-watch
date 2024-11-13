import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { Transaction } from '@/types/types'
import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { formatNumber } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function TransactionTable({
  transactions,
}: {
  transactions: Transaction[]
}) {
  const [isMinimized, setIsMinimized] = useState(false)

  const visibleTransactions = useMemo(() => {
    return transactions.slice(0, isMinimized ? 1 : undefined)
  }, [transactions, isMinimized])

  const handleAddressClick = (address: string) => {
    window.open(`https://etherscan.io/address/${address}`, '_blank')
  }

  return (
    <div className='absolute bottom-4 left-4 right-4 mx-auto max-w-4xl overflow-x-auto rounded-lg bg-white bg-opacity-80 p-2'>
      <div className='mb-2 flex items-center justify-between'>
        <span className='ml-1 text-sm font-medium'>Transactions</span>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className='rounded p-1 hover:bg-gray-100'
        >
          {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      <ScrollArea className="max-h-[200px] overflow-y-auto">
      <Table className='w-full text-xs'>
        <TableHeader className='sticky top-0 z-10'>
          <TableRow className='border-none'>
            <TableHead className='h-8 py-1'>Amount</TableHead>
            <TableHead className='h-8 py-1'>USD Value</TableHead>
            <TableHead className='h-8 py-1'>Token</TableHead>
            <TableHead className='h-8 py-1'>From</TableHead>
            <TableHead className='h-8 py-1'>To</TableHead>
            <TableHead className='h-8 py-1'>Time</TableHead>
            <TableHead className='h-8 py-1'>Tx Hash</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className='max-h-[200px] xl:max-h-[400px] 2xl:max-h-[600px] overflow-y-auto'>
          {visibleTransactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className='py-1 text-black'>
                {formatNumber(transaction.amount.toString().split('.')[0])}{' '}
                {transaction.tokenSymbol}
              </TableCell>
              <TableCell className='py-1 text-black'>
                $
                {transaction.usdValue.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                  useGrouping: true,
                })}
              </TableCell>
              <TableCell className='py-1 text-black'>
                {transaction.tokenName}
              </TableCell>
              <TableCell
                className='py-1 text-black underline hover:text-blue-600'
                onClick={() => handleAddressClick(transaction.sender)}
              >
                {transaction.senderName ?? transaction.sender}
              </TableCell>
              <TableCell
                className='py-1 text-black underline hover:text-blue-600'
                onClick={() => handleAddressClick(transaction.receiver)}
              >
                {transaction.receiverName ?? transaction.receiver}
              </TableCell>
              <TableCell className='py-1 text-black'>
                {transaction.timestamp.toLocaleString()}
              </TableCell>
              <TableCell className='py-1 text-black'>
                <a
                  href={`https://etherscan.io/tx/${transaction.transactionHash}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='underline hover:text-blue-600'
                >
                  {transaction.transactionHash.slice(0, 6)}...
                  {transaction.transactionHash.slice(-4)}
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </ScrollArea>
    </div>
  )
}
