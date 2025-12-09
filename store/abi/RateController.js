export const ratecontroller = [
	{
		inputs: [
			{
				internalType: "address",
				name: "_myUSD",
				type: "address",
			},
			{
				internalType: "address",
				name: "_staking",
				type: "address",
			},
		],
		stateMutability: "nonpayable",
		type: "constructor",
	},
	{
		inputs: [],
		name: "Engine__InvalidBorrowRate",
		type: "error",
	},
	{
		inputs: [],
		name: "Staking__InvalidSavingsRate",
		type: "error",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "newRate",
				type: "uint256",
			},
		],
		name: "setBorrowRate",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "newRate",
				type: "uint256",
			},
		],
		name: "setSavingsRate",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
];
