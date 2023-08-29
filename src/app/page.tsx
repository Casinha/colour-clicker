import Game from './components/game/game.component'

export default function Home() {
  return (
    <main className="flex-1 h-full flex min-h-0 flex-col items-center justify-between p-2 md:p-10">
      <Game></Game>
    </main>
  )
}
