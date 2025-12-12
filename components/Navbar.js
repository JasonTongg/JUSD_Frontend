import Image from "next/image";
import React from "react";
import Logo from "../public/assets/Logo.png";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSelector } from "react-redux";

export default function Navbar() {
	const { stableBalance, balance } = useSelector((data) => data.data);

	return (
		<nav className='bg-white flex w-full border-[0.5px] shadow-md border-gray-200 z-[99] p-4 items-center justify-around gap-4 padding-section fixed px-4 sm:px-6 lg:px-8 top-0 left-1/2 translate-x-[-50%]'>
			<Image src={Logo} className='w-[80px]' />
			<div className='flex items-center justify-center gap-6'>
				<p>
					ETH:{" "}
					<span className='font-semibold'>{Number(balance).toFixed(2)}</span>
				</p>
				<p>
					JUSD:{" "}
					<span className='font-semibold'>
						{Number(stableBalance).toFixed(2)}
					</span>
				</p>
				<ConnectButton showBalance={false} />
			</div>
		</nav>
	);
}
