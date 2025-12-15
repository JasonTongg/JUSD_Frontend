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

const stakeAbi = [
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
];

const STAKED_TOPIC = keccak256(
	toHex("Staked(address,uint256,uint256,uint256)")
);
const WITHDRAW_TOPIC = keccak256(
	toHex("Withdraw(address,uint256,uint256,uint256)")
);

export function StakeHistory({ refetchJusdBalance, refetchEthBalance }) {
	const { abi } = useSelector((data) => data.data);
	const client = usePublicClient();
	const [events, setEvents] = useState([]);
	const { isConnected, address } = useAccount();

	useEffect(() => {
		async function load() {
			const latestBlock = await client.getBlockNumber();
			const fromBlock = latestBlock > 9_000n ? latestBlock - 9_000n : 0n;
			const logs = await client.getLogs({
				address: process.env.NEXT_PUBLIC_STAKING_ADDRESS,
				abi: stakeAbi,
				eventName: "Staked",
				fromBlock,
			});
			setEvents(logs);
		}
		load();
	}, [client]);

	useWatchContractEvent({
		address: process.env.NEXT_PUBLIC_STAKING_ADDRESS,
		abi: stakeAbi,
		eventName: "Staked",
		onLogs(logs) {
			if (logs.length > 0) {
				setEvents((prevLogs) => [...logs, ...prevLogs]);
			}
		},
		enabled: isConnected && !!address,
	});

	const uniqueAddresses = useMemo(() => {
		if (!events.length) return [];

		const uniqueAddressesMap = new Map();

		events
			.filter((item) => item.topics.includes(STAKED_TOPIC))
			.forEach((log) => {
				try {
					const decodedLog = decodeEventLog({
						abi: stakeAbi,
						eventName: "Staked",
						topics: log.topics,
						data: log.data,
					});
					const userAddress = decodedLog.args.user;
					const blockNumber = log.blockNumber ? Number(log.blockNumber) : 0;

					const mapBlockNumber = uniqueAddressesMap.get(userAddress) || -1;

					if (blockNumber > mapBlockNumber) {
						uniqueAddressesMap.set(userAddress, blockNumber);
					}
				} catch (error) {}
			});

		return Array.from(uniqueAddressesMap.keys());
	}, [events]);

	const STAKING_CONTRACT_CONFIG = {
		address: process.env.NEXT_PUBLIC_STAKING_ADDRESS,
		abi: abi.myusdstaking,
	};

	const contracts = useMemo(() => {
		if (uniqueAddresses.length === 0 || !abi.myusdstaking) return [];

		const shareCalls = uniqueAddresses.map((addr) => ({
			...STAKING_CONTRACT_CONFIG,
			functionName: "userShares",
			args: [addr],
		}));

		const exchangeRateCall = {
			...STAKING_CONTRACT_CONFIG,
			functionName: "exchangeRate",
		};

		return [...shareCalls, exchangeRateCall];
	}, [uniqueAddresses, abi]);

	const { data: readData, isLoading: isReading } = useReadContracts({
		contracts: contracts,
		query: {
			enabled: isConnected && contracts.length > 0,
			staleTime: 5000,
		},
	});

	const sortedUserAddresses = useMemo(() => {
		if (!readData || uniqueAddresses.length === 0 || !readData.length)
			return [];

		const numUsers = uniqueAddresses.length;
		const exchangeRateIndex = numUsers;
		const rawExchangeRate = readData[exchangeRateIndex]?.result;

		if (!rawExchangeRate) return [];

		const exchangeRate = Number(formatEther(rawExchangeRate));

		const calculatedStakes = uniqueAddresses.map((address, index) => {
			const rawUserShares = readData[index]?.result;
			let currentAmount = 0;

			if (rawUserShares) {
				const userShares = Number(formatEther(rawUserShares));
				currentAmount = userShares * exchangeRate;
			}

			return {
				user: address,
				amount: currentAmount,
			};
		});

		calculatedStakes.sort((a, b) => b.amount - a.amount);

		return calculatedStakes.map((stake) => stake);
	}, [readData, uniqueAddresses]);

	function formatNumber(num) {
		if (num === null || num === undefined) return "0";

		const n = Number(num);
		const abs = Math.abs(n);

		if (abs >= 1e12) return (n / 1e12).toFixed(2).replace(/\.00$/, "") + "T";
		if (abs >= 1e9) return (n / 1e9).toFixed(2).replace(/\.00$/, "") + "B";
		if (abs >= 1e6) return (n / 1e6).toFixed(2).replace(/\.00$/, "") + "M";
		if (abs >= 1e3) return (n / 1e3).toFixed(2).replace(/\.00$/, "") + "K";

		return n.toFixed(2).toString();
	}

	return (
		<div className='flex flex-col items-center justify-start w-full max-h-[500px] overflow-auto'>
			<div className='grid grid-cols-2 w-full justify-center items-center justify-items-center mt-3 [&>*]:text-gray-400'>
				<p>Address</p>
				<p>Staked (JUSD)</p>
			</div>
			{!isReading &&
				sortedUserAddresses.map((item, index) => (
					<div
						className='grid grid-cols-2 w-full justify-center items-center justify-items-center mt-3'
						key={index}
					>
						<p>
							{item.user.slice(0, 6)}...{item.user.slice(-4)}
						</p>
						<p>{formatNumber(Number(item.amount))}</p>
					</div>
				))}
		</div>
	);
}
