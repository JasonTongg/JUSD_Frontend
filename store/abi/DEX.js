export const dex = [
	{
		type: "constructor",
		inputs: [
			{
				name: "tokenAddr",
				type: "address",
				internalType: "address",
			},
		],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		name: "calculateXInput",
		inputs: [
			{
				name: "yOutput",
				type: "uint256",
				internalType: "uint256",
			},
			{
				name: "xReserves",
				type: "uint256",
				internalType: "uint256",
			},
			{
				name: "yReserves",
				type: "uint256",
				internalType: "uint256",
			},
		],
		outputs: [
			{
				name: "xInput",
				type: "uint256",
				internalType: "uint256",
			},
		],
		stateMutability: "pure",
	},
	{
		type: "function",
		name: "currentPrice",
		inputs: [],
		outputs: [
			{
				name: "_currentPrice",
				type: "uint256",
				internalType: "uint256",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		name: "deposit",
		inputs: [],
		outputs: [
			{
				name: "tokensDeposited",
				type: "uint256",
				internalType: "uint256",
			},
		],
		stateMutability: "payable",
	},
	{
		type: "function",
		name: "init",
		inputs: [
			{
				name: "tokens",
				type: "uint256",
				internalType: "uint256",
			},
		],
		outputs: [
			{
				name: "",
				type: "uint256",
				internalType: "uint256",
			},
		],
		stateMutability: "payable",
	},
	{
		type: "function",
		name: "liquidity",
		inputs: [
			{
				name: "",
				type: "address",
				internalType: "address",
			},
		],
		outputs: [
			{
				name: "",
				type: "uint256",
				internalType: "uint256",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		name: "price",
		inputs: [
			{
				name: "xInput",
				type: "uint256",
				internalType: "uint256",
			},
			{
				name: "xReserves",
				type: "uint256",
				internalType: "uint256",
			},
			{
				name: "yReserves",
				type: "uint256",
				internalType: "uint256",
			},
		],
		outputs: [
			{
				name: "yOutput",
				type: "uint256",
				internalType: "uint256",
			},
		],
		stateMutability: "pure",
	},
	{
		type: "function",
		name: "swap",
		inputs: [
			{
				name: "inputAmount",
				type: "uint256",
				internalType: "uint256",
			},
		],
		outputs: [
			{
				name: "outputAmount",
				type: "uint256",
				internalType: "uint256",
			},
		],
		stateMutability: "payable",
	},
	{
		type: "function",
		name: "totalLiquidity",
		inputs: [],
		outputs: [
			{
				name: "",
				type: "uint256",
				internalType: "uint256",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		name: "withdraw",
		inputs: [
			{
				name: "amount",
				type: "uint256",
				internalType: "uint256",
			},
		],
		outputs: [
			{
				name: "ethAmount",
				type: "uint256",
				internalType: "uint256",
			},
			{
				name: "tokenAmount",
				type: "uint256",
				internalType: "uint256",
			},
		],
		stateMutability: "nonpayable",
	},
	{
		type: "event",
		name: "LiquidityProvided",
		inputs: [
			{
				name: "liquidityProvider",
				type: "address",
				indexed: false,
				internalType: "address",
			},
			{
				name: "liquidityMinted",
				type: "uint256",
				indexed: false,
				internalType: "uint256",
			},
			{
				name: "ethInput",
				type: "uint256",
				indexed: false,
				internalType: "uint256",
			},
			{
				name: "tokensInput",
				type: "uint256",
				indexed: false,
				internalType: "uint256",
			},
		],
		anonymous: false,
	},
	{
		type: "event",
		name: "LiquidityRemoved",
		inputs: [
			{
				name: "liquidityRemover",
				type: "address",
				indexed: false,
				internalType: "address",
			},
			{
				name: "liquidityWithdrawn",
				type: "uint256",
				indexed: false,
				internalType: "uint256",
			},
			{
				name: "tokensOutput",
				type: "uint256",
				indexed: false,
				internalType: "uint256",
			},
			{
				name: "ethOutput",
				type: "uint256",
				indexed: false,
				internalType: "uint256",
			},
		],
		anonymous: false,
	},
	{
		type: "event",
		name: "PriceUpdated",
		inputs: [
			{
				name: "price",
				type: "uint256",
				indexed: false,
				internalType: "uint256",
			},
		],
		anonymous: false,
	},
	{
		type: "event",
		name: "Swap",
		inputs: [
			{
				name: "swapper",
				type: "address",
				indexed: false,
				internalType: "address",
			},
			{
				name: "inputToken",
				type: "address",
				indexed: false,
				internalType: "address",
			},
			{
				name: "inputAmount",
				type: "uint256",
				indexed: false,
				internalType: "uint256",
			},
			{
				name: "outputToken",
				type: "address",
				indexed: false,
				internalType: "address",
			},
			{
				name: "outputAmount",
				type: "uint256",
				indexed: false,
				internalType: "uint256",
			},
		],
		anonymous: false,
	},
];
