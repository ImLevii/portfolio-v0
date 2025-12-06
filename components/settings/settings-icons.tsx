"use client"

import { motion } from "framer-motion"

// Base Terminal Icon Wrapper to ensure consistency
const TerminalIconWrapper = ({
    isActive,
    size,
    children,
    color = isActive ? '#22c55e' : '#64748b'
}: {
    isActive: boolean;
    size: number;
    children: React.ReactNode;
    color?: string;
}) => {
    return (
        <div
            className="relative"
            style={{ width: size, height: size }}
        >
            {/* Main terminal screen */}
            <div
                className="absolute inset-0 rounded-sm border border-current transition-colors duration-300"
                style={{
                    color: color,
                    backgroundColor: isActive ? `${color}1A` : 'rgba(100, 116, 139, 0.1)', // 1A = 10% opacity
                    boxShadow: isActive
                        ? `0 0 8px ${color}99, inset 0 0 4px ${color}33` // 99 = 60%, 33 = 20%
                        : '0 0 4px rgba(100, 116, 139, 0.3), inset 0 0 2px rgba(100, 116, 139, 0.1)'
                }}
            />

            {/* Terminal header */}
            <div
                className="absolute top-0 left-0 right-0 h-[20%] rounded-t-sm transition-colors duration-300"
                style={{
                    backgroundColor: isActive ? `${color}4D` : 'rgba(100, 116, 139, 0.2)', // 4D = 30%
                    borderBottom: `1px solid ${isActive ? `${color}80` : 'rgba(100, 116, 139, 0.3)'}` // 80 = 50%
                }}
            />

            {/* Terminal dots */}
            <div className="absolute top-[8%] left-[8%] flex gap-[6%]">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="w-[10%] h-[10%] rounded-full aspect-square transition-colors duration-300"
                        style={{ backgroundColor: color }}
                    />
                ))}
            </div>

            {/* Content Container */}
            <div className="absolute top-[25%] left-0 right-0 bottom-0 p-[10%] flex items-center justify-center">
                {children}
            </div>

            {/* Glow effect for active state */}
            {isActive && (
                <div
                    className="absolute inset-0 rounded-sm opacity-30 pointer-events-none"
                    style={{
                        background: `radial-gradient(circle, ${color}66, transparent)`,
                        filter: 'blur(1px)'
                    }}
                />
            )}
        </div>
    )
}

export const SoundIcon = ({ isActive, size = 24 }: { isActive: boolean; size?: number }) => {
    const color = isActive ? '#22c55e' : '#64748b';
    return (
        <TerminalIconWrapper isActive={isActive} size={size} color={color}>
            <div className="flex gap-[15%] items-end justify-center w-full h-full pb-[10%]">
                {/* Audio Bars */}
                <motion.div
                    className="w-[20%] bg-current rounded-sm"
                    style={{ backgroundColor: color }}
                    animate={{ height: isActive ? ['20%', '80%', '40%', '60%', '20%'] : '30%' }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className="w-[20%] bg-current rounded-sm"
                    style={{ backgroundColor: color }}
                    animate={{ height: isActive ? ['60%', '30%', '90%', '40%', '60%'] : '50%' }}
                    transition={{ duration: 0.7, repeat: Infinity, ease: "linear", delay: 0.1 }}
                />
                <motion.div
                    className="w-[20%] bg-current rounded-sm"
                    style={{ backgroundColor: color }}
                    animate={{ height: isActive ? ['40%', '70%', '30%', '80%', '40%'] : '40%' }}
                    transition={{ duration: 0.6, repeat: Infinity, ease: "linear", delay: 0.2 }}
                />
            </div>
        </TerminalIconWrapper>
    )
}

export const VisualIcon = ({ isActive, size = 24 }: { isActive: boolean; size?: number }) => {
    const color = isActive ? '#22c55e' : '#64748b';
    return (
        <TerminalIconWrapper isActive={isActive} size={size} color={color}>
            <div className="relative w-full h-full flex items-center justify-center">
                {/* Mountain/Image shape */}
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" style={{ stroke: color, strokeWidth: 2 }}>
                    <motion.path
                        d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: 1 }}
                    />
                    <motion.path
                        d="m21 15-5.08-5.08a2 2 0 0 0-2.83 0L6 17"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: isActive ? 1 : 0 }}
                        transition={{ duration: 1, repeat: isActive ? Infinity : 0, repeatDelay: 2 }}
                    />
                    <motion.path
                        d="m14.5 12.5 2-2a2 2 0 0 1 2.83 0l1.67 1.67"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: isActive ? 1 : 0 }}
                        transition={{ duration: 1, repeat: isActive ? Infinity : 0, repeatDelay: 2, delay: 0.5 }}
                    />
                </svg>
            </div>
        </TerminalIconWrapper>
    )
}

export const NotificationIcon = ({ isActive, size = 24 }: { isActive: boolean; size?: number }) => {
    const color = isActive ? '#22c55e' : '#64748b';
    return (
        <TerminalIconWrapper isActive={isActive} size={size} color={color}>
            <div className="relative w-full h-full flex items-center justify-center">
                <motion.svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="w-full h-full"
                    style={{ stroke: color, strokeWidth: 2 }}
                    animate={isActive ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
                    transition={{ duration: 0.5, repeat: isActive ? Infinity : 0, repeatDelay: 2 }}
                >
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </motion.svg>
                {isActive && (
                    <motion.div
                        className="absolute top-0 right-0 w-[20%] h-[20%] rounded-full"
                        style={{ backgroundColor: color }}
                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    />
                )}
            </div>
        </TerminalIconWrapper>
    )
}
