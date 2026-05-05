import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const key = `${action.payload._id}-${action.payload.selectedSize}`;
      const existing = state.items.find(i => `${i._id}-${i.selectedSize}` === key);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            `${i._id}-${i.selectedSize}` === key
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.payload, quantity: 1 }] };
    }
    case 'REMOVE_ITEM': {
      const key = `${action.payload.id}-${action.payload.size}`;
      return { ...state, items: state.items.filter(i => `${i._id}-${i.selectedSize}` !== key) };
    }
    case 'UPDATE_QUANTITY': {
      const key = `${action.payload.id}-${action.payload.size}`;
      return {
        ...state,
        items: state.items.map(i =>
          `${i._id}-${i.selectedSize}` === key
            ? { ...i, quantity: Math.max(1, action.payload.quantity) }
            : i
        ),
      };
    }
    case 'CLEAR_CART':
      return { ...state, items: [] };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: JSON.parse(localStorage.getItem('knousso_cart') || '[]'),
  });

  useEffect(() => {
    localStorage.setItem('knousso_cart', JSON.stringify(state.items));
  }, [state.items]);

  const total = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items: state.items, total, itemCount, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
