import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface PriceState {
  prices: Record<string, number>  // contractAddress -> USD price
  isLoading: boolean
  error: string | null
  fetchPrice: (contractAddress: string) => Promise<void>
  fetchPrices: (contractAddresses: string[]) => Promise<void>
}

export const usePriceStore = create<PriceState>()(
  devtools(
    (set, get) => ({
      prices: {},
      isLoading: false,
      error: null,

      fetchPrice: async (contractAddress: string) => {
        try {
          set({ isLoading: true, error: null })
          const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${contractAddress}&vs_currencies=usd`
          )
          
          const data = await response.json()
          
          set((state) => ({
            prices: {
              ...state.prices,
              [contractAddress]: data[contractAddress]?.usd || 0
            },
            isLoading: false,
            error: null
          }))
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch price',
            isLoading: false 
          })
        }
      },

      fetchPrices: async (contractAddresses: string[]) => {
        try {
          set({ isLoading: true, error: null })
          const addresses = contractAddresses.join(',')
          const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${addresses}&vs_currencies=usd`
          )
          
          const data = await response.json()
          
          // Create a new prices object with all the fetched prices
          const newPrices: Record<string, number> = {}
          contractAddresses.forEach((address) => {
            newPrices[address] = data[address.toLowerCase()]?.usd || 0
          })

          set({ 
            prices: newPrices,
            isLoading: false,
            error: null
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch prices',
            isLoading: false 
          })
        }
      },
    })
  )
) 