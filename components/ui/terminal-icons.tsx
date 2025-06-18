"use client"

import { motion } from "framer-motion"

// Custom Demo Icon Component
export const DemoIcon = ({ isActive, size = 16 }: { isActive: boolean; size?: number }) => {
  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
    >
      {/* Main terminal screen */}
      <div 
        className="absolute inset-0 rounded-sm border border-current"
        style={{ 
          color: isActive ? '#ef4444' : '#64748b',
          backgroundColor: isActive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(100, 116, 139, 0.1)',
          boxShadow: isActive 
            ? '0 0 8px rgba(239, 68, 68, 0.6), inset 0 0 4px rgba(239, 68, 68, 0.2)'
            : '0 0 4px rgba(100, 116, 139, 0.3), inset 0 0 2px rgba(100, 116, 139, 0.1)'
        }}
      />
      
      {/* Terminal header */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 rounded-t-sm"
        style={{ 
          backgroundColor: isActive ? 'rgba(239, 68, 68, 0.3)' : 'rgba(100, 116, 139, 0.2)',
          borderBottom: `1px solid ${isActive ? 'rgba(239, 68, 68, 0.5)' : 'rgba(100, 116, 139, 0.3)'}`
        }}
      />
      
      {/* Terminal dots */}
      <div className="absolute top-0.5 left-1 flex gap-0.5">
        <div 
          className="w-0.5 h-0.5 rounded-full"
          style={{ backgroundColor: isActive ? '#ef4444' : '#64748b' }}
        />
        <div 
          className="w-0.5 h-0.5 rounded-full"
          style={{ backgroundColor: isActive ? '#ef4444' : '#64748b' }}
        />
        <div 
          className="w-0.5 h-0.5 rounded-full"
          style={{ backgroundColor: isActive ? '#ef4444' : '#64748b' }}
        />
      </div>
      
      {/* Terminal content lines */}
      <div className="absolute top-2 left-1 right-1 space-y-0.5">
        <div 
          className="h-0.5 rounded-full"
          style={{ 
            backgroundColor: isActive ? 'rgba(239, 68, 68, 0.6)' : 'rgba(100, 116, 139, 0.4)',
            width: '60%'
          }}
        />
        <div 
          className="h-0.5 rounded-full"
          style={{ 
            backgroundColor: isActive ? 'rgba(239, 68, 68, 0.6)' : 'rgba(100, 116, 139, 0.4)',
            width: '80%'
          }}
        />
        <div 
          className="h-0.5 rounded-full"
          style={{ 
            backgroundColor: isActive ? 'rgba(239, 68, 68, 0.6)' : 'rgba(100, 116, 139, 0.4)',
            width: '40%'
          }}
        />
      </div>
      
      {/* Cursor blink effect */}
      {isActive && (
        <motion.div
          className="absolute bottom-1 left-1 w-0.5 h-0.5"
          style={{ backgroundColor: '#ef4444' }}
          animate={{
            opacity: [1, 0, 1],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
      {/* Glow effect for active state */}
      {isActive && (
        <div 
          className="absolute inset-0 rounded-sm opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.4), transparent)',
            filter: 'blur(1px)'
          }}
        />
      )}
    </div>
  )
}

// Custom Interactive Icon Component
export const InteractiveIcon = ({ isActive, size = 16 }: { isActive: boolean; size?: number }) => {
  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
    >
      {/* Main terminal screen */}
      <div 
        className="absolute inset-0 rounded-sm border border-current"
        style={{ 
          color: isActive ? '#22c55e' : '#64748b',
          backgroundColor: isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(100, 116, 139, 0.1)',
          boxShadow: isActive 
            ? '0 0 8px rgba(34, 197, 94, 0.6), inset 0 0 4px rgba(34, 197, 94, 0.2)'
            : '0 0 4px rgba(100, 116, 139, 0.3), inset 0 0 2px rgba(100, 116, 139, 0.1)'
        }}
      />
      
      {/* Terminal header */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 rounded-t-sm"
        style={{ 
          backgroundColor: isActive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(100, 116, 139, 0.2)',
          borderBottom: `1px solid ${isActive ? 'rgba(34, 197, 94, 0.5)' : 'rgba(100, 116, 139, 0.3)'}`
        }}
      />
      
      {/* Terminal dots */}
      <div className="absolute top-0.5 left-1 flex gap-0.5">
        <div 
          className="w-0.5 h-0.5 rounded-full"
          style={{ backgroundColor: isActive ? '#22c55e' : '#64748b' }}
        />
        <div 
          className="w-0.5 h-0.5 rounded-full"
          style={{ backgroundColor: isActive ? '#22c55e' : '#64748b' }}
        />
        <div 
          className="w-0.5 h-0.5 rounded-full"
          style={{ backgroundColor: isActive ? '#22c55e' : '#64748b' }}
        />
      </div>
      
      {/* Interactive prompt */}
      <div className="absolute top-2 left-1 right-1">
        <div className="flex items-center gap-0.5">
          <span 
            className="text-[4px] font-bold"
            style={{ color: isActive ? '#22c55e' : '#64748b' }}
          >
            $
          </span>
          <motion.div
            className="w-0.5 h-1"
            style={{ backgroundColor: isActive ? '#22c55e' : '#64748b' }}
            animate={isActive ? {
              opacity: [1, 0, 1],
              scale: [1, 1.2, 1],
            } : {
              opacity: 0.5
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>
      
      {/* Glow effect for active state */}
      {isActive && (
        <div 
          className="absolute inset-0 rounded-sm opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.4), transparent)',
            filter: 'blur(1px)'
          }}
        />
      )}
    </div>
  )
}

// Terminal Icon Component that switches between Demo and Interactive
export const TerminalIcon = ({ 
  mode, 
  size = 16 
}: { 
  mode: 'demo' | 'interactive'; 
  size?: number 
}) => {
  return mode === 'interactive' ? (
    <InteractiveIcon isActive={true} size={size} />
  ) : (
    <DemoIcon isActive={true} size={size} />
  )
} 