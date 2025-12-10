"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Smile } from "lucide-react"

const EMOJIS = [
    "😀", "😂", "🤣", "😍", "🥰", "😎", "🤔", "😅", "😭", "😱",
    "👍", "👎", "👏", "🙌", "🔥", "✨", "⭐", "💯", "🎉", "🎈",
    "❤️", "💔", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎",
    "👋", "👌", "🤝", "🙏", "💪", "🧠", "💀", "👻", "👽", "🤖"
]

interface SimpleEmojiPickerProps {
    onSelect: (emoji: string) => void
    disabled?: boolean
}

export function SimpleEmojiPicker({ onSelect, disabled }: SimpleEmojiPickerProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" disabled={disabled} className="h-10 w-10 shrink-0 text-zinc-400 hover:text-white hover:bg-zinc-800">
                    <Smile className="h-5 w-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2 bg-[#111] border-zinc-800" side="top" align="center">
                <div className="grid grid-cols-5 gap-1">
                    {EMOJIS.map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => onSelect(emoji)}
                            className="flex h-8 w-8 items-center justify-center rounded hover:bg-zinc-800 text-lg transition-colors"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}
