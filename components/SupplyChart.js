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
];

const ADDCOLLATERAL_TOPIC = keccak256(
	toHex("CollateralAdded(address,uint256,uint256)")
);

export function SupplyChart() {
	const { abi } = useSelector((data) => data.data);
	const client = usePublicClient();
	const [addCollateral, setAddCollateral] = useState([]);
	const { isConnected, address } = useAccount();

	const { data: readEthPrice, refetch: refetchEthPrice } = useReadContract({
		query: {
			enabled: isConnected && !!address,
		},
		address: process.env.NEXT_PUBLIC_ORACLE_ADDRESS,
		abi: abi.oracle,
		functionName: "getETHMyUSDPrice",
	});

	useEffect(() => {
		async function load() {
			const logs = await client.getLogs({
				address: process.env.NEXT_PUBLIC_ENGINE_ADDRESS,
				abi: engineAbi,
				eventName: "CollateralAdded",
				// topics: [ADDCOLLATERAL_TOPIC],
				fromBlock: 0n,
			});
			setAddCollateral(logs);
		}
		load();
	}, []);

	const decodeAddCollateral = useMemo(() => {
		if (!addCollateral.length) return [];

		const data = addCollateral
			.filter((item) => item.topics.includes(ADDCOLLATERAL_TOPIC))
			.map((log) => {
				try {
					const decodedLog = decodeEventLog({
						abi: engineAbi,
						eventName: "CollateralAdded",
						topics: log.topics,
						data: log.data,
					});

					const { user, amount, price } = decodedLog.args;

					const formattedAmount = formatEther(amount);

					return {
						blockNumber: Number(log.blockNumber),
						user: user,
						amount: Number(formattedAmount),
						price: Number(formatEther(price)),
					};
				} catch (error) {
					console.error("Error decoding log:", log, error);
					return null;
				}
			})
			.filter(Boolean);

		console.log("data: ", data);
		const uniqueLogsMap = new Map();

		data.forEach((log) => {
			const userAddress = log.user;
			console.log("Each Data: ", log);

			if (
				!uniqueLogsMap.has(userAddress) ||
				log.blockNumber > uniqueLogsMap.get(userAddress).blockNumber
			) {
				// Store or update the map with the newer log for this user
				uniqueLogsMap.set(userAddress, log);
			}
		});

		console.log("Uniq Log: ", uniqueLogsMap);

		// --- 3. Convert Map values back to an Array and Sort ---
		const uniqueLogsArray = Array.from(uniqueLogsMap.values());

		// Sort: BlockNumber descending (highest block number / newest first)
		uniqueLogsArray.sort((a, b) => b.blockNumber - a.blockNumber);

		console.log(
			"Unique, Decoded, and Sorted Collateral Added Data:",
			uniqueLogsArray
		);

		return uniqueLogsArray;
	}, [addCollateral]);

	return (
		<div>
			{decodeAddCollateral.map((item, index) => (
				<p key={index}>
					{item.user} - {item.amount}
				</p>
			))}
		</div>
	);
}
