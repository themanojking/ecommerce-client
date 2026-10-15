import { createSlice } from "@reduxjs/toolkit";

const savedCart = localStorage.getItem("cartItems");

const initialState = {
  items: savedCart ? JSON.parse(savedCart) : [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
addToCart: (state, action) => {
  const product = action.payload;
  const existingItem = state.items.find(
    (item) => item._id === product._id
  );

  if (existingItem) {
    existingItem.quantity += Number(product.quantity) || 1;
  } else {
    state.items.push({
      ...product,
      quantity: Number(product.quantity) || 1,
    });
  }

  localStorage.setItem("cartItems", JSON.stringify(state.items));
},


    removeFromCart: (state, action) => {
      state.items = state.items.filter(
        (item) => item._id !== action.payload
      );

      localStorage.setItem("cartItems", JSON.stringify(state.items));
    },

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((product) => product._id === id);

      if (item && quantity > 0) {
        item.quantity = quantity;
      }

      localStorage.setItem("cartItems", JSON.stringify(state.items));
    },

    clearCart: (state) => {
      state.items = [];
      localStorage.setItem("cartItems", JSON.stringify(state.items));
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
``