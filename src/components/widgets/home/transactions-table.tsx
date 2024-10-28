import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Transaction } from '@/types/types'

interface TransactionsTableProps {
  transactions: Transaction[]
}

export const TransactionsTable = ({ transactions }: TransactionsTableProps) => {
  return (
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
  )
}
