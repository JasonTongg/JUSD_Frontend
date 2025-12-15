import { AreaChart } from "@tremor/react";
import { usePublicClient, useWatchContractEvent } from "wagmi";
import { useSelector } from "react-redux";
import { useEffect, useState, useMemo } from "react";
import { decodeAbiParameters, formatEther } from "viem";
import { useReadContract, useAccount } from "wagmi";
import { keccak256, toHex } from "viem";

const dataFormatter = (number) => `$${number.toFixed(6)}`;

const borrowRatedAbi = [
	{
		type: "event",
		name: "BorrowRateUpdated",
		inputs: [
			{
				name: "newRate",
				type: "uint256",
				indexed: false,
				internalType: "uint256",
			},
		],
		anonymous: false,
	},
];

const savingsRateUpdateddAbi = [
	{
		type: "event",
		name: "SavingsRateUpdated",
		inputs: [
			{
				name: "newRate",
				type: "uint256",
				indexed: false,
				internalType: "uint256",
			},
		],
		anonymous: false,
	},
];

const BORROW_RATE_TOPIC = keccak256(toHex("BorrowRateUpdated(uint256)"));
const SAVINGS_RATE_TOPIC = keccak256(toHex("SavingsRateUpdated(uint256)"));

export function RateChart() {
	const { abi } = useSelector((data) => data.data);
	const client = usePublicClient();
	const [borrowRate, setBorrowRate] = useState([]);
	const [savingsRate, setSavingsRate] = useState([]);
	const { isConnected, address } = useAccount();

	const { data: readEthPrice, refetch: refetchEthPrice } = useReadContract({
		query: {
			enabled: isConnected && !!address,
		},
		address: process.env.NEXT_PUBLIC_ORACLE_ADDRESS,
		abi: abi.oracle,
		functionName: "getETHMyUSDPrice",
	});

	useWatchContractEvent({
		address: process.env.NEXT_PUBLIC_ENGINE_ADDRESS,
		abi: borrowRatedAbi,
		eventName: "BorrowRateUpdated",
		onLogs(logs) {
			setBorrowRate((prev) => {
				const seen = new Set(prev.map((l) => `${l.blockNumber}-${l.logIndex}`));

				const fresh = logs.filter(
					(l) => !seen.has(`${l.blockNumber}-${l.logIndex}`)
				);

				return [...prev, ...fresh];
			});
		},
	});

	useWatchContractEvent({
		address: process.env.NEXT_PUBLIC_STAKING_ADDRESS,
		abi: savingsRateUpdateddAbi,
		eventName: "SavingsRateUpdated",
		onLogs(logs) {
			setSavingsRate((prev) => {
				const seen = new Set(prev.map((l) => `${l.blockNumber}-${l.logIndex}`));

				const fresh = logs.filter(
					(l) => !seen.has(`${l.blockNumber}-${l.logIndex}`)
				);

				return [...prev, ...fresh];
			});
		},
	});

	useEffect(() => {
		async function load() {
			const latestBlock = await client.getBlockNumber();
			const fromBlock = latestBlock > 9_000n ? latestBlock - 9_000n : 0n;
			const logs2 = await client.getLogs({
				address: process.env.NEXT_PUBLIC_ENGINE_ADDRESS,
				abi: borrowRatedAbi,
				eventName: "BorrowRateUpdated",
				topics: [BORROW_RATE_TOPIC],
				fromBlock,
			});
			setBorrowRate(logs2);

			const logs3 = await client.getLogs({
				address: process.env.NEXT_PUBLIC_STAKING_ADDRESS,
				abi: savingsRateUpdateddAbi,
				eventName: "SavingsRateUpdated",
				topics: [SAVINGS_RATE_TOPIC],
				fromBlock,
			});
			setSavingsRate(logs3);
		}
		load();
	}, []);

	const decodedBorrowRates = useMemo(() => {
		if (!borrowRate.length) return [];

		return borrowRate
			.filter((log) => log.topics.includes(BORROW_RATE_TOPIC))
			.map((log) => ({
				blockNumber: Number(log.blockNumber),
				value: Number(decodeAbiParameters([{ type: "uint256" }], log.data)[0]),
			}));
	}, [borrowRate]);

	const decodedSavingsRate = useMemo(() => {
		if (!savingsRate.length) return [];

		return savingsRate
			.filter((log) => log.topics.includes(SAVINGS_RATE_TOPIC))
			.map((log) => ({
				blockNumber: Number(log.blockNumber),
				value: Number(decodeAbiParameters([{ type: "uint256" }], log.data)[0]),
			}));
	}, [savingsRate]);

	const priceData = useMemo(() => {
		const map = {};

		const addToMap = (arr, key) => {
			arr.forEach(({ blockNumber, value }) => {
				if (!map[blockNumber]) map[blockNumber] = { blockNumber };
				map[blockNumber][key] = value;
			});
		};

		addToMap(decodedBorrowRates, "BorrowRate");
		addToMap(decodedSavingsRate, "SavingsRate");

		let merged = Object.values(map).sort(
			(a, b) => a.blockNumber - b.blockNumber
		);

		let lastBorrow = 0;
		let lastSavings = 0;

		merged = merged.map((row, i) => {
			lastBorrow = row.BorrowRate ?? lastBorrow;
			lastSavings = row.SavingsRate ?? lastSavings;

			return {
				id: i + 1,
				blockNumber: row.blockNumber,
				BorrowRate: lastBorrow,
				SavingsRate: lastSavings,
			};
		});

		return [
			{
				id: 0,
				blockNumber: 0,
				BorrowRate: 0,
				SavingsRate: 0,
			},
			...merged,
		];
	}, [decodedBorrowRates, decodedSavingsRate]);

	return (
		<AreaChart
			className='h-80 bg-transparent p-4'
			data={priceData}
			index='id'
			categories={["BorrowRate", "SavingsRate"]}
			colors={["amber", "emerald"]}
			valueFormatter={dataFormatter}
			yAxisWidth={90}
			showAnimation={true}
			allowDecimals={true}
			curveType='monotone'
			showGridLines={false}
			showXAxis={false}
			showYAxis={false}
			showLegend={false}
		/>
	);
}
