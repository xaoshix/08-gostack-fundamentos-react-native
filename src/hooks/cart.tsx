import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const res = await AsyncStorage.getItem('products');

      if (res) {
        setProducts(JSON.parse(res));
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const existProduct = products.find(item => item.id === id);

      if (existProduct) {
        const productsRest = products.filter(
          item => item.id !== existProduct.id,
        );

        const newProduct = {
          id: existProduct.id,
          title: existProduct.title,
          image_url: existProduct.image_url,
          price: existProduct.price,
          quantity: existProduct.quantity + 1,
        };

        setProducts([newProduct, ...productsRest]);

        await AsyncStorage.setItem(
          'products',
          JSON.stringify([newProduct, ...productsRest]),
        );
      } else {
        await AsyncStorage.setItem('products', JSON.stringify([...products]));
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const existProduct = products.find(item => item.id === id);

      if (existProduct) {
        const productsRest = products.filter(
          item => item.id !== existProduct.id,
        );

        if (existProduct.quantity - 1 >= 0) {
          const newProduct = {
            id: existProduct.id,
            title: existProduct.title,
            image_url: existProduct.image_url,
            price: existProduct.price,
            quantity: existProduct.quantity - 1,
          };

          setProducts([newProduct, ...productsRest]);

          await AsyncStorage.setItem(
            'products',
            JSON.stringify([newProduct, ...productsRest]),
          );
        }
      } else {
        await AsyncStorage.setItem('products', JSON.stringify([...products]));
      }
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const existProduct = products.find(item => item.id === product.id);

      if (!existProduct) {
        const newProduct = {
          id: product.id,
          title: product.title,
          image_url: product.image_url,
          price: product.price,
          quantity: 1,
        };

        setProducts([newProduct, ...products]);

        await AsyncStorage.setItem(
          'products',
          JSON.stringify([newProduct, ...products]),
        );
      } else {
        increment(existProduct.id);
      }
    },
    [increment, products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
