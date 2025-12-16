import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Product } from '@/lib/products'
import { showTerminalToast } from '@/components/global/terminal-toast'

interface CartItem extends Product {
    quantity: number
}

interface CartStore {
    items: CartItem[]
    addItem: (data: Product) => void
    removeItem: (id: string) => void
    removeAll: () => void
}

const useCart = create(
    persist<CartStore>(
        (set, get) => ({
            items: [],
            addItem: (data: Product) => {
                const currentItems = get().items
                const existingItem = currentItems.find((item) => item.id === data.id)

                if (existingItem) {
                    return showTerminalToast.info('Already in Cart', 'This item is already in your cart.')
                }

                set({ items: [...get().items, { ...data, quantity: 1 }] })
                showTerminalToast.success('Added to Cart', `${data.name} has been added to your cart.`)
            },
            removeItem: (id: string) => {
                set({ items: [...get().items.filter((item) => item.id !== id)] })
                showTerminalToast.success('Removed from Cart', 'Item has been removed from your cart.')
            },
            removeAll: () => set({ items: [] }),
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
)

export default useCart
