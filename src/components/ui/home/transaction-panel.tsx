import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTransactionStore } from '@/store/useTransactionStore'
import { Loader2 } from "lucide-react"
import { useEffect } from "react";

interface TransactionPanelProps {
  isPanelOpen: boolean;
}

export function TransactionPanel({ isPanelOpen }: TransactionPanelProps) {
  const { fetchTransactions, transactions, isLoading, error } = useTransactionStore();

  useEffect(() => {
    fetchTransactions("0x6982508145454ce325ddbe47a25d4ec3d2311933")
  }, [])

  const handleAddressClick = (address: string) => {
    window.open(`https://etherscan.io/address/${address}`, '_blank');
  };

  const handleTxClick = (txHash: string) => {
    window.open(`https://etherscan.io/tx/${txHash}`, '_blank');
  };

  return (
    <div
      className={`fixed right-0 top-0 h-full w-full sm:w-[80%] md:w-[70%] lg:w-[600px] bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-20 ${
        isPanelOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-2 sm:p-4 h-full overflow-y-auto">
        <h2 className="text-base sm:text-lg font-semibold mb-1">Transaction History</h2>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm">{error}</div>
        ) : (
          <div className="space-y-2">
            <Table className="w-full text-[10px] sm:text-xs">
              <TableHeader>
                <TableRow className='border-none'>
                  <TableHead className="py-1 h-6 sm:h-8">Amount</TableHead>
                  <TableHead className="py-1 h-6 sm:h-8">From</TableHead>
                  <TableHead className="py-1 h-6 sm:h-8">To</TableHead>
                  <TableHead className="py-1 h-6 sm:h-8">Tx Hash</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction, index) => (
                  <TableRow 
                    key={`${transaction.from_address}-${transaction.to_address}-${index}`} 
                    className="hover:bg-gray-50"
                  >
                    <TableCell className="py-1 sm:py-2 text-black">
                      <span className="block truncate">
                        {transaction.value_decimal.toLocaleString().split(",")[0]} {transaction.token_symbol}
                      </span>
                    </TableCell>
                    <TableCell 
                      className="py-1 sm:py-2 text-black cursor-pointer hover:text-blue-500 underline"
                      onClick={() => handleAddressClick(transaction.from_address)}
                    >
                      <span className="block truncate">
                        {transaction.from_address.slice(0, 4)}...{transaction.from_address.slice(-4)}
                      </span>
                    </TableCell>
                    <TableCell 
                      className="py-1 sm:py-2 text-black cursor-pointer hover:text-blue-500 underline"
                      onClick={() => handleAddressClick(transaction.to_address)}
                    >
                      <span className="block truncate">
                        {transaction.to_address.slice(0, 4)}...{transaction.to_address.slice(-4)}
                      </span>
                    </TableCell>
                    <TableCell 
                      className="py-1 sm:py-2 text-black hover:text-blue-500 underline"
                      onClick={() => handleTxClick(transaction.transaction_hash)}
                    >
                      <span className="block truncate">
                        {transaction.transaction_hash.slice(0, 4)}...{transaction.transaction_hash.slice(-4)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
