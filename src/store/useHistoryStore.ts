import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface Transaction {
  blockNumber: string
  timeStamp: string
  hash: string
  from: string
  to: string
  value: string
  tokenName: string
  tokenSymbol: string
}

interface HistoryState {
  transactions: Transaction[]
  isLoading: boolean
  error: string | null
  fetchTransactions: () => Promise<void>
}

const ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY
const ADDRESS = '0x6982508145454Ce325dDbE47a25d4ec3d2311933'


export const useHistoryStore = create<HistoryState>()(
  devtools(
    (set) => ({
      transactions: [],
      isLoading: false,
      error: null,
      fetchTransactions: async () => {
        try {
          set({ isLoading: true, error: null })
          const response = await fetch(
            `https://api.etherscan.io/api?module=account&action=tokentx&address=${ADDRESS}&startblock=0&endblock=99999999&sort=desc&apikey=${ETHERSCAN_API_KEY}`
          )
      
          const data = await response.json()
      
          if (data.status !== '1') {
            throw new Error(data.message || 'Failed to fetch data from Etherscan')
          }
          

          set({ 
            transactions: data.result,
            isLoading: false,
            error: null
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch transactions',
            isLoading: false 
          })
        }
      },
    })
  )
)
