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
  senderName?: string;
  receiver: string;
  receiverName?: string;
  tokenName: string;
  tokenSymbol: string;
  usdValue: number;
  transactionHash: string;
  yPosition: number;
}

export interface TokenTransferDetails {
  token_name: string;
  token_symbol: string;
  token_logo: string;
  token_decimals: string;
  from_address_entity: string | null;
  from_address_entity_logo: string | null;
  from_address: string;
  from_address_label: string | null;
  to_address_entity: string | null;
  to_address_entity_logo: string | null;
  to_address: string;
  to_address_label: string | null;
  address: string;
  block_hash: string;
  block_number: string;
  block_timestamp: string;
  transaction_hash: string;
  transaction_index: number;
  log_index: number;
  value: string;
  possible_spam: boolean;
  value_decimal: string;
  verified_contract: boolean;
  security_score: number;
}

export type AddressData = {
  address: string;
  nameTag: string;
};