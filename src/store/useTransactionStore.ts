import { create } from 'zustand'
import Moralis from 'moralis'
import { EvmChain } from "@moralisweb3/common-evm-utils"
import { Transaction } from '@/types/types'

interface TransactionStore {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  fetchTransactions: (address: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: [],
  isLoading: false,
  error: null,
  fetchTransactions: async (address: string = "0x6982508145454ce325ddbe47a25d4ec3d2311933") => {
    try {
      set({ isLoading: true, error: null });
      

      if (!Moralis.Core.isStarted) {
        await Moralis.start({
          apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
        });
      }

      const response = await Moralis.EvmApi.token.getTokenTransfers({
        address,
        chain: EvmChain.ETHEREUM,
      });

      const formattedTransactions = response.toJSON().result.map((tx: any) => ({
        id: tx.transaction_hash,
        amount: parseFloat(tx.value_decimal),
        tokenSymbol: tx.token_symbol,
        sender: tx.from_address,
        receiver: tx.to_address,
        timestamp: new Date(tx.block_timestamp),
        transactionHash: tx.transaction_hash,
        yPosition: 0,
        tokenName: tx.token_name,
        usdValue: 0,
      }));

      set({ transactions: formattedTransactions, isLoading: false });
    } catch (error) {
      console.log(error)
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
