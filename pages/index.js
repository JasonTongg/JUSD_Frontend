import React, { useEffect, useState } from "react";
import { Chart } from "@/components/Chart";
import { CollateralHistory } from "@/components/CollateralHistory";
import { StakeHistory } from "@/components/StakeHistory";
import { RateChart } from "@/components/RateChart";
import {
	useAccount,
	useReadContract,
	useWriteContract,
	useBalance,
} from "wagmi";
import { useSelector, useDispatch } from "react-redux";
import { parseEther, formatEther } from "viem";
import { toast } from "react-toastify";
import { setStableBalance, setBalance } from "../store/data";
import { FaChartLine } from "react-icons/fa6";
import { FaLock } from "react-icons/fa6";
import { BiMoney } from "react-icons/bi";
import { MdSwapHoriz } from "react-icons/md";
import { FaEthereum } from "react-icons/fa";
import { FaCoins } from "react-icons/fa6";
import { FaList } from "react-icons/fa";
import { FaTrophy } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { IoMdAddCircle } from "react-icons/io";
import { IoMdRemoveCircle } from "react-icons/io";

const style = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: 400,
	bgcolor: "background.paper",
	boxShadow: 24,
	outline: "none",
	border: "none",
	borderRadius: "15px",
	p: 3,
};

export default function Index() {
	const dispatch = useDispatch();
	const { isConnected, address } = useAccount();
	const { data: userBalance, refetch: refetchEthBalance } = useBalance({
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
	const [ratio, setRatio] = useState(0);
	const [showRate, setShowRate] = useState(false);

	const [openSwap, setOpenSwap] = React.useState(false);
	const handleOpenSwap = () => setOpenSwap(true);
	const handleCloseSwap = () => setOpenSwap(false);

	const [openCollateral, setOpenCollateral] = React.useState(false);
	const handleOpenCollateral = () => setOpenCollateral(true);
	const handleCloseCollateral = () => setOpenCollateral(false);

	const [openMint, setOpenMint] = React.useState(false);
	const handleOpenMint = () => setOpenMint(true);
	const handleCloseMint = () => setOpenMint(false);

	const [openStake, setOpenStake] = React.useState(false);
	const handleOpenStake = () => setOpenStake(true);
	const handleCloseStake = () => setOpenStake(false);

	const [openSetting, setOpenSetting] = React.useState(false);
	const handleOpenSetting = () => setOpenSetting(true);
	const handleCloseSetting = () => setOpenSetting(false);

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
		data: readTotalSupply,
		isPending: readTotalSupplyPending,
		error: readTotalSupplyError,
		refetch: refetchTotalSupply,
	} = useReadContract({
		query: {
			enabled: isConnected && !!address,
		},
		address: process.env.NEXT_PUBLIC_STABLECOIN_ADDRESS,
		abi: abi.myusd,
		functionName: "totalSupply",
	});

	const { data: readEthPrice, refetch: refetchEthPrice } = useReadContract({
		query: {
			enabled: isConnected && !!address,
		},
		address: process.env.NEXT_PUBLIC_ORACLE_ADDRESS,
		abi: abi.oracle,
		functionName: "getETHMyUSDPrice",
	});

	const {
		data: readTotalShares,
		isPending: readTotalSharesPending,
		error: readTotalSharesError,
		refetch: refetchTotalShares,
	} = useReadContract({
		query: {
			enabled: isConnected && !!address,
		},
		address: process.env.NEXT_PUBLIC_STAKING_ADDRESS,
		abi: abi.myusdstaking,
		functionName: "totalShares",
	});

	const {
		data: readTotalSharesValue,
		isPending: readTotalSharesValuePending,
		error: readTotalSharesValueError,
		refetch: refetchTotalSharesValue,
	} = useReadContract({
		query: {
			enabled: isConnected && !!address && readTotalShares,
		},
		address: process.env.NEXT_PUBLIC_STAKING_ADDRESS,
		abi: abi.myusdstaking,
		functionName: "getSharesValue",
		args: [readTotalShares],
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
		refetchEthBalance();
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
		refetchEthBalance();
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
		refetchEthBalance();
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
		refetchCalculatePositionRatio();
		refetchJusdBalance();
		refetchUserDebtShares();
		refetchEthBalance();
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
		refetchCalculatePositionRatio();
		refetchJusdBalance();
		refetchUserDebtShares();
		refetchEthBalance();
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
		refetchEthBalance();
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
		refetchEthBalance();
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
		refetchTotalShares();
		refetchTotalSharesValue();
		refetchEthBalance();
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
		refetchTotalShares();
		refetchTotalSharesValue();
		refetchEthBalance();
	};

	useEffect(() => {
		setRatio(readCalculatePositionRatio);
	}, [readCalculatePositionRatio]);

	useEffect(() => {
		if (readJusdBalance === undefined) return;

		const formatted = formatEther(readJusdBalance);

		dispatch(setStableBalance(formatted));
	}, [readJusdBalance?.toString()]);

	useEffect(() => {
		if (userBalance === undefined) return;

		dispatch(setBalance(userBalance.formatted.toString()));
	}, [userBalance?.toString()]);

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
		<div className='w-full relative p-4 flex flex-col items-center justify-center gap-4 max-w-[90rem]'>
			<Modal
				open={openSetting}
				onClose={() => {
					handleCloseSetting();
					setNewBorrowRate(0);
					setNewSavingsRate(0);
				}}
				aria-labelledby='modal-modal-title'
				aria-describedby='modal-modal-description'
			>
				<Box sx={{ ...style, width: "350px", border: "3px solid #e5e7eb" }}>
					<h1 className='text-2xl font-bold'>Setting</h1>
					<p className='text-base text-gray-500 flex items-center justify-start gap-1'>
						Update Borrow Rate and Savings Rate
					</p>
					<div className='mt-2'>
						<p className='mb-1'>Borrow Rate</p>
						<div
							className='grid items-center justify-start border-[1px] border-gray-300 px-2 rounded-[10px]'
							style={{ gridTemplateColumns: "25px 1fr 70px" }}
						>
							<MdSwapHoriz className='text-2xl text-gray-600' />
							<input
								className='w-full !border-none !outline-none !outline-[0px] !border-[0px] focus:outline-none focus:ring-0 focus:shadow-none'
								type='number'
								placeholder='0'
								min={0}
								onChange={(e) => setNewBorrowRate(e.target.value)}
								value={newBorrowRate}
							/>
							<button
								onClick={() => {
									handleBorrowRate();
									setNewBorrowRate(0);
								}}
								className='text-gray-600 bg-gray-200 py-1 px-3 rounded-[10px] text-sm'
							>
								Submit
							</button>
						</div>
					</div>
					<div className='mt-2'>
						<p className='mb-1'>Savings Rate</p>
						<div
							className='grid items-center justify-start border-[1px] border-gray-300 px-2 rounded-[10px]'
							style={{ gridTemplateColumns: "25px 1fr 70px" }}
						>
							<MdSwapHoriz className='text-2xl text-gray-600' />
							<input
								className='w-full !border-none !outline-none !outline-[0px] !border-[0px] focus:outline-none focus:ring-0 focus:shadow-none'
								type='number'
								placeholder='0'
								min={0}
								onChange={(e) => setNewSavingsRate(e.target.value)}
								value={newSavingsRate}
							/>
							<button
								onClick={() => {
									handleSavingsRate();
									setNewSavingsRate(0);
								}}
								className='text-gray-600 bg-gray-200 py-1 px-3 rounded-[10px] text-sm'
							>
								Submit
							</button>
						</div>
					</div>
				</Box>
			</Modal>
			<Modal
				open={openSwap}
				onClose={() => {
					handleCloseSwap();
					setInputEth(0);
					setInputMyUsd(0);
				}}
				aria-labelledby='modal-modal-title'
				aria-describedby='modal-modal-description'
			>
				<Box sx={{ ...style, width: "350px", border: "3px solid #e9d5ff" }}>
					<h1 className='text-2xl font-bold'>Swap</h1>
					<p className='text-base text-gray-500 flex items-center justify-start gap-1'>
						Exchange ETH <MdSwapHoriz></MdSwapHoriz> JUSD
					</p>
					<div className='mt-2'>
						<p className='mb-1'>ETH to JUSD</p>
						<div
							className='grid items-center justify-start border-[1px] border-gray-300 px-2 rounded-[10px]'
							style={{ gridTemplateColumns: "25px 1fr 70px" }}
						>
							<MdSwapHoriz className='text-2xl text-gray-600' />
							<input
								className='w-full !border-none !outline-none !outline-[0px] !border-[0px] focus:outline-none focus:ring-0 focus:shadow-none'
								type='number'
								placeholder='0'
								min={0}
								onChange={(e) => setInputEth(e.target.value)}
								value={inputEth}
							/>
							<button
								onClick={() => {
									handleSwap("ethToToken");
									setInputEth(0);
								}}
								className='text-purple-600 bg-purple-200 py-1 px-3 rounded-[10px] text-sm'
							>
								Submit
							</button>
						</div>
					</div>
					<div className='mt-2'>
						<p className='mb-1'>JUSD to ETH</p>
						<div
							className='grid items-center justify-start border-[1px] border-gray-300 px-2 rounded-[10px]'
							style={{ gridTemplateColumns: "25px 1fr 70px" }}
						>
							<MdSwapHoriz className='text-2xl text-gray-600' />
							<input
								className='w-full !border-none !outline-none !outline-[0px] !border-[0px] focus:outline-none focus:ring-0 focus:shadow-none'
								type='number'
								placeholder='0'
								min={0}
								onChange={(e) => setInputMyUsd(e.target.value)}
								value={inputMyUsd}
							/>
							<button
								onClick={() => {
									handleSwap("tokenToEth");
									setInputMyUsd(0);
								}}
								className='text-purple-600 bg-purple-200 py-1 px-3 rounded-[10px] text-sm'
							>
								Submit
							</button>
						</div>
					</div>
				</Box>
			</Modal>
			<Modal
				open={openCollateral}
				onClose={() => {
					handleCloseCollateral();
					refetchCalculatePositionRatio();
					setAddCollateralAmount(0);
					setRemoveCollateralAmount(0);
				}}
				aria-labelledby='modal-modal-title'
				aria-describedby='modal-modal-description'
			>
				<Box sx={{ ...style, width: "350px", border: "3px solid #bfdbfe" }}>
					<h1 className='text-2xl font-bold'>Collateral</h1>
					<p className='text-base text-gray-500'>Manage ETH Collateral</p>
					<div className='text-black bg-blue-200 px-2 py-1 mt-2 rounded-[15px]'>
						<p className='text-base text-center'>
							Position Ratio: <br></br>{" "}
							{ratio
								? (() => {
										const value = Number(formatEther(ratio));
										if (isNaN(value)) return `${ratio.toFixed(2)}%`;
										if (value > 99999) return "99999%+";
										return `${value.toFixed(2)}%`;
								  })()
								: 0}
						</p>
					</div>
					{ratio < 150 && (
						<div className='text-red-600 bg-red-200 px-2 py-1 mt-2 rounded-[10px] text-center'>
							Liquidatable
						</div>
					)}
					<div className='mt-2'>
						<p className='mb-1'>Add Collateral</p>
						<div
							className='grid items-center justify-start border-[1px] border-gray-300 px-2 rounded-[10px]'
							style={{ gridTemplateColumns: "25px 1fr 70px" }}
						>
							<IoMdAddCircle className='text-2xl text-gray-600' />
							<input
								className='w-full !border-none !outline-none !outline-[0px] !border-[0px] focus:outline-none focus:ring-0 focus:shadow-none'
								type='number'
								placeholder='0'
								min={0}
								onChange={(e) => {
									setAddCollateralAmount(e.target.value);
									let userCollateral = Number(formatEther(readUserCollateral));
									let price = Number(formatEther(readEthPrice));
									let debt =
										Number(formatEther(readUserDebtShares)) *
										Number(formatEther(readDebtExchangerate));
									userCollateral += Number(e.target.value);
									setRatio((userCollateral * price) / debt);
								}}
								value={addCollateralAmount}
							/>
							<button
								onClick={() => {
									handleAddCollateral();
									refetchCalculatePositionRatio();
									setAddCollateralAmount(0);
								}}
								className='text-blue-600 bg-blue-200 py-1 px-3 rounded-[10px] text-sm'
							>
								Submit
							</button>
						</div>
					</div>
					<div className='mt-2'>
						<p className='mb-1'>Remove Collateral</p>
						<div
							className='grid items-center justify-start border-[1px] border-gray-300 px-2 rounded-[10px]'
							style={{ gridTemplateColumns: "25px 1fr 70px" }}
						>
							<IoMdRemoveCircle className='text-2xl text-gray-600' />
							<input
								className='w-full !border-none !outline-none !outline-[0px] !border-[0px] focus:outline-none focus:ring-0 focus:shadow-none'
								type='number'
								placeholder='0'
								min={0}
								onChange={(e) => {
									setRemoveCollateralAmount(e.target.value);
									let userCollateral = Number(formatEther(readUserCollateral));
									let price = Number(formatEther(readEthPrice));
									let debt =
										Number(formatEther(readUserDebtShares)) *
										Number(formatEther(readDebtExchangerate));
									userCollateral -= Number(e.target.value);
									setRatio((userCollateral * price) / debt);
								}}
								value={removeCollateralAmount}
							/>
							<button
								onClick={() => {
									handleRemoveCollateral();
									setRemoveCollateralAmount(0);
									refetchCalculatePositionRatio();
								}}
								className='text-blue-600 bg-blue-200 py-1 px-3 rounded-[10px] text-sm disabled:opacity-20'
							>
								Submit
							</button>
						</div>
					</div>
				</Box>
			</Modal>
			<Modal
				open={openStake}
				onClose={() => {
					handleCloseStake();
					setStakeAmount(0);
				}}
				aria-labelledby='modal-modal-title'
				aria-describedby='modal-modal-description'
			>
				<Box sx={{ ...style, width: "350px", border: "3px solid #fed7aa" }}>
					<h1 className='text-2xl font-bold'>Stake/Withdraw</h1>
					<p className='text-base text-gray-500'>Stake or Withdraw JUSD</p>
					<div className='mt-2'>
						<p className='mb-1'>Stake JUSD</p>
						<div
							className='grid items-center justify-start border-[1px] border-gray-300 px-2 rounded-[10px]'
							style={{ gridTemplateColumns: "25px 1fr 70px" }}
						>
							<IoMdAddCircle className='text-2xl text-gray-600' />
							<input
								className='w-full !border-none !outline-none !outline-[0px] !border-[0px] focus:outline-none focus:ring-0 focus:shadow-none'
								type='number'
								placeholder='0'
								min={0}
								onChange={(e) => setStakeAmount(e.target.value)}
								value={stakeAmount}
							/>
							<button
								onClick={() => {
									handleStake();
									setStakeAmount(0);
								}}
								className='text-orange-600 bg-orange-200 py-1 px-3 rounded-[10px] text-sm'
							>
								Submit
							</button>
						</div>
					</div>
					<div className='mt-2'>
						<p className='mb-1'>Withdraw All JUSD</p>
						<div
							className='grid items-center justify-start border-[1px] border-gray-300 px-2 rounded-[10px]'
							style={{ gridTemplateColumns: "25px 1fr 70px" }}
						>
							<IoMdRemoveCircle className='text-2xl text-gray-600' />
							<input
								className='w-full !border-none !outline-none !outline-[0px] !border-[0px] focus:outline-none focus:ring-0 focus:shadow-none'
								type='number'
								placeholder='0'
								min={0}
								disabled
								value={
									readStackingExchangeRate && readStackingUserShares
										? formatNumber(
												Number(formatEther(readStackingExchangeRate)) *
													Number(formatEther(readStackingUserShares))
										  )
										: 0
								}
							/>
							<button
								onClick={() => {
									handleWithdraw();
								}}
								className='text-orange-600 bg-orange-200 py-1 px-3 rounded-[10px] text-sm'
							>
								Submit
							</button>
						</div>
					</div>
				</Box>
			</Modal>
			<Modal
				open={openMint}
				onClose={() => {
					handleCloseMint();
					setMintAmount(0);
					refetchCalculatePositionRatio();
					setRepayAmount(0);
				}}
				aria-labelledby='modal-modal-title'
				aria-describedby='modal-modal-description'
			>
				<Box sx={{ ...style, width: "350px", border: "3px solid #bbf7d0" }}>
					<h1 className='text-2xl font-bold'>Mint/Repay</h1>
					<p className='text-base text-gray-500'>Mint or Repay JUSD</p>
					<div className='text-black bg-green-200 px-2 py-1 mt-2 rounded-[15px]'>
						<p className='text-base text-center'>
							Position Ratio: <br></br>{" "}
							{ratio
								? (() => {
										const value = Number(formatEther(ratio));
										if (isNaN(value)) return `${ratio.toFixed(2)}%`;
										if (value > 99999) return "99999%+";
										return `${value.toFixed(2)}%`;
								  })()
								: 0}
						</p>
					</div>
					{ratio < 150 && (
						<div className='text-red-600 bg-red-200 px-2 py-1 mt-2 rounded-[10px] text-center'>
							Liquidatable
						</div>
					)}
					<div className='mt-2'>
						<p className='mb-1'>Mint JUSD</p>
						<div
							className='grid items-center justify-start border-[1px] border-gray-300 px-2 rounded-[10px]'
							style={{ gridTemplateColumns: "25px 1fr 70px" }}
						>
							<IoMdAddCircle className='text-2xl text-gray-600' />
							<input
								className='w-full !border-none !outline-none !outline-[0px] !border-[0px] focus:outline-none focus:ring-0 focus:shadow-none'
								type='number'
								placeholder='0'
								min={0}
								onChange={(e) => {
									setMintAmount(e.target.value);
									let userCollateral = Number(formatEther(readUserCollateral));
									let price = Number(formatEther(readEthPrice));
									let debt =
										Number(formatEther(readUserDebtShares)) *
										Number(formatEther(readDebtExchangerate));
									debt += Number(e.target.value);
									setRatio((userCollateral * price) / debt);
								}}
								value={mintAmount}
							/>
							<button
								onClick={() => {
									handleMintMyUsd();
									setMintAmount(0);
									refetchCalculatePositionRatio();
								}}
								className='text-green-600 bg-green-200 py-1 px-3 rounded-[10px] text-sm disabled:opacity-20'
							>
								Submit
							</button>
						</div>
					</div>
					<div className='mt-2'>
						<p className='mb-1'>Repay JUSD</p>
						<div
							className='grid items-center justify-start border-[1px] border-gray-300 px-2 rounded-[10px]'
							style={{ gridTemplateColumns: "25px 1fr 70px" }}
						>
							<IoMdRemoveCircle className='text-2xl text-gray-600' />
							<input
								className='w-full !border-none !outline-none !outline-[0px] !border-[0px] focus:outline-none focus:ring-0 focus:shadow-none'
								type='number'
								placeholder='0'
								min={0}
								onChange={(e) => {
									setRepayAmount(e.target.value);
									let userCollateral = Number(formatEther(readUserCollateral));
									let price = Number(formatEther(readEthPrice));
									let debt =
										Number(formatEther(readUserDebtShares)) *
										Number(formatEther(readDebtExchangerate));
									debt -= Number(e.target.value);
									setRatio((userCollateral * price) / debt);
								}}
								value={repayAmount}
							/>
							<button
								onClick={() => {
									handleRepay();
									setRepayAmount(0);
									refetchCalculatePositionRatio();
								}}
								className='text-green-600 bg-green-200 py-1 px-3 rounded-[10px] text-sm'
							>
								Submit
							</button>
						</div>
					</div>
				</Box>
			</Modal>
			<div
				onClick={handleOpenSetting}
				className='p-4 rounded-[100px] fixed bottom-[20px] right-[20px] bg-white border-[0.5px] shadow-md border-gray-200 cursor-pointer hover:scale-110 transition-all'
			>
				<IoMdSettings className='text-3xl' />
			</div>
			<div className='grid gap-4 mt-20 w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-5'>
				<div className='flex items-center justify-between gap-4 py-4 px-6 bg-white rounded-[10px] border-[0.5px] shadow-md border-gray-200'>
					<div>
						<p className='text-sm text-gray-500'>Total Supply</p>
						<h1 className='font-bold text-2xl'>
							{readTotalSupply
								? formatNumber(Number(formatEther(readTotalSupply)))
								: 0}{" "}
							JUSD
						</h1>
					</div>
					<div className='bg-blue-200 p-3 rounded-[10px]'>
						<FaChartLine className='text-blue-600' />
					</div>
				</div>
				<div className='flex items-center justify-between gap-4 py-4 px-6 bg-white rounded-[10px] border-[0.5px] shadow-md border-gray-200'>
					<div>
						<p className='text-sm text-gray-500'>Total Staked</p>
						<h1 className='font-bold text-2xl'>
							{readTotalSharesValue
								? formatNumber(Number(formatEther(readTotalSharesValue)))
								: 0}{" "}
							JUSD
						</h1>
					</div>
					<div className='bg-green-200 p-3 rounded-[10px]'>
						<FaLock className='text-green-600' />
					</div>
				</div>
				<div className='flex items-center justify-between gap-4 py-4 px-6 bg-white rounded-[10px] border-[0.5px] shadow-md border-gray-200'>
					<div>
						<p className='text-sm text-gray-500'>My Debt</p>
						<h1 className='font-bold text-2xl'>
							{readUserDebtShares && readDebtExchangerate
								? formatNumber(
										Number(formatEther(readUserDebtShares)) *
											Number(formatEther(readDebtExchangerate))
								  )
								: 0}{" "}
							JUSD
						</h1>
					</div>
					<div className='bg-orange-200 p-2 rounded-[10px]'>
						<BiMoney className='text-orange-600 text-2xl' />
					</div>
				</div>
				<div className='flex items-center justify-between gap-4 py-4 px-6 bg-white rounded-[10px] border-[0.5px] shadow-md border-gray-200'>
					<div>
						<p className='text-sm text-gray-500'>My Staked</p>
						<h1 className='font-bold text-2xl'>
							{readStackingExchangeRate && readStackingUserShares
								? formatNumber(
										Number(formatEther(readStackingExchangeRate)) *
											Number(formatEther(readStackingUserShares))
								  )
								: 0}{" "}
							JUSD
						</h1>
					</div>
					<div className='bg-purple-200 p-3 rounded-[10px]'>
						<FaLock className='text-purple-600' />
					</div>
				</div>
				<div
					className='flex items-center justify-between gap-4 py-4 px-6 bg-white rounded-[10px] border-[0.5px] shadow-md border-gray-200'
					style={
						Number(formatEther(readCalculatePositionRatio || 0)) < 150
							? { border: "1px solid #dc2626" }
							: {}
					}
				>
					<div>
						<p
							className='text-sm text-gray-500'
							style={
								Number(formatEther(readCalculatePositionRatio || 0)) < 150
									? { color: "#dc2626" }
									: {}
							}
						>
							My Position Ratio
						</p>
						<h1
							className='font-bold text-2xl'
							style={
								Number(formatEther(readCalculatePositionRatio || 0)) < 150
									? { color: "#dc2626" }
									: {}
							}
						>
							{readCalculatePositionRatio
								? (() => {
										const value = Number(
											formatEther(readCalculatePositionRatio)
										);
										if (isNaN(value))
											return `${readCalculatePositionRatio.toFixed(2)}%`;
										if (value > 99999) return "99999%+";
										return `${value.toFixed(2)}%`;
								  })()
								: 0}
						</h1>
						{Number(formatEther(readCalculatePositionRatio || 0)) < 150 && (
							<p className='text-red-600 font-bold'>Liquidatable</p>
						)}
					</div>
					<div className='bg-red-200 p-3 rounded-[10px]'>
						<FaLock className='text-red-600' />
					</div>
				</div>
			</div>
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-4 w-full'>
				<div className='grid-cols-1 sm:grid-cols-2 grid w-full gap-4'>
					<div
						onClick={handleOpenSwap}
						className='bg-white w-full min-h-[150px] hover:scale-105 transition-all hover:bg-purple-50 flex flex-col items-center justify-center gap-2 rounded-[10px] cursor-pointer border-[0.5px] shadow-md border-gray-200'
					>
						<div className='bg-purple-200 p-2 rounded-[10px]'>
							<MdSwapHoriz className='text-purple-600 text-2xl' />
						</div>
						<h3 className='font-semibold text-xl'>Swap</h3>
						<h3 className='flex items-center justify-center gap-1 text-gray-500 text-sm'>
							Exchange ETH <MdSwapHoriz></MdSwapHoriz> JUSD
						</h3>
					</div>
					<div
						onClick={handleOpenCollateral}
						className='bg-white w-full min-h-[150px] hover:scale-105 transition-all hover:bg-blue-50 flex flex-col items-center justify-center gap-2 rounded-[10px] cursor-pointer border-[0.5px] shadow-md border-gray-200'
					>
						<div className='bg-blue-200 p-2 rounded-[10px]'>
							<FaEthereum className='text-blue-600 text-2xl' />
						</div>
						<h3 className='font-semibold text-xl'>Collateral</h3>
						<h3 className='flex items-center justify-center gap-1 text-gray-500 text-sm'>
							Manage ETH Collateral
						</h3>
					</div>
					<div
						onClick={handleOpenMint}
						className='bg-white w-full min-h-[150px] flex flex-col hover:scale-105 transition-all hover:bg-green-50 items-center justify-center gap-2 rounded-[10px] cursor-pointer border-[0.5px] shadow-md border-gray-200'
					>
						<div className='bg-green-200 p-3 rounded-[10px]'>
							<FaCoins className='text-green-600' />
						</div>
						<h3 className='font-semibold text-xl'>Mint/Repay</h3>
						<h3 className='flex items-center justify-center gap-1 text-gray-500 text-sm'>
							Mint or Repay JUSD
						</h3>
					</div>
					<div
						onClick={handleOpenStake}
						className='bg-white w-full min-h-[150px] flex flex-col items-center hover:scale-105 transition-all hover:bg-orange-50 justify-center gap-2 rounded-[10px] cursor-pointer border-[0.5px] shadow-md border-gray-200'
					>
						<div className='bg-orange-200 p-3 rounded-[10px]'>
							<FaLock className='text-orange-600' />
						</div>
						<h3 className='font-semibold text-xl'>Stake/Withdraw</h3>
						<h3 className='flex items-center justify-center gap-1 text-gray-500 text-sm'>
							Stake or Withdraw JUSD
						</h3>
					</div>
				</div>
				<div className='w-full min-h-[400px] bg-white p-4 rounded-[10px] border-[0.5px] shadow-md border-gray-200'>
					<div className='flex items-center justify-between gap-3'>
						<h2 className='font-bold text-xl'>JUSD Price</h2>
						{showRate === false ? (
							<button
								className='text-blue-600 bg-blue-100 border-[1px] py-1 px-3 rounded-[10px] font-semibold hover:scale-110 transition-all'
								onClick={() => setShowRate(true)}
							>
								Show Rate
							</button>
						) : (
							<button
								className='text-orange-600 bg-orange-100 border-[1px] py-1 px-3 rounded-[10px] font-semibold hover:scale-110 transition-all'
								onClick={() => setShowRate(false)}
							>
								Show Price
							</button>
						)}
					</div>
					{showRate ? <RateChart /> : <Chart />}
				</div>
			</div>
			<div className='grid lg:grid-cols-3 gap-4 w-full'>
				<div className='bg-white w-full min-h-[200px] lg:col-span-2  p-4 rounded-[10px]  border-[0.5px] shadow-md border-gray-200'>
					<div className='w-full flex items-center justify-start gap-3'>
						<div className='bg-green-200 p-3 rounded-[10px]'>
							<FaList className='text-green-600 text-xl' />
						</div>
						<div>
							<p className='font-bold text-2xl'>Positions</p>
							<h1 className='text-sm text-gray-500'>View all positions</h1>
						</div>
					</div>
					<CollateralHistory
						refetchJusdBalance={refetchJusdBalance}
						refetchEthBalance={refetchEthBalance}
						readCalculatePositionRatio={readCalculatePositionRatio}
						refetchCalculatePositionRatio={refetchCalculatePositionRatio}
					/>
				</div>
				<div className='bg-white w-full min-h-[200px] p-4 rounded-[10px] border-[0.5px] shadow-md border-gray-200'>
					<div className='w-full flex items-center justify-start gap-3'>
						<div className='bg-purple-200 p-3 rounded-[10px]'>
							<FaTrophy className='text-purple-600 text-xl' />
						</div>
						<div>
							<p className='font-bold text-2xl'>Leaderboard</p>
							<h1 className='text-sm text-gray-500'>Top Stakers</h1>
						</div>
					</div>
					<StakeHistory
						refetchJusdBalance={refetchJusdBalance}
						refetchEthBalance={refetchEthBalance}
					/>
				</div>
			</div>
			<div className='w-full grid grid-cols-4 gap-4 [&>*]:border-[1px] [&>*]:border-black [&>*]:p-2'>
				<div className='w-full'>
					<div>
						<p>
							Eth Balance: {userBalance ? Number(userBalance.formatted) : 0}
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
						<hr className='my-[1rem]'></hr>
						<p>
							Total Supply:{" "}
							{readTotalSupply ? Number(formatEther(readTotalSupply)) : 0}
						</p>
						<p>
							Total Staked:{" "}
							{readTotalSharesValue
								? Number(formatEther(readTotalSharesValue))
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
							onChange={(e) => {
								setAddCollateralAmount(e.target.value);
								let userCollateral = Number(formatEther(readUserCollateral));
								let price = Number(formatEther(readEthPrice));
								let debt =
									Number(formatEther(readUserDebtShares)) *
									Number(formatEther(readDebtExchangerate));
								userCollateral += Number(e.target.value);
								setRatio((userCollateral * price) / debt);
							}}
							value={addCollateralAmount}
						></input>
						<button onClick={handleAddCollateral}>Submit</button>
						<p>Remove Collateral</p>
						<input
							type='number'
							onChange={(e) => {
								setRemoveCollateralAmount(e.target.value);
								let userCollateral = Number(formatEther(readUserCollateral));
								let price = Number(formatEther(readEthPrice));
								let debt =
									Number(formatEther(readUserDebtShares)) *
									Number(formatEther(readDebtExchangerate));
								userCollateral -= Number(e.target.value);
								setRatio((userCollateral * price) / debt);
							}}
							value={removeCollateralAmount}
						></input>
						<button onClick={handleRemoveCollateral}>Submit</button>
					</div>
				</div>
				<div className='w-full'>
					<div>
						<p>Mint</p>
						<p>
							Position Ratio: {ratio ? Number(formatEther(ratio)) || ratio : 0}
						</p>
						<input
							type='number'
							onChange={(e) => {
								setMintAmount(e.target.value);
								let userCollateral = Number(formatEther(readUserCollateral));
								let price = Number(formatEther(readEthPrice));
								let debt =
									Number(formatEther(readUserDebtShares)) *
									Number(formatEther(readDebtExchangerate));
								debt += Number(e.target.value);
								setRatio((userCollateral * price) / debt);
							}}
							value={mintAmount}
						></input>
						<button onClick={handleMintMyUsd}>Submit</button>
						<p>Repay</p>
						<input
							type='number'
							onChange={(e) => {
								setRepayAmount(e.target.value);
								let userCollateral = Number(formatEther(readUserCollateral));
								let price = Number(formatEther(readEthPrice));
								let debt =
									Number(formatEther(readUserDebtShares)) *
									Number(formatEther(readDebtExchangerate));
								debt -= Number(e.target.value);
								setRatio((userCollateral * price) / debt);
							}}
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
		</div>
	);
}
