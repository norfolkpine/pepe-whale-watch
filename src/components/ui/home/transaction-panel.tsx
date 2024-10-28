import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Transaction } from '@/types/types'

interface TransactionPanelProps {
  isPanelOpen: boolean;
  transactions: Transaction[];
}

export function TransactionPanel({ isPanelOpen, transactions }: TransactionPanelProps) {
  return (
    <div
      className={`fixed right-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-20 ${
        isPanelOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-4 h-full overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
        <div className="space-y-2">
          <Table className="w-full text-xs">
            <TableHeader>
              <TableRow className='border-none'>
                <TableHead className="py-1">Amount</TableHead>
                <TableHead className="py-1">From</TableHead>
                <TableHead className="py-1">To</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-gray-50">
                  <TableCell className="py-1 text-black">
                    {transaction.amount.toLocaleString()} {transaction.tokenSymbol}
                  </TableCell>
                  <TableCell className="py-1 text-black">
                    {transaction.sender.slice(0, 4)}...
                  </TableCell>
                  <TableCell className="py-1 text-black">
                    {transaction.receiver.slice(0, 4)}...
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
