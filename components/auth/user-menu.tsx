
import { handleSignOut } from "@/app/actions"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { User, Package, LogOut, LayoutDashboard } from "lucide-react"

export function UserMenu({ user }: { user: any }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 border border-gray-700">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 border-gray-800 bg-black/95 text-white backdrop-blur-xl" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-gray-400">{user.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-800" />
                {user.role === "ADMIN" && (
                    <DropdownMenuItem asChild className="focus:bg-purple-500/20 focus:text-purple-400 cursor-pointer">
                        <Link href="/admin" className="flex w-full items-center">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Admin Dashboard</span>
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild className="focus:bg-green-500/20 focus:text-green-400 cursor-pointer">
                    <Link href="/shop/orders" className="flex w-full items-center">
                        <Package className="mr-2 h-4 w-4" />
                        <span>My Orders</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-blue-500/20 focus:text-blue-400 cursor-pointer">
                    <Link href="/settings" className="flex w-full items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem className="focus:bg-red-500/20 focus:text-red-400 cursor-pointer">
                    <form action={handleSignOut} className="w-full">
                        <button className="flex w-full items-center">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </button>
                    </form>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
