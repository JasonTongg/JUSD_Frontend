import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dex } from "./abi/DEX";
import { myusd } from "./abi/MyUSD";
import { myusdengine } from "./abi/MyUSDEngine";
import { myusdstaking } from "./abi/MyUSDStaking";
import { oracle } from "./abi/Oracle";
import { ratecontroller } from "./abi/RateController";

const initialState = {
	abi: {
		dex,
		myusd,
		myusdengine,
		myusdstaking,
		oracle,
		ratecontroller,
	},
	stableBalance: 0,
	balance: 0,
};

const datas = createSlice({
	name: "Datas",
	initialState,
	reducers: {
		setStableBalance: (state, action) => {
			state.stableBalance = action.payload;
		},
		setBalance: (state, action) => {
			state.balance = action.payload;
		},
	},
});

export default datas.reducer;
export const { setStableBalance, setBalance } = datas.actions;
