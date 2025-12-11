import { usePublicClient, useWatchContractEvent } from "wagmi";
import { useSelector } from "react-redux";
import { useEffect, useState, useMemo } from "react";
import { formatEther } from "viem";
import { useReadContract, useAccount } from "wagmi";
import { keccak256, toHex, decodeEventLog } from "viem";

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

	useEffect(() => {
		async function load() {
			const logs = await client.getLogs({
				address: process.env.NEXT_PUBLIC_ENGINE_ADDRESS,
				abi: engineAbi,
				eventName: "CollateralAdded",
				fromBlock: 0n,
			});
			setAddCollateral(logs);
		}
		load();
	}, []);

	useWatchContractEvent({
		address: process.env.NEXT_PUBLIC_ENGINE_ADDRESS,
		abi: engineAbi,
		eventName: "CollateralAdded",
		onLogs(logs) {
			if (logs.length > 0) {
				console.log("New CollateralAdded logs detected:", logs);
				setAddCollateral((prevLogs) => [...logs, ...prevLogs]);
			}
		},
		enabled: isConnected && !!address,
	});

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

					const blockNumber = log.blockNumber ? Number(log.blockNumber) : null;

					return {
						blockNumber: blockNumber,
						user: user,
						amount: Number(formatEther(amount)),
						price: Number(formatEther(price)),
					};
				} catch (error) {
					console.error("Error decoding log:", log, error);
					return null;
				}
			})
			.filter(Boolean);

		const uniqueLogsMap = new Map();

		data.forEach((log) => {
			const userAddress = log.user;

			const currentLogBlockNumber = log.blockNumber || 0;
			const mapLogBlockNumber =
				uniqueLogsMap.get(userAddress)?.blockNumber || -1;

			if (currentLogBlockNumber > mapLogBlockNumber) {
				uniqueLogsMap.set(userAddress, log);
			}
		});

		const uniqueLogsArray = Array.from(uniqueLogsMap.values());

		uniqueLogsArray.sort(
			(a, b) => (b.blockNumber || Infinity) - (a.blockNumber || Infinity)
		);

		console.log(
			"Unique, Decoded, and Sorted Collateral Added Data:",
			uniqueLogsArray
		);

		return uniqueLogsArray;
	}, [addCollateral]);

	return (
		<div>
			<h3>Collateral Added History (Latest per User)</h3>
			{decodeAddCollateral.map((item, index) => (
				<p key={index}>
					User: {item.user.slice(0, 6)}...{item.user.slice(-4)} | Amount:{" "}
					{item.amount.toFixed(4)} | Block:{" "}
					{item.blockNumber ? item.blockNumber : "Pending"}
				</p>
			))}
		</div>
	);
}
