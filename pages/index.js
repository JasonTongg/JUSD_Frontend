import React, { useEffect } from "react";
import { Chart } from "@/components/Chart";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { useSelector } from "react-redux";

export default function Index() {
	const { isConnected, address } = useAccount();
	const { abi } = useSelector((data) => data.data);

	const {
		data: balance,
		isPending: isBalanceLoading,
		error: balanceError,
	} = useReadContract({
		query: {
			enabled: isConnected && !!address,
		},
		address: EXAMPLE_TOKEN_ADDRESS,
		abi: EXAMPLE_TOKEN_ABI,
		functionName: "balanceOf",
		args: [address],
	});

	const {
		writeContract,
		isPending: isTransferPending,
		data: hash,
		error: writeError,
	} = useWriteContract();

	const handleTransfer = () => {
		if (!address) return;

		const recipientAddress = "0x000000000000000000000000000000000000dead";
		const amountToSend = 100n;

		writeContract({
			address: EXAMPLE_TOKEN_ADDRESS,
			abi: EXAMPLE_TOKEN_ABI,
			functionName: "transfer",
			args: [recipientAddress, amountToSend],
		});
	};

	useEffect(() => {
		if (hash) {
			console.log("Transaction sent! Hash:", hash);
		}
		if (writeError) {
			console.error("Write Error:", writeError.message);
		}
	}, [hash, writeError]);

	return (
		<div className='w-full relative'>
			<div className='min-h-screen w-full '></div>
			<Chart />
		</div>
	);
}
