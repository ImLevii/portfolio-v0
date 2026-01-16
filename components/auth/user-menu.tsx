
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
import { User, Package, LogOut, LayoutDashboard, Key } from "lucide-react"

export function UserMenu({ user }: { user: any }) {
    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-white/20 transition-all duration-300">
                    <Avatar className="h-9 w-9 border-2 border-gray-700/50">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback className="bg-gray-800 text-white font-orbitron font-bold">{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-64 border-gray-800/50 bg-black/95 text-white backdrop-blur-xl p-2"
                align="end"
                forceMount
                style={{
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5), 0 0 20px -5px rgba(34,197,94,0.1)'
                }}
            >
                <DropdownMenuLabel className="font-normal p-3">
                    <div className="flex flex-col space-y-1.5">
                        <p className="text-sm font-bold leading-none font-orbitron tracking-wide text-white">{user.name}</p>
                        <p className="text-xs leading-none text-gray-400 font-mono">{user.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-800/50 my-2" />
                {user.role === "ADMIN" && (
                    <DropdownMenuItem asChild className="focus:bg-purple-500/10 focus:text-purple-400 cursor-pointer rounded-lg my-1 group">
                        <Link href="/admin" className="flex w-full items-center py-2">
                            <LayoutDashboard className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
                            <span className="font-orbitron text-xs tracking-wide">Admin Dashboard</span>
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild className="focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer rounded-lg my-1 group">
                    <Link href="/licenses" className="flex w-full items-center py-2">
                        <Key className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
                        <span className="font-orbitron text-xs tracking-wide">My Licenses</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-green-500/10 focus:text-green-400 cursor-pointer rounded-lg my-1 group">
                    <Link href="/shop/orders" className="flex w-full items-center py-2">
                        <Package className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
                        <span className="font-orbitron text-xs tracking-wide">My Orders</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-blue-500/10 focus:text-blue-400 cursor-pointer rounded-lg my-1 group">
                    <Link href="/settings" className="flex w-full items-center py-2">
                        <User className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
                        <span className="font-orbitron text-xs tracking-wide">Settings</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-800/50 my-2" />
                <DropdownMenuItem className="focus:bg-red-500/10 focus:text-red-400 cursor-pointer rounded-lg my-1 group">
                    <form action={handleSignOut} className="w-full">
                        <button className="flex w-full items-center py-2">
                            <LogOut className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
                            <span className="font-orbitron text-xs tracking-wide">Log out</span>
                        </button>
                    </form>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
