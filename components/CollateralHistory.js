import {
	usePublicClient,
	useWatchContractEvent,
	useReadContracts,
} from "wagmi";
import { useSelector } from "react-redux";
import { useEffect, useState, useMemo } from "react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { keccak256, toHex, decodeEventLog } from "viem";
import { Collateral } from "./Collateral";

const engineAbi = [
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: "address", name: "user", type: "address" },
			{
				indexed: true,
				internalType: "uint256",
				name: "amount",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "price",
				type: "uint256",
			},
		],
		name: "CollateralAdded",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "withdrawer",
				type: "address",
			},
			{
				indexed: true,
				internalType: "uint256",
				name: "amount",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "price",
				type: "uint256",
			},
		],
		name: "CollateralWithdrawn",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: "address", name: "user", type: "address" },
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
			{ indexed: true, internalType: "address", name: "user", type: "address" },
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

const COLLATERAL_ADDED_TOPIC = keccak256(
	toHex("CollateralAdded(address,uint256,uint256)")
);
const COLLATERAL_WITHDRAWN_TOPIC = keccak256(
	toHex("CollateralWithdrawn(address,uint256,uint256)")
);
const DEBT_MINTED_TOPIC = keccak256(
	toHex("DebtSharesMinted(address,uint256,uint256,uint256)")
);
const DEBT_BURNED_TOPIC = keccak256(
	toHex("DebtSharesBurned(address,uint256,uint256,uint256)")
);

const ALL_POSITION_EVENTS = [
	"CollateralAdded",
	"CollateralWithdrawn",
	"DebtSharesMinted",
	"DebtSharesBurned",
];

const ALL_POSITION_TOPICS = [
	COLLATERAL_ADDED_TOPIC,
	COLLATERAL_WITHDRAWN_TOPIC,
	DEBT_MINTED_TOPIC,
	DEBT_BURNED_TOPIC,
];

export function CollateralHistory({
	refetchJusdBalance,
	refetchEthBalance,
	refetchCalculatePositionRatio,
	refetchAllIndex
}) {
	const { abi } = useSelector((data) => data.data);
	const client = usePublicClient();
	const [positionEvents, setPositionEvents] = useState([]);
	const { isConnected, address } = useAccount();

	useEffect(() => {
		async function load() {
			const allLogs = [];
			for (const eventName of ALL_POSITION_EVENTS) {
				try {
					const latestBlock = await client.getBlockNumber();
					const fromBlock = latestBlock > 9_000n ? latestBlock - 9_000n : 0n;
					const logs = await client.getLogs({
						address: process.env.NEXT_PUBLIC_ENGINE_ADDRESS,
						abi: engineAbi,
						eventName: eventName,
						fromBlock,
					});
					allLogs.push(...logs);
				} catch (e) {
					console.error(`Error fetching logs for ${eventName}:`, e);
				}
			}
			allLogs.sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber));
			setPositionEvents(allLogs);
		}
		load();
	}, [client]);

	ALL_POSITION_EVENTS.forEach((eventName) => {
		useWatchContractEvent({
			address: process.env.NEXT_PUBLIC_ENGINE_ADDRESS,
			abi: engineAbi,
			eventName: eventName,
			onLogs(logs) {
				if (logs.length > 0) {
					setPositionEvents((prevLogs) => [...logs, ...prevLogs]);
				}
			},
			enabled: isConnected && !!address,
		});
	});

	const uniqueAddresses = useMemo(() => {
		if (!positionEvents.length) return [];

		const uniqueAddressesMap = new Map();
		positionEvents
			.filter((log) =>
				ALL_POSITION_TOPICS.some((topic) => log.topics.includes(topic))
			)
			.forEach((log) => {
				if (log.topics.length > 1) {
					const paddedAddressTopic = log.topics[1];
					const canonicalAddress = "0x" + paddedAddressTopic.slice(26);
					const blockNumber = log.blockNumber ? Number(log.blockNumber) : 0;
					const mapBlockNumber = uniqueAddressesMap.get(canonicalAddress) || -1;

					if (blockNumber > mapBlockNumber) {
						uniqueAddressesMap.set(canonicalAddress, blockNumber);
					}
				}
			});

		return Array.from(uniqueAddressesMap.keys());
	}, [positionEvents]);

	const ENGINE_CONTRACT_CONFIG = {
		address: process.env.NEXT_PUBLIC_ENGINE_ADDRESS,
		abi: abi.myusdengine,
	};

	const contracts = useMemo(() => {
		if (uniqueAddresses.length === 0 || !abi.myusdengine) return [];

		const calls = uniqueAddresses.flatMap((addr) => [
			{
				...ENGINE_CONTRACT_CONFIG,
				functionName: "getCurrentDebtValue",
				args: [addr],
			},
			{
				...ENGINE_CONTRACT_CONFIG,
				functionName: "isLiquidatable",
				args: [addr],
			},
		]);

		return calls;
	}, [uniqueAddresses, abi]);

	const {
		data: readData,
		isLoading: isReading,
		refetch: refetchPositions,
	} = useReadContracts({
		contracts: contracts,
		query: {
			enabled: isConnected && contracts.length > 0,
			staleTime: 5000,
		},
	});

	useEffect(() => {
		if (refetchPositions && positionEvents.length > 0) {
			refetchPositions();
		}
	}, [positionEvents.length, refetchPositions]);

	const sortedUserAddresses = useMemo(() => {
		if (!readData || uniqueAddresses.length === 0) return [];

		const calculatedPositions = uniqueAddresses.map((address, index) => {
			const debtIndex = index * 2;
			const liquidatableIndex = index * 2 + 1;

			const rawUserDebt = readData[debtIndex]?.result;
			const isLiquidatable = readData[liquidatableIndex]?.result;

			console.log("read data");
			console.log(readData);

			let currentDebtAmount = 0;
			if (rawUserDebt) {
				currentDebtAmount = Number(formatEther(rawUserDebt));
			}

			return {
				user: address,
				debt: currentDebtAmount,
				isLiquidatable: isLiquidatable || false,
			};
		});

		calculatedPositions.sort((a, b) => {
			const liquidatableDiff = b.isLiquidatable - a.isLiquidatable;

			if (liquidatableDiff !== 0) {
				return liquidatableDiff;
			}
			return b.debt - a.debt;
		});

		console.log("position");
		console.log(calculatedPositions);
		return calculatedPositions.map((position) => position.user);
	}, [readData, uniqueAddresses]);

	const positionEventsLength = positionEvents.length;

	return (
		<div className='flex flex-col items-center justify-start w-full max-h-[500px] overflow-auto sm:gap-0 gap-4'>
			<div className='hidden sm:grid grid-cols-5 w-full justify-center items-center justify-items-center mt-3 [&>*]:text-gray-400 '>
				<p>Address</p>
				<p>Collateral</p>
				<p>Debt</p>
				<p>Ratio</p>
				<p>Action</p>
			</div>
			{!isReading &&
				sortedUserAddresses
					.filter((_, index) => index < 30)
					.map((address) => (
						<Collateral
							key={address}
							address={address}
							refetchJusdBalance={refetchJusdBalance}
							refetchEthBalance={refetchEthBalance}
							positionEventCount={positionEventsLength}
							refetchAllPositions={refetchPositions}
							refetchCalculatePositionRatio={refetchCalculatePositionRatio}
							refetchAllIndex={refetchAllIndex}
						/>
					))}
		</div>
	);
}
