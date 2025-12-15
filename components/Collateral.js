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
		<div className='grid grid-cols-2 sm:grid-cols-5 w-full justify-center items-center justify-items-center mt-3 sm:gap-0 gap-1'>
			<p className='text-center'>
				<span className='font-semibold text-gray-500 sm:hidden inline'>
					Address:{" "}
				</span>
				<span className='font-semibold sm:font-normal'>
					{address.slice(0, 6)}...{address.slice(-4)}
				</span>
			</p>
			<p className='text-center'>
				<span className='font-semibold text-gray-500 sm:hidden inline'>
					Collateral:{" "}
				</span>
				<span className='font-semibold sm:font-normal'>
					{readUserCollateral
						? formatNumber(formatEther(readUserCollateral))
						: 0}
				</span>
			</p>
			<p className='text-center'>
				<span className='font-semibold text-gray-500 sm:hidden inline'>
					Debt:{" "}
				</span>
				<span className='font-semibold sm:font-normal'>
					{readUserDebt ? formatNumber(Number(formatEther(readUserDebt))) : 0}
				</span>
			</p>
			<p className='text-center'>
				<span className='font-semibold text-gray-500 sm:hidden inline'>
					Ratio:{" "}
				</span>
				<span className='font-semibold sm:font-normal'>
					{readCalculatePositionRatio
						? Number(formatEther(readCalculatePositionRatio)) > 99999
							? "99999+"
							: formatNumber(Number(formatEther(readCalculatePositionRatio)))
						: 0}
				</span>
			</p>
			{readIsLiquidatable ? (
				<button
					onClick={handleLiquidate}
					className='bg-red-200 text-red-600 px-3 py-1 rounded-[10px]'
				>
					Liquidate
				</button>
			) : (
				<div className='bg-gray-200 text-gray-600 px-3 py-1 rounded-[10px]'>
					No Action
				</div>
			)}
		</div>
	);
}
