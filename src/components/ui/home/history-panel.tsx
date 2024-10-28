import { motion } from 'framer-motion'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useHistoryStore } from '@/store/useHistoryStore'
import { useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { formatCurrency } from '@/lib/utils'

interface HistoryPanelProps {
  isOpen: boolean
  onClose: () => void
}

export const HistoryPanel = ({ isOpen, onClose }: HistoryPanelProps) => {
  const { transactions, isLoading, error, fetchTransactions } = useHistoryStore()

  useEffect(() => {
    if (isOpen) {
      fetchTransactions()
    }
  }, [isOpen, fetchTransactions])

  const dailyStats = transactions.reduce((acc, tx) => {
    const date = new Date(Number(tx.timeStamp) * 1000).toISOString().split('T')[0]
    const value = Number(tx.value) / 1e18 
    if (!acc[date]) {
      acc[date] = {
        date,
        totalTransactions: 0,
        totalVolume: 0,
        averageAmount: 0,
        largestTx: 0
      }
    }

    acc[date].totalTransactions += 1
    acc[date].totalVolume += value
    acc[date].largestTx = Math.max(acc[date].largestTx, value)
    acc[date].averageAmount = acc[date].totalVolume / acc[date].totalTransactions

    return acc
  }, {} as Record<string, {
    date: string
    totalTransactions: number
    totalVolume: number
    averageAmount: number
    largestTx: number
  }>)

  const dailyStatsArray = Object.values(dailyStats).sort((a, b) => 
    b.date.localeCompare(a.date)
  )

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: isOpen ? 0 : '100%' }}
      transition={{ type: 'spring', damping: 20 }}
      className="fixed top-0 right-0 h-full w-[600px] bg-white shadow-lg z-30"
    >
      <div className="p-4 h-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Transaction History</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}

        {error && !transactions && (
          <div className="text-red-500 text-center p-4">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <div className="overflow-y-auto max-h-[calc(100vh-100px)]">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="py-2 w-fit whitespace-nowrap">Date</TableHead>
                  <TableHead className="text-right py-2">Txs</TableHead>
                  <TableHead className="text-right py-2">Vol</TableHead>
                  <TableHead className="text-right py-2">Avg</TableHead>
                  <TableHead className="text-right py-2">Max</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyStatsArray.map((item) => (
                  <TableRow 
                    key={item.date}
                    className="hover:bg-gray-50 cursor-pointer border-b"
                  >
                    <TableCell className="font-medium py-1 text-sm whitespace-nowrap">{item.date}</TableCell>
                    <TableCell className="text-right py-1 text-sm">{formatCurrency(item.totalTransactions)}</TableCell>
                    <TableCell className="text-right py-1 text-sm">{formatCurrency(item.totalVolume)}</TableCell>
                    <TableCell className="text-right py-1 text-sm">{formatCurrency(item.averageAmount)}</TableCell>
                    <TableCell className="text-right py-1 text-sm">{formatCurrency(item.largestTx)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </motion.div>
  )
}
