import { AreaChart } from "@tremor/react";
import { usePublicClient, useWatchContractEvent } from "wagmi";
import { useSelector } from "react-redux";
import { useEffect, useState, useMemo } from "react";
import { decodeAbiParameters, formatEther } from "viem";
import { useReadContract, useAccount } from "wagmi";
import { keccak256, toHex } from "viem";

const dataFormatter = (number) => `$${number.toFixed(6)}`;

const priceUpdatedAbi = [
	{
		type: "event",
		name: "PriceUpdated",
		inputs: [{ name: "price", type: "uint256", indexed: false }],
	},
];
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

const PRICE_UPDATED_TOPIC = keccak256(toHex("PriceUpdated(uint256)"));
const BORROW_RATE_TOPIC = keccak256(toHex("BorrowRateUpdated(uint256)"));
const SAVINGS_RATE_TOPIC = keccak256(toHex("SavingsRateUpdated(uint256)"));

export function Chart() {
	const { abi } = useSelector((data) => data.data);
	const client = usePublicClient();
	const [history, setHistory] = useState([]);
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
		address: process.env.NEXT_PUBLIC_DEX_ADDRESS,
		abi: priceUpdatedAbi,
		eventName: "PriceUpdated",
		onLogs(logs) {
			setHistory((prev) => {
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
			const logs = await client.getLogs({
				address: process.env.NEXT_PUBLIC_DEX_ADDRESS,
				abi: priceUpdatedAbi,
				eventName: "BorrowRateUpdated",
				topics: [PRICE_UPDATED_TOPIC],
				fromBlock: 0n,
			});
			setHistory(logs);

			const logs2 = await client.getLogs({
				address: process.env.NEXT_PUBLIC_ENGINE_ADDRESS,
				abi: borrowRatedAbi,
				eventName: "PriceUpdated",
				topics: [BORROW_RATE_TOPIC],
				fromBlock: 0n,
			});
			setBorrowRate(logs2);

			const logs3 = await client.getLogs({
				address: process.env.NEXT_PUBLIC_STAKING_ADDRESS,
				abi: savingsRateUpdateddAbi,
				eventName: "SavingsRateUpdated",
				topics: [SAVINGS_RATE_TOPIC],
				fromBlock: 0n,
			});
			setSavingsRate(logs3);
		}
		load();
	}, []);

	const decodedPrices = useMemo(() => {
		if (!history.length || !readEthPrice) return [];

		return history
			.filter((log) => log.topics.includes(PRICE_UPDATED_TOPIC))
			.map((log) => ({
				blockNumber: Number(log.blockNumber),
				value:
					Number(
						formatEther(decodeAbiParameters([{ type: "uint256" }], log.data)[0])
					) / Number(formatEther(readEthPrice)),
			}));
	}, [history, readEthPrice]);

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

		addToMap(decodedPrices, "Price");
		addToMap(decodedBorrowRates, "BorrowRate");
		addToMap(decodedSavingsRate, "SavingsRate");

		let merged = Object.values(map).sort(
			(a, b) => a.blockNumber - b.blockNumber
		);

		let lastPrice = 1; // baseline
		let lastBorrow = 0; // baseline
		let lastSavings = 0; // baseline

		merged = merged.map((row, i) => {
			lastPrice = row.Price ?? lastPrice;
			lastBorrow = row.BorrowRate ?? lastBorrow;
			lastSavings = row.SavingsRate ?? lastSavings;

			return {
				id: i + 1,
				blockNumber: row.blockNumber,
				Price: lastPrice,
				BorrowRate: lastBorrow,
				SavingsRate: lastSavings,
			};
		});

		return [
			{
				id: 0,
				blockNumber: 0,
				Price: 1,
				BorrowRate: 0,
				SavingsRate: 0,
			},
			...merged,
		];
	}, [decodedPrices, decodedBorrowRates, decodedSavingsRate]);

	const { yMin, yMax } = useMemo(() => {
		if (!priceData.length) return { yMin: 0, yMax: 1 };

		const prices = priceData.map((p) => p.Price);
		const min = Math.min(...prices);
		const max = Math.max(...prices);
		const padding = (max - min) * 0.1 || 0.0001;

		console.log("padding");
		console.log(min - padding);
		console.log(max + padding);

		return {
			yMin: min - padding,
			yMax: max + padding,
		};
	}, [priceData]);

	useEffect(() => {
		console.log(priceData);
	}, [priceData]);

	return (
		<AreaChart
			className='h-80 bg-transparent p-4'
			data={priceData}
			index='id'
			categories={["Price", "BorrowRate", "SavingsRate"]}
			colors={["indigo", "amber", "emerald"]}
			valueFormatter={dataFormatter}
			yAxisWidth={90}
			showAnimation={true}
			// minValue={yMin}
			// maxValue={yMax}
			allowDecimals={true}
			// showGridLines={false}
			curveType='monotone'
		/>
	);
}
