import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface VisualEffectsState {
    soundEffects: boolean
    weatherEffects: boolean // Controls "Visual Effects" -> "Weather Effects" sub-toggle
    generalVisualEffects: boolean // Controls "Visual Effects" -> "General Effects" sub-toggle
    enhancedGameEffects: boolean
    winEffects: boolean
    notifications: boolean

    // Volume Controls
    generalVolume: number
    gamesVolume: number
    soundtrackVolume: number

    toggleSoundEffects: () => void
    toggleWeatherEffects: () => void
    toggleGeneralVisualEffects: () => void
    toggleEnhancedGameEffects: () => void
    toggleWinEffects: () => void
    toggleNotifications: () => void

    setGeneralVolume: (volume: number) => void
    setGamesVolume: (volume: number) => void
    setSoundtrackVolume: (volume: number) => void
    resetSoundToDefault: () => void
}

export const useVisualEffectsStore = create<VisualEffectsState>()(
    persist(
        (set) => ({
            soundEffects: false,
            weatherEffects: true,
            generalVisualEffects: true,
            enhancedGameEffects: true,
            winEffects: true,
            notifications: false,

            generalVolume: 10,
            gamesVolume: 50,
            soundtrackVolume: 1,

            toggleSoundEffects: () => set((state) => ({ soundEffects: !state.soundEffects })),
            toggleWeatherEffects: () => set((state) => ({ weatherEffects: !state.weatherEffects })),
            toggleGeneralVisualEffects: () => set((state) => ({ generalVisualEffects: !state.generalVisualEffects })),
            toggleEnhancedGameEffects: () => set((state) => ({ enhancedGameEffects: !state.enhancedGameEffects })),
            toggleWinEffects: () => set((state) => ({ winEffects: !state.winEffects })),
            toggleNotifications: () => set((state) => ({ notifications: !state.notifications })),

            setGeneralVolume: (volume) => set((state) => ({
                generalVolume: volume,
                soundEffects: volume > 0 || state.gamesVolume > 0 || state.soundtrackVolume > 0
            })),
            setGamesVolume: (volume) => set((state) => ({
                gamesVolume: volume,
                soundEffects: state.generalVolume > 0 || volume > 0 || state.soundtrackVolume > 0
            })),
            setSoundtrackVolume: (volume) => set((state) => ({
                soundtrackVolume: volume,
                soundEffects: state.generalVolume > 0 || state.gamesVolume > 0 || volume > 0
            })),
            resetSoundToDefault: () => set({
                generalVolume: 10,
                gamesVolume: 50,
                soundtrackVolume: 1,
                soundEffects: true
            }),
        }),
        {
            name: 'visual-effects-storage',
        }
    )
)
