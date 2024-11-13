import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatNumber } from "@/lib/utils";
import { useTransactionStore } from '@/store/useTransactionStore'
import { AddressData } from "@/types/types";
import { Loader2 } from "lucide-react"
import { useEffect, useState, useCallback, useMemo } from "react";

interface TransactionPanelProps {
  isPanelOpen: boolean;
}

export function TransactionPanel({ isPanelOpen }: TransactionPanelProps) {
  const { fetchTransactions, transactions, isLoading, error } = useTransactionStore();
  const [addressData, setAddressData] = useState<AddressData[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchTransactions("0x6982508145454ce325ddbe47a25d4ec3d2311933");
        
        const response = await fetch('sample/accounts.csv');
        const csvText = await response.text();
        const rows = csvText.split('\n').slice(1);
        const parsed = rows.map(row => {
          const [address, chainId, label, nameTag] = row.split(',');
          return { 
            address: address.toLowerCase().trim(),
            chainId, 
            label, 
            nameTag: nameTag?.replace(/['"]/g, '')
          };
        });
        setAddressData(parsed);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, [fetchTransactions]);

  const getNameTag = useCallback((address: string) => {
    const normalizedAddress = address.toLowerCase().trim();
    const data = addressData.find(d => d.address === normalizedAddress);
    return data?.nameTag || `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [addressData]);

  const handleAddressClick = useCallback((address: string) => {
    window.open(`https://etherscan.io/address/${address}`, '_blank');
  }, []);

  const handleTxClick = useCallback((txHash: string) => {
    window.open(`https://etherscan.io/tx/${txHash}`, '_blank');
  }, []);

  const transactionRows = useMemo(() => (
    transactions.map((transaction, index) => (
      <TableRow 
        key={`${transaction.transaction_hash}-${index}`}
        className="hover:bg-gray-50"
      >
        <TableCell className="py-1 sm:py-2 text-black">
          <span className="block truncate">
            {formatNumber(transaction.value_decimal.split(".")[0])} {transaction.token_symbol}
          </span>
        </TableCell>
        <TableCell 
          className="py-1 sm:py-2 text-black cursor-pointer hover:text-blue-500 underline"
          onClick={() => handleAddressClick(transaction.from_address)}
        >
          <span className="block truncate">
            {getNameTag(transaction.from_address)}
          </span>
        </TableCell>
        <TableCell 
          className="py-1 sm:py-2 text-black cursor-pointer hover:text-blue-500 underline"
          onClick={() => handleAddressClick(transaction.to_address)}
        >
          <span className="block truncate">
            {getNameTag(transaction.to_address)}
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
    ))
  ), [transactions, getNameTag, handleAddressClick, handleTxClick]);

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
                {transactionRows}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
