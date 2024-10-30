import { create } from 'zustand'
import Moralis from 'moralis'
import { EvmChain } from "@moralisweb3/common-evm-utils"
import { TokenTransferDetails, Transaction } from '@/types/types'

interface TransactionStore {
  transactions: TokenTransferDetails[];
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
        token_name: tx.token_name,
        token_symbol: tx.token_symbol,
        token_logo: tx.token_logo,
        token_decimals: tx.token_decimals,
        from_address_entity: tx.from_address_entity,
        from_address_entity_logo: tx.from_address_entity_logo,
        from_address: tx.from_address,
        from_address_label: tx.from_address_label,
        to_address_entity: tx.to_address_entity,
        to_address_entity_logo: tx.to_address_entity_logo,
        to_address: tx.to_address,
        to_address_label: tx.to_address_label,
        address: tx.address,
        block_hash: tx.block_hash,
        block_number: tx.block_number,
        block_timestamp: tx.block_timestamp,
        transaction_hash: tx.transaction_hash,
        transaction_index: tx.transaction_index,
        log_index: tx.log_index,
        value: tx.value,
        possible_spam: tx.possible_spam,
        value_decimal: tx.value_decimal,
        verified_contract: tx.verified_contract,
        security_score: tx.security_score
      }));

      set({ transactions: formattedTransactions, isLoading: false });
    } catch (error) {
      console.log(error)
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
