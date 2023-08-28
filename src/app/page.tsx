import Game from './components/game/game.component'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-2 md:p-24">
      <Game></Game>
    </main>
  )
}
