import { usePublicClient, useWatchContractEvent } from "wagmi";
import { useSelector } from "react-redux";
import { useEffect, useState, useMemo } from "react";
import { formatEther } from "viem";
import { useReadContract, useAccount, useWriteContract } from "wagmi";
import { keccak256, toHex, decodeEventLog } from "viem";
import { toast } from "react-toastify";

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

export function Collateral({
	address,
	block,
	refetchJusdBalance,
	refetchEthBalance,
	positionEventCount,
	refetchAllPositions,
}) {
	const { abi } = useSelector((data) => data.data);
	const client = usePublicClient();
	const [addCollateral, setAddCollateral] = useState([]);
	const { isConnected } = useAccount();

	const {
		data: readUserCollateral,
		isPending: readUserCollateralPending,
		error: readUserCollateralError,
		refetch: refetchUserCollateral,
	} = useReadContract({
		query: {
			enabled: isConnected && !!address,
		},
		address: process.env.NEXT_PUBLIC_ENGINE_ADDRESS,
		abi: abi.myusdengine,
		functionName: "s_userCollateral",
		args: [address],
	});

	const {
		data: readUserDebt,
		isPending: readUserDebtPending,
		error: readUserDebtError,
		refetch: refetchUserDebt,
	} = useReadContract({
		query: {
			enabled: isConnected && !!address,
		},
		address: process.env.NEXT_PUBLIC_ENGINE_ADDRESS,
		abi: abi.myusdengine,
		functionName: "getCurrentDebtValue",
		args: [address],
	});

	const {
		data: readIsLiquidatable,
		isPending: readIsLiquidatablePending,
		error: readIsLiquidatableError,
		refetch: refetchIsLiquidatable,
	} = useReadContract({
		query: {
			enabled: isConnected && !!address,
		},
		address: process.env.NEXT_PUBLIC_ENGINE_ADDRESS,
		abi: abi.myusdengine,
		functionName: "isLiquidatable",
		args: [address],
	});

	const {
		data: readCalculatePositionRatio,
		isPending: readCalculatePositionRatioPending,
		error: readCalculatePositionRatioError,
		refetch: refetchCalculatePositionRatio,
	} = useReadContract({
		query: {
			enabled: isConnected && !!address,
		},
		address: process.env.NEXT_PUBLIC_ENGINE_ADDRESS,
		abi: abi.myusdengine,
		functionName: "calculatePositionRatio",
		args: [address],
	});

	const {
		writeContractAsync: writeApprove,
		isPending: approvePending,
		data: approveHash,
		error: approveError,
	} = useWriteContract();

	const {
		writeContractAsync: writeLiquidate,
		isPending: liquidatePending,
		data: liquidateHash,
		error: liquidateError,
	} = useWriteContract();

	const handleLiquidate = async () => {
		if (!address) return;

		try {
			toast.info("Submitting Transaction...");
			await writeApprove({
				address: process.env.NEXT_PUBLIC_STABLECOIN_ADDRESS,
				abi: abi.myusd,
				functionName: "approve",
				args: [process.env.NEXT_PUBLIC_ENGINE_ADDRESS, readUserDebt],
			});

			await writeLiquidate({
				address: process.env.NEXT_PUBLIC_ENGINE_ADDRESS,
				abi: abi.myusdengine,
				functionName: "liquidate",
				args: [address],
			});
			toast.success("Transaction Success...");
		} catch (e) {
			toast.error(
				e.shortMessage || e.message || e.cause.shortMessage || e.cause.message
			);
		}
		refetchUserDebt();
		refetchIsLiquidatable();
		refetchCalculatePositionRatio();
		refetchUserCollateral();
		refetchJusdBalance();
		refetchEthBalance();
		refetchAllPositions();
	};

	useEffect(() => {
		refetchUserDebt();
		refetchIsLiquidatable();
	}, [readCalculatePositionRatio]);

	useEffect(() => {
		if (positionEventCount > 0) {
			refetchUserCollateral();
			refetchUserDebt();
			refetchIsLiquidatable();
			refetchCalculatePositionRatio();
		}
	}, [
		positionEventCount,
		refetchUserCollateral,
		refetchUserDebt,
		refetchIsLiquidatable,
		refetchCalculatePositionRatio,
	]);

	return (
		<div className='w-full h-full p-3'>
			<p>
				User: {address.slice(0, 6)}...{address.slice(-4)}
			</p>
			<p>Amount: {readUserCollateral ? formatEther(readUserCollateral) : 0}</p>
			<p>Debt: {readUserDebt ? Number(formatEther(readUserDebt)) : 0}</p>
			<p>
				Ratio:{" "}
				{readCalculatePositionRatio
					? Number(formatEther(readCalculatePositionRatio))
					: 0}
			</p>
			<p>Block: {block ? block : "Pending"}</p>
			{readIsLiquidatable && (
				<button onClick={handleLiquidate}>Liquidate</button>
			)}
		</div>
	);
}
