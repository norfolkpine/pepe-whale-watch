export interface ERC20Transfer {
	transactionHash: string
	from: string
	to: string
	value: string
	tokenName: string
	tokenSymbol: string
	valueWithDecimals: string
	contractAddress?: string
}

export interface TransactionWebhookData {
	confirmed: boolean
	chainId: string
	streamId: string
	tag: string
	block: {
		number: string
		hash: string
		timestamp: string
	}
	erc20Transfers: ERC20Transfer[]
}

export interface Transaction {
  id: number;
  amount: number;
  timestamp: Date;
  sender: string;
  receiver: string;
  tokenName: string;
  tokenSymbol: string;
  usdValue: number;
  transactionHash: string;
  yPosition: number;
}