import { Table, TableRow, TableBody, TableCell, TableHead, TableHeader } from "@/components/ui/table";
import { Transaction } from "@/types/types";
import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function TransactionTable({ transactions }: { transactions: Transaction[] }) {
    const [isMinimized, setIsMinimized] = useState(false);

    return (
        <div className='absolute bottom-4 left-4 right-4 mx-auto max-w-4xl overflow-x-auto rounded-lg bg-white bg-opacity-80 p-2'>
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium ml-1">Transactions</span>
                <button 
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1 hover:bg-gray-100 rounded"
                >
                    {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
            </div>
            
            <Table className='w-full text-xs'>
                <TableHeader>
                    <TableRow className='border-none'>
                        <TableHead className='py-1 h-8'>Amount</TableHead>
                        <TableHead className='py-1 h-8'>USD Value</TableHead>
                        <TableHead className='py-1 h-8'>Token</TableHead>
                        <TableHead className='py-1 h-8'>From</TableHead>
                        <TableHead className='py-1 h-8'>To</TableHead>
                        <TableHead className='py-1 h-8'>Time</TableHead>
                        <TableHead className='py-1 h-8'>Tx Hash</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions
                        .slice(0, isMinimized ? 1 : undefined)
                        .map((transaction) => (
                            <TableRow key={transaction.id}>
                                <TableCell className='py-1 text-black'>
                                    {transaction.amount}{' '}
                                    {transaction.tokenSymbol}
                                </TableCell>
                                <TableCell className='py-1 text-black'>
                                    ${transaction.usdValue.toLocaleString()}
                                </TableCell>
                                <TableCell className='py-1 text-black'>
                                    {transaction.tokenName}
                                </TableCell>
                                <TableCell className='py-1 text-black'>
                                    {transaction.sender.slice(0, 6)}...
                                    {transaction.sender.slice(-4)}
                                </TableCell>
                                <TableCell className='py-1 text-black'>
                                    {transaction.receiver.slice(0, 6)}...
                                    {transaction.receiver.slice(-4)}
                                </TableCell>
                                <TableCell className='py-1 text-black'>
                                    {transaction.timestamp.toLocaleString()}
                                </TableCell>
                                <TableCell className='py-1 text-black'>
                                    <a
                                        href={`https://etherscan.io/tx/${transaction.transactionHash}`}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-blue-600 hover:underline'
                                    >
                                        {transaction.transactionHash.slice(0, 6)}...
                                        {transaction.transactionHash.slice(-4)}
                                    </a>
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>    
    )
}