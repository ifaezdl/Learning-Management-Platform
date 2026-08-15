import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import cartService from "../../services/cart.service";

interface CartState {
  cartCount: number;
}

const initialState: CartState = {
  cartCount: 0,
};

// Fetches the real cart from the server so the header badge always matches
// the actual number of items in the user's cart.
export const refreshCartCount = createAsyncThunk(
  "cart/refreshCartCount",
  async () => {
    const data = await cartService.getCart();
    return data.length;
  },
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartCount: (state, { payload }: { payload: number }) => {
      state.cartCount = payload;
    },
    incrementCartCount: (state) => {
      state.cartCount += 1;
    },
    decrementCartCount: (state) => {
      state.cartCount = Math.max(0, state.cartCount - 1);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(refreshCartCount.fulfilled, (state, action) => {
      state.cartCount = action.payload;
    });
  },
});

export const { setCartCount, incrementCartCount, decrementCartCount } =
  cartSlice.actions;

export default cartSlice.reducer;
