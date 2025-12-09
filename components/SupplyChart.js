import { AreaChart } from "@tremor/react";
import { usePublicClient, useWatchContractEvent } from "wagmi";
import { useSelector } from "react-redux";
import { useEffect, useState, useMemo } from "react";
import { decodeAbiParameters, formatEther } from "viem";
import { useReadContract, useAccount } from "wagmi";
import { keccak256, toHex, decodeEventLog } from "viem";

const dataFormatter = (number) => `$${number.toFixed(6)}`;

const engineAbi = [
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "user",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "shares",
				type: "uint256",
			},
			{
				indexed: true,
				internalType: "uint256",
				name: "totalSupply",
				type: "uint256",
			},
		],
		name: "DebtSharesBurned",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "user",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "shares",
				type: "uint256",
			},
			{
				indexed: true,
				internalType: "uint256",
				name: "totalSupply",
				type: "uint256",
			},
		],
		name: "DebtSharesMinted",
		type: "event",
	},
];

const stackingAbi = [
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "user",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "shares",
				type: "uint256",
			},
			{
				indexed: true,
				internalType: "uint256",
				name: "totalStake",
				type: "uint256",
			},
		],
		name: "Staked",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "user",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "shares",
				type: "uint256",
			},
			{
				indexed: true,
				internalType: "uint256",
				name: "totalStake",
				type: "uint256",
			},
		],
		name: "Withdrawn",
		type: "event",
	},
];

const swapAbi = [
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address",
				name: "swapper",
				type: "address",
			},
			{
				indexed: false,
				internalType: "address",
				name: "inputToken",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "inputAmount",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "address",
				name: "outputToken",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "outputAmount",
				type: "uint256",
			},
			{
				indexed: true,
				internalType: "uint256",
				name: "totalSupply",
				type: "uint256",
			},
		],
		name: "Swap",
		type: "event",
	},
];

const DEBTSHARESMINTED_TOPIC = keccak256(
	toHex(
		"DebtSharesMinted(address indexed user, uint256 amount, uint256 shares, uint256 indexed totalSupply)"
	)
);
const DEBTSHARESBURNED_TOPIC = keccak256(
	toHex(
		"DebtSharesBurned(address indexed user, uint256 amount, uint256 shares, uint256 indexed totalSupply)"
	)
);
const STACKED_TOPIC = keccak256(
	toHex(
		"Staked(address indexed user, uint256 amount, uint256 shares, uint256 indexed totalStake)"
	)
);
const WITHDRAW_TOPIC = keccak256(
	toHex(
		"Withdrawn(address indexed user, uint256 amount, uint256 shares, uint256 indexed totalStake)"
	)
);
const SWAP_TOPIC = keccak256(
	toHex(`Swap(
        address swapper,
        address inputToken,
        uint256 inputAmount,
        address outputToken,
        uint256 outputAmount,
        uint256 indexed totalSupply
    )`)
);

export function SupplyChart() {
	const { abi } = useSelector((data) => data.data);
	const client = usePublicClient();
	const [minted, setMinted] = useState([]);
	const [burned, setBurned] = useState([]);
	const [staked, setStaked] = useState([]);
	const [withdrawn, setWithdrawn] = useState([]);
	const [swap, setSwap] = useState([]);
	const { isConnected, address } = useAccount();

	const { data: readEthPrice, refetch: refetchEthPrice } = useReadContract({
		query: {
			enabled: isConnected && !!address,
		},
		address: process.env.NEXT_PUBLIC_ORACLE_ADDRESS,
		abi: abi.oracle,
		functionName: "getETHMyUSDPrice",
	});

	const { data: readTotalSupply, refetch: refetchTotalSupply } =
		useReadContract({
			query: {
				enabled: isConnected && !!address,
			},
			address: process.env.NEXT_PUBLIC_STABLECOIN_ADDRESS,
			abi: abi.myusd,
			functionName: "totalSupply",
		});

	useEffect(() => {
		if (!readTotalSupply) return;

		console.log("readTotalSupply");
		console.log(formatEther(BigInt(readTotalSupply)));
	}, [readTotalSupply]);

	useEffect(() => {
		async function load() {
			const logs = await client.getLogs({
				address: process.env.NEXT_PUBLIC_ENGINE_ADDRESS,
				abi: engineAbi,
				eventName: "DebtSharesMinted",
				topics: [DEBTSHARESMINTED_TOPIC],
				fromBlock: 0n,
			});
			setMinted(logs);

			const logs2 = await client.getLogs({
				address: process.env.NEXT_PUBLIC_ENGINE_ADDRESS,
				abi: engineAbi,
				eventName: "DebtSharesBurned",
				topics: [DEBTSHARESBURNED_TOPIC],
				fromBlock: 0n,
			});
			setBurned(logs2);

			const logs3 = await client.getLogs({
				address: process.env.NEXT_PUBLIC_STAKING_ADDRESS,
				abi: stackingAbi,
				eventName: "Staked",
				topics: [STACKED_TOPIC],
				fromBlock: 0n,
			});
			setStaked(logs3);

			const logs4 = await client.getLogs({
				address: process.env.NEXT_PUBLIC_STAKING_ADDRESS,
				abi: stackingAbi,
				eventName: "Withdrawn",
				topics: [WITHDRAW_TOPIC],
				fromBlock: 0n,
			});
			setWithdrawn(logs4);

			const logs5 = await client.getLogs({
				address: process.env.NEXT_PUBLIC_DEX_ADDRESS,
				abi: swapAbi,
				eventName: "Swap",
				topics: [SWAP_TOPIC],
				fromBlock: 0n,
			});
			setSwap(logs5);

			console.log("Logs");
			console.log(DEBTSHARESMINTED_TOPIC);
			console.log(logs);
			console.log(DEBTSHARESBURNED_TOPIC);
			console.log(logs2);
			console.log(STACKED_TOPIC);
			console.log(logs3);
			console.log(WITHDRAW_TOPIC);
			console.log(logs4);
			console.log(SWAP_TOPIC);
			console.log(logs5);
		}
		load();
	}, []);

	const decodeMinted = useMemo(() => {
		if (!minted.length) return [];

		return minted
			.map((log) => {
				if (log.data === "0x") return null;

				return {
					blockNumber: Number(log.blockNumber),
					value: Number(
						formatEther(decodeAbiParameters([{ type: "uint256" }], log.data)[0])
					),
				};
			})
			.filter(Boolean);
	}, [minted]);

	const decodedBurned = useMemo(() => {
		if (!burned.length) return [];

		return burned
			.map((log) => {
				if (log.data === "0x") return null;

				return {
					blockNumber: Number(log.blockNumber),
					value: Number(
						formatEther(decodeAbiParameters([{ type: "uint256" }], log.data)[0])
					),
				};
			})
			.filter(Boolean);
	}, [burned]);

	const decodedStacked = useMemo(() => {
		if (!staked.length) return [];

		return staked
			.map((log) => {
				if (log.data === "0x") return null;

				return {
					blockNumber: Number(log.blockNumber),
					value: Number(
						formatEther(decodeAbiParameters([{ type: "uint256" }], log.data)[0])
					),
				};
			})
			.filter(Boolean);
	}, [staked]);

	const decodedWithdraw = useMemo(() => {
		if (!withdrawn.length) return [];

		return withdrawn
			.map((log) => {
				if (log.data === "0x") return null;

				return {
					blockNumber: Number(log.blockNumber),
					value: Number(
						formatEther(decodeAbiParameters([{ type: "uint256" }], log.data)[0])
					),
				};
			})
			.filter(Boolean);
	}, [withdrawn]);

	const decodedSwap = useMemo(() => {
		if (!swap.length) return [];

		return swap
			.map((log) => {
				if (log.data === "0x") return null;

				return {
					blockNumber: Number(log.blockNumber),
					value: Number(
						formatEther(decodeAbiParameters([{ type: "uint256" }], log.data)[0])
					),
				};
			})
			.filter(Boolean);
	}, [swap]);

	const priceData = useMemo(() => {
		const map = {};

		const addToMap = (arr, key) => {
			arr.forEach(({ blockNumber, value }) => {
				if (!map[blockNumber]) map[blockNumber] = { blockNumber };
				map[blockNumber][key] = value;
			});
		};

		addToMap(decodeMinted, "Minted");
		addToMap(decodedBurned, "Burned");
		addToMap(decodedStacked, "Stacked");
		addToMap(decodedWithdraw, "Withdraw");
		addToMap(decodedSwap, "Swap");

		console.log("Map: ", map);

		let merged = Object.values(map).sort(
			(a, b) => a.blockNumber - b.blockNumber
		);

		let lastTotalSupply = 0;
		let lastTotalStake = 0;

		merged = merged.map((row, i) => {
			lastTotalSupply = (row.Minted || row.Burned) ?? lastTotalSupply;
			lastTotalStake = (row.Stacked || row.Withdraw) ?? lastTotalStake;

			return {
				id: i + 1,
				blockNumber: row.blockNumber,
				TotalSupply: lastTotalSupply,
				TotalStake: lastTotalStake,
			};
		});

		console.log("Merge: ", merged);

		return [
			{
				id: 0,
				blockNumber: 0,
				TotalSupply: 0,
				TotalStake: 0,
			},
			...merged,
		];
	}, [
		decodeMinted,
		decodedBurned,
		decodedStacked,
		decodedWithdraw,
		decodedSwap,
	]);

	return (
		<>
			<AreaChart
				className='h-80 bg-transparent p-4'
				data={priceData}
				index='id'
				categories={["TotalSupply"]}
				colors={["indigo"]}
				valueFormatter={dataFormatter}
				yAxisWidth={90}
				showAnimation={true}
				allowDecimals={true}
				curveType='monotone'
			/>
			<AreaChart
				className='h-80 bg-transparent p-4'
				data={priceData}
				index='id'
				categories={["TotalStake"]}
				colors={["amber"]}
				valueFormatter={dataFormatter}
				yAxisWidth={90}
				showAnimation={true}
				allowDecimals={true}
				curveType='monotone'
			/>
		</>
	);
}
