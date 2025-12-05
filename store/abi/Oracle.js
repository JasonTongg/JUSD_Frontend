export const oracle = [
	{
		type: "constructor",
		inputs: [
			{
				name: "_dexAddress",
				type: "address",
				internalType: "address",
			},
			{
				name: "_defaultPrice",
				type: "uint256",
				internalType: "uint256",
			},
		],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		name: "defaultPrice",
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
		name: "dexAddress",
		inputs: [],
		outputs: [
			{
				name: "",
				type: "address",
				internalType: "contract DEX",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		name: "getETHMyUSDPrice",
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
		name: "getETHUSDPrice",
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
];
