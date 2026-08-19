import { useState } from 'react'
import ArcadeCabinet from './components/ArcadeCabinet.jsx'
import CRTScreen from './components/CRTScreen.jsx'
import AttractScreen from './components/AttractScreen.jsx'
import SlotReels from './components/SlotReels.jsx'
import MissionPanel from './components/MissionPanel.jsx'
import WildcardModal from './components/WildcardModal.jsx'
import UnlockModal from './components/UnlockModal.jsx'
import PetGallery from './components/PetGallery.jsx'
import { PETS } from './data/pets.js'
import { useGame } from './hooks/useGame.js'
import { play } from './lib/audio.js'

export default function App() {
  const game = useGame()
  const { state } = game
  const [rolling, setRolling] = useState(false)
  const [wildcardOpen, setWildcardOpen] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false)

  const handleInsertCoin = () => {
    play('coin', [15, 30, 15])
    play('lever', 0)
    game.insertCoin()
    setRolling(true)
  }

  const handleToggle = (index) => {
    play(state.missions[index]?.done ? 'uncheck' : 'check', 18)
    game.toggle(index)
  }

  const handleReroll = (index) => {
    play('reroll', 12)
    game.reroll(index)
  }

  const showAttract = !state.coinInserted
  const showReels = state.coinInserted && rolling

  return (
    <main className="min-h-dvh bg-crt-950">
      <ArcadeCabinet
        muted={state.muted}
        unlockedCount={state.unlocked.length}
        totalPets={PETS.length}
        onToggleMute={() => {
          game.setMuted(!state.muted)
          if (state.muted) play('blip')
        }}
        onOpenGallery={() => {
          play('select')
          setGalleryOpen(true)
        }}
      >
        <CRTScreen>
          {showAttract ? (
            <AttractScreen state={state} onInsertCoin={handleInsertCoin} />
          ) : showReels ? (
            <SlotReels missions={state.missions} onDone={() => setRolling(false)} />
          ) : (
            <MissionPanel
              state={state}
              done={game.done}
              dayComplete={game.dayComplete}
              onToggle={handleToggle}
              onReroll={handleReroll}
              onWildcard={() => {
                play('select')
                setWildcardOpen(true)
              }}
            />
          )}
        </CRTScreen>
      </ArcadeCabinet>

      {wildcardOpen && (
        <WildcardModal
          onClose={() => setWildcardOpen(false)}
          onComplete={() => {
            game.useWildcard()
            setWildcardOpen(false)
          }}
        />
      )}

      {galleryOpen && (
        <PetGallery unlocked={state.unlocked} onClose={() => setGalleryOpen(false)} />
      )}

      {game.celebrating && (
        <UnlockModal pet={game.celebrating} onClose={game.dismissCelebration} />
      )}
    </main>
  )
}
