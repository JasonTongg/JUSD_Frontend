import React, { useEffect, useState } from "react";
import { Chart } from "@/components/Chart";
import {
	useAccount,
	useReadContract,
	useWriteContract,
	useBalance,
} from "wagmi";
import { useSelector } from "react-redux";
import { parseEther, formatEther } from "viem";
import { toast } from "react-toastify";

export default function Index() {
	const { isConnected, address } = useAccount();
	const userBalance = useBalance({
		address,
	});
	const { abi } = useSelector((data) => data.data);
	const [newBorrowRate, setNewBorrowRate] = useState(0);
	const [newSavingsRate, setNewSavingsRate] = useState(0);
	const [inputMyUsd, setInputMyUsd] = useState("0");
	const [inputEth, setInputEth] = useState("0");
	const [addCollateralAmount, setAddCollateralAmount] = useState(0);
	const [removeCollateralAmount, setRemoveCollateralAmount] = useState(0);
	const [mintAmount, setMintAmount] = useState(0);
	const [repayAmount, setRepayAmount] = useState(0);
	const [stakeAmount, setStakeAmount] = useState(0);

	const {
		data: readJusdBalance,
		isPending: readJusdBalancePending,
		error: readJusdBalanceError,
		refetch: refetchJusdBalance,
	} = useReadContract({
		query: {
			enabled: isConnected && !!address,
		},
		address: process.env.NEXT_PUBLIC_STABLECOIN_ADDRESS,
		abi: abi.myusd,
		functionName: "balanceOf",
		args: [address],
	});

	const {
		data: readStackingExchangeRate,
		isPending: readStackingExchangeRatePending,
		error: readStackingExchangeRateError,
		refetch: refetchStackingExchangeRate,
	} = useReadContract({
		query: {
			enabled: isConnected && !!address,
		},
		address: process.env.NEXT_PUBLIC_STAKING_ADDRESS,
		abi: abi.myusdstaking,
		functionName: "exchangeRate",
	});

	const {
		data: readStackingUserShares,
		isPending: readStackingUserSharesPending,
		error: readStackingUserSharesError,
		refetch: refetchStackingUserShares,
	} = useReadContract({
		query: {
			enabled: isConnected && !!address,
		},
		address: process.env.NEXT_PUBLIC_STAKING_ADDRESS,
		abi: abi.myusdstaking,
		functionName: "userShares",
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
		data: readUserDebtShares,
		isPending: readUserDebtSharesPending,
		error: readUserDebtSharesError,
		refetch: refetchUserDebtShares,
	} = useReadContract({
		query: {
			enabled: isConnected && !!address,
		},
		address: process.env.NEXT_PUBLIC_ENGINE_ADDRESS,
		abi: abi.myusdengine,
		functionName: "s_userDebtShares",
		args: [address],
	});

	const {
		data: readDebtExchangerate,
		isPending: readDebtExchangeRatePending,
		error: readDebtExchangeRateError,
		refetch: refetchDebtExchangeRate,
	} = useReadContract({
		query: {
			enabled: isConnected && !!address,
		},
		address: process.env.NEXT_PUBLIC_ENGINE_ADDRESS,
		abi: abi.myusdengine,
		functionName: "debtExchangeRate",
	});

	const {
		data: readBorrowRate,
		isPending: readBorrowRatePending,
		error: readBorrowRateError,
		refetch: refetchBorrowRate,
	} = useReadContract({
		query: {
			enabled: isConnected && !!address,
		},
		address: process.env.NEXT_PUBLIC_ENGINE_ADDRESS,
		abi: abi.myusdengine,
		functionName: "borrowRate",
	});

	const {
		writeContractAsync: writeBorrowRate,
		isPending: borrowRatePending,
		data: borrowRateHash,
		error: borrowRateError,
	} = useWriteContract();

	const {
		data: readSavingsRate,
		isPending: readSavingsRatePending,
		error: readSavingsRateError,
		refetch: refetchSavingsRate,
	} = useReadContract({
		query: {
			enabled: isConnected && !!address,
		},
		address: process.env.NEXT_PUBLIC_STAKING_ADDRESS,
		abi: abi.myusdstaking,
		functionName: "savingsRate",
	});

	const {
		writeContractAsync: writeSavingsRate,
		isPending: savingsRatePending,
		data: savingsRateHash,
		error: savingsRateError,
	} = useWriteContract();

	const {
		writeContractAsync: writeSwap,
		isPending: ethToTokenPending,
		data: ethToTokenHash,
		error: ethToTokenError,
	} = useWriteContract();

	const {
		writeContractAsync: writeApprove,
		isPending: approvePending,
		data: approveHash,
		error: approveError,
	} = useWriteContract();

	const {
		writeContractAsync: writeAddCollateral,
		isPending: addCollateralPending,
		data: addCollateralHash,
		error: addCollateralError,
	} = useWriteContract();

	const {
		writeContractAsync: writeMintMyUsd,
		isPending: mintMyUsdPending,
		data: mintMyUsdHash,
		error: mintMyUsdError,
	} = useWriteContract();

	const {
		writeContractAsync: writeRemoveCollateral,
		isPending: removeCollateralPending,
		data: removeCollateralHash,
		error: removeCollateralError,
	} = useWriteContract();

	const {
		writeContractAsync: writeRepay,
		isPending: repayPending,
		data: repayHash,
		error: repayError,
	} = useWriteContract();

	const {
		writeContractAsync: writeStake,
		isPending: stakePending,
		data: stakeHash,
		error: stakeError,
	} = useWriteContract();

	const {
		writeContractAsync: writeWithdraw,
		isPending: withdrawPending,
		data: withdrawHash,
		error: withdrawError,
	} = useWriteContract();

	const handleBorrowRate = async () => {
		if (!address) return;

		try {
			toast.info("Submitting Transaction...");
			await writeBorrowRate({
				address: process.env.NEXT_PUBLIC_RATE_CONTROLLER_ADDRESS,
				abi: abi.ratecontroller,
				functionName: "setBorrowRate",
				args: [newBorrowRate],
			});

			toast.success("Transaction Success...");
		} catch (e) {
			toast.error(
				e.shortMessage || e.message || e.cause.shortMessage || e.cause.message
			);
		}

		refetchBorrowRate();
	};

	const handleSavingsRate = async () => {
		if (!address) return;

		try {
			toast.info("Submitting Transaction...");
			await writeSavingsRate({
				address: process.env.NEXT_PUBLIC_RATE_CONTROLLER_ADDRESS,
				abi: abi.ratecontroller,
				functionName: "setSavingsRate",
				args: [newSavingsRate],
			});

			toast.success("Transaction Success...");
		} catch (e) {
			toast.error(
				e.shortMessage || e.message || e.cause.shortMessage || e.cause.message
			);
		}

		refetchSavingsRate();
	};

	const handleSwap = async (type) => {
		if (!address) return;

		if (type === "ethToToken") {
			try {
				toast.info("Submitting Transaction...");
				await writeSwap({
					address: process.env.NEXT_PUBLIC_DEX_ADDRESS,
					abi: abi.dex,
					functionName: "swap",
					args: [BigInt(parseEther(inputEth))],
					value: parseEther(inputEth),
				});

				toast.success("Transaction Success...");
			} catch (e) {
				toast.error(
					e.shortMessage || e.message || e.cause.shortMessage || e.cause.message
				);
			}
		} else {
			try {
				toast.info("Submitting Transaction...");
				await writeApprove({
					address: process.env.NEXT_PUBLIC_STABLECOIN_ADDRESS,
					abi: abi.myusd,
					functionName: "approve",
					args: [
						process.env.NEXT_PUBLIC_DEX_ADDRESS,
						BigInt(parseEther(inputMyUsd)),
					],
				});

				await writeSwap({
					address: process.env.NEXT_PUBLIC_DEX_ADDRESS,
					abi: abi.dex,
					functionName: "swap",
					args: [BigInt(parseEther(inputMyUsd))],
				});

				toast.success("Transaction Success...");
			} catch (e) {
				toast.error(
					e.shortMessage || e.message || e.cause.shortMessage || e.cause.message
				);
			}
		}

		refetchJusdBalance();
	};

	const handleAddCollateral = async () => {
		if (!address) return;

		try {
			toast.info("Submitting Transaction...");
			await writeAddCollateral({
				address: process.env.NEXT_PUBLIC_ENGINE_ADDRESS,
				abi: abi.myusdengine,
				functionName: "addCollateral",
				value: parseEther(addCollateralAmount),
			});

			toast.success("Transaction Success...");
		} catch (e) {
			toast.error(
				e.shortMessage || e.message || e.cause.shortMessage || e.cause.message
			);
		}

		refetchUserCollateral();
	};

	const handleRemoveCollateral = async () => {
		if (!address) return;

		try {
			toast.info("Submitting Transaction...");
			await writeRemoveCollateral({
				address: process.env.NEXT_PUBLIC_ENGINE_ADDRESS,
				abi: abi.myusdengine,
				functionName: "withdrawCollateral",
				args: [BigInt(parseEther(removeCollateralAmount))],
			});

			toast.success("Transaction Success...");
		} catch (e) {
			toast.error(
				e.shortMessage || e.message || e.cause.shortMessage || e.cause.message
			);
		}

		refetchUserCollateral();
	};

	const handleMintMyUsd = async () => {
		if (!address) return;

		try {
			toast.info("Submitting Transaction...");
			await writeMintMyUsd({
				address: process.env.NEXT_PUBLIC_ENGINE_ADDRESS,
				abi: abi.myusdengine,
				functionName: "mintMyUSD",
				args: [BigInt(parseEther(mintAmount))],
			});
			toast.success("Transaction Success...");
		} catch (e) {
			toast.error(
				e.shortMessage || e.message || e.cause.shortMessage || e.cause.message
			);
		}

		refetchCalculatePositionRatio();
		refetchJusdBalance();
		refetchUserDebtShares();
	};

	const handleRepay = async () => {
		if (!address) return;

		const repayWei = parseEther(repayAmount);

		try {
			toast.info("Submitting Transaction...");
			await writeApprove({
				address: process.env.NEXT_PUBLIC_STABLECOIN_ADDRESS,
				abi: abi.myusd,
				functionName: "approve",
				args: [process.env.NEXT_PUBLIC_ENGINE_ADDRESS, repayWei],
			});

			await writeRepay({
				address: process.env.NEXT_PUBLIC_ENGINE_ADDRESS,
				abi: abi.myusdengine,
				functionName: "repayUpTo",
				args: [repayWei],
			});
			toast.success("Transaction Success...");
		} catch (e) {
			toast.error(
				e.shortMessage || e.message || e.cause.shortMessage || e.cause.message
			);
		}

		refetchCalculatePositionRatio();
		refetchJusdBalance();
		refetchUserDebtShares();
	};

	const handleStake = async () => {
		if (!address) return;

		const stakeWei = parseEther(stakeAmount);

		try {
			toast.info("Submitting Transaction...");
			await writeApprove({
				address: process.env.NEXT_PUBLIC_STABLECOIN_ADDRESS,
				abi: abi.myusd,
				functionName: "approve",
				args: [process.env.NEXT_PUBLIC_STAKING_ADDRESS, stakeWei],
			});

			await writeStake({
				address: process.env.NEXT_PUBLIC_STAKING_ADDRESS,
				abi: abi.myusdstaking,
				functionName: "stake",
				args: [stakeWei],
			});
			toast.success("Transaction Success...");
		} catch (e) {
			toast.error(
				e.shortMessage || e.message || e.cause.shortMessage || e.cause.message
			);
		}

		refetchStackingExchangeRate();
		refetchStackingUserShares();
		refetchCalculatePositionRatio();
		refetchJusdBalance();
		refetchUserDebtShares();
	};

	const handleWithdraw = async () => {
		if (!address) return;

		try {
			toast.info("Submitting Transaction...");
			await writeWithdraw({
				address: process.env.NEXT_PUBLIC_STAKING_ADDRESS,
				abi: abi.myusdstaking,
				functionName: "withdraw",
			});
			toast.success("Transaction Success...");
		} catch (e) {
			toast.error(
				e.shortMessage || e.message || e.cause.shortMessage || e.cause.message
			);
		}

		refetchStackingExchangeRate();
		refetchStackingUserShares();
		refetchCalculatePositionRatio();
		refetchJusdBalance();
		refetchUserDebtShares();
	};

	useEffect(() => {
		if (borrowRateHash) {
			console.log("Transaction sent! Hash:", borrowRateHash);
		}
		if (borrowRateError) {
			console.error("Write Error:", borrowRateError.message);
		}
		if (savingsRateHash) {
			console.log("Transaction sent! Hash:", savingsRateHash);
		}
		if (savingsRateError) {
			console.error("Write Error:", savingsRateError.message);
		}
	}, [borrowRateHash, borrowRateError, savingsRateHash, savingsRateError]);

	return (
		<div className='w-full relative'>
			<div className='w-full mt-20 grid grid-cols-4 gap-4 p-4 [&>*]:border-[1px] [&>*]:border-black [&>*]:p-2'>
				<div className='w-full'>
					<div>
						<p>
							Eth Balance:{" "}
							{userBalance.data ? Number(userBalance.data.formatted) : 0}
						</p>
						<p>
							JUSD Balance:{" "}
							{readJusdBalance ? Number(formatEther(readJusdBalance)) : 0}
						</p>
						<p>
							User Debt:{" "}
							{readUserDebtShares && readDebtExchangerate
								? Number(formatEther(readUserDebtShares)) *
								  Number(formatEther(readDebtExchangerate))
								: 0}
						</p>
						<p>
							Debt Shares:{" "}
							{readUserDebtShares ? Number(formatEther(readUserDebtShares)) : 0}
						</p>
						<p>
							Exchange Debt Rate:{" "}
							{readDebtExchangerate
								? Number(formatEther(readDebtExchangerate))
								: 0}
						</p>
						<hr className='my-[1rem]'></hr>
						<p>
							User Stacked Amount:{" "}
							{readStackingExchangeRate && readStackingUserShares
								? Number(formatEther(readStackingExchangeRate)) *
								  Number(formatEther(readStackingUserShares))
								: 0}
						</p>
						<p>
							Exchange Rate:{" "}
							{readStackingExchangeRate
								? Number(formatEther(readStackingExchangeRate))
								: 0}
						</p>
						<p>
							User Shares:{" "}
							{readStackingUserShares
								? Number(formatEther(readStackingUserShares))
								: 0}
						</p>
					</div>
				</div>
				<div className='w-full'>
					<div>
						<p>Borrow Rate: {Number(readBorrowRate)}</p>
						<input
							type='number'
							onChange={(e) => setNewBorrowRate(e.target.value)}
							value={newBorrowRate}
						></input>
						<button onClick={handleBorrowRate}>Submit</button>
					</div>
				</div>
				<div className='w-full'>
					<div>
						<p>Savings Rate: {Number(readSavingsRate)}</p>
						<input
							type='number'
							onChange={(e) => setNewSavingsRate(e.target.value)}
							value={newSavingsRate}
						></input>
						<button onClick={handleSavingsRate}>Submit</button>
					</div>
				</div>
				<div className='w-full'>
					<div>
						<p>Swap, ETH to JUSD</p>
						<input
							type='number'
							onChange={(e) => setInputEth(e.target.value)}
							value={inputEth}
						></input>
						<input
							type='number'
							onChange={(e) => setInputMyUsd(e.target.value)}
							value={inputMyUsd}
						></input>
						<button onClick={() => handleSwap("ethToToken")}>
							Submit ETH to Token
						</button>
						<button onClick={() => handleSwap("tokenToEth")}>
							Submit Token to ETH
						</button>
					</div>
				</div>
				<div className='w-full'>
					<div>
						<p>
							User Collateral:{" "}
							{readUserCollateral ? Number(formatEther(readUserCollateral)) : 0}
						</p>
						<p>Add Collateral</p>
						<input
							type='number'
							onChange={(e) => setAddCollateralAmount(e.target.value)}
							value={addCollateralAmount}
						></input>
						<button onClick={handleAddCollateral}>Submit</button>
						<p>Remove Collateral</p>
						<input
							type='number'
							onChange={(e) => setRemoveCollateralAmount(e.target.value)}
							value={removeCollateralAmount}
						></input>
						<button onClick={handleRemoveCollateral}>Submit</button>
					</div>
				</div>
				<div className='w-full'>
					<div>
						<p>Mint</p>
						<p>
							Position Ratio:{" "}
							{readCalculatePositionRatio
								? Number(formatEther(readCalculatePositionRatio))
								: 0}
						</p>
						<input
							type='number'
							onChange={(e) => setMintAmount(e.target.value)}
							value={mintAmount}
						></input>
						<button onClick={handleMintMyUsd}>Submit</button>
						<p>Repay</p>
						<input
							type='number'
							onChange={(e) => setRepayAmount(e.target.value)}
							value={repayAmount}
						></input>
						<button onClick={handleRepay}>Submit</button>
					</div>
				</div>
				<div className='w-full'>
					<div>
						<p>Stake</p>
						<input
							type='number'
							onChange={(e) => setStakeAmount(e.target.value)}
							value={stakeAmount}
						></input>
						<button onClick={handleStake}>Submit</button>
						<p>Withdraw</p>
						<button onClick={handleWithdraw}>Submit</button>
					</div>
				</div>
			</div>
			<Chart />
		</div>
	);
}
