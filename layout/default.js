import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { ToastContainer } from "react-toastify";

export default function Default({ children }) {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
		return () => setIsMounted(false);
	}, []);

	if (!isMounted) return null;

	return (
		<main className='flex flex-col items-center justify-start !mt-10 w-full min-h-screen overflow-x-hidden relative bg-[#f3f4f6b7]'>
			<Navbar />
			<ToastContainer />
			{children}
		</main>
	);
}
