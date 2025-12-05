import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dex } from "./abi/DEX";
import { myusd } from "./abi/MyUSD";
import { myusdengine } from "./abi/MyUSDEngine";
import { myusdstaking } from "./abi/MyUSDStaking";
import { oracle } from "./abi/Oracle";
import { ratecontroller } from "./abi/RateController";

// Initial state
const initialState = {
	address: "0x0000000000000000000000000000000000000000",
	abi: {
		dex,
		myusd,
		myusdengine,
		myusdstaking,
		oracle,
		ratecontroller,
	},
};

// Create the slice
const datas = createSlice({
	name: "Datas",
	initialState,
	reducers: {
		setAddress: (state, action) => {
			state.address = action.payload;
		},
	},
});

// Export the reducer
export default datas.reducer;
