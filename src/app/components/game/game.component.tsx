'use client'

import { useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfo } from '@fortawesome/free-solid-svg-icons'

import './game.component.css'

type GameState = "playing" | "paused" | "stopped" | "finished"

type GameProps = {
    gameNumber: number
    roundNumber: number
    gameState: GameState
    currentColour: string
    divergentColour: string
    columnCount: number
    rowCount: number
    itemCount: number
    divergentIndex: number
    time: number
}

export default function Game() {
    const [state, setState] = useState<GameProps>({
        gameNumber: 0,
        roundNumber: 0,
        gameState: "stopped",
        currentColour: "black",
        divergentColour: "green",
        columnCount: 2,
        rowCount: 2,
        itemCount: 4,
        divergentIndex: 0,
        time: 0
    })

    const [timer, setTimer] = useState<NodeJS.Timeout>()

    const successRef: any = useRef()
    const failRef: any = useRef()

    //Manage sounds
    const playSuccess = () => {
        if (successRef.current) {
            const current: HTMLAudioElement = successRef.current
            current.pause()
            current.currentTime = 0
            current.play()
        }
    }

    const playFail = () => {
        if (failRef.current) {
            const current: HTMLAudioElement = failRef.current
            current.volume = 0.3
            current.pause()
            current.currentTime = 0
            current.play()
        }
    }

    //Manage methods for rendering the game when playing
    const renderPlaying = (): JSX.Element => {
        const gridCols: { [index: number]: string } = {
            2: `grid-cols-2`,
            3: `grid-cols-3`,
            4: `grid-cols-4`,
            5: `grid-cols-5`
        }

        const className = `grid ${gridCols[state.columnCount]} gap-4 items-center justify-center`

        const items: JSX.Element[] = []
        for (let i = 0; i < state.itemCount; i++) {
            const key = `item-${i}`
            items.push(<div key={key} className="colour-item" style={{ backgroundColor: i == state.divergentIndex ? state.divergentColour : state.currentColour }} onClick={() => { clickItem(i) }}></div>)
        }

        return (
            <div className="flex flex-1 flex-col items-center justify-between min-h-full">
                <div className="flex items-center justify-between w-full">
                    <div className="flex-1"></div>
                    <div className='my-5 flex flex-1 flex-col items-center'>
                        <div className="text-slate-800 font-light">GAME {state.gameNumber}</div>
                        <div className='text-lg'>ROUND {state.roundNumber}</div>
                        <div className="text-red-400 font-semibold">TIME {state.time}</div>
                    </div>
                    <div className="flex-1 flex justify-end my-10">
                        <div className="icon-button" onClick={pauseGame}>
                            <FontAwesomeIcon icon={faInfo} />
                        </div>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className={className}>
                        {items}
                    </div>
                </div>
            </div>
        )
    }

    const clickItem = (index: number) => {
        if (index == state.divergentIndex) {
            playSuccess()

            const tState = { ...state }
            nextRound(tState)

            setState(tState)
        } else {
            playFail()

            clearInterval(timer)
            const tState = { ...state }

            tState.gameState = "finished"

            setState(tState)
        }
    }

    const pauseGame = () => {
        console.log(`Pausing Game`)
        const tState = { ...state }

        tState.gameState = "paused"

        setState(tState)
    }

    //Manage methods for rendering the game when paused
    const renderPaused = (): JSX.Element => {
        return (
            <div className="flex flex-col flex-1 justify-center items-center">
                <div className="m-10">Play the game by clicking on the odd one out!</div>
                <div className="button" onClick={startGame}>Restart</div>
                <div className="button" onClick={resumeGame}>Resume</div>
            </div>
        )
    }

    const resumeGame = () => {
        console.log(`Resuming Game`)
        const tState = { ...state }

        tState.gameState = "playing"

        setState(tState)
    }

    //Manage methods for rendering the game when game has yet to start
    const renderStopped = (): JSX.Element => {
        return (
            <div className="flex flex-col flex-1 justify-center items-center">
                <div className="m-10">Play the game by clicking on the odd one out!</div>
                <div className="button" onClick={startGame}>Start</div>
            </div>
        )
    }

    const startGame = () => {
        console.log(`Starting Game`)
        const tState = { ...state }

        tState.gameNumber++
        tState.roundNumber = 0
        tState.gameState = "playing"
        tState.time = 0

        nextRound(tState)
        setState(tState)

        setTimer(setInterval(() => {
            setState((state) => { return { ...state, time: Math.round((state.time + 0.1) * 100) / 100 } })
        }, 100))
        console.log(timer)
    }

    //Manage methods for rendering the game when finished
    const renderFinished = (): JSX.Element => {
        return (
            <div className="flex flex-col flex-1 justify-center items-center">
                <div className="uppercase m-5 text-lg">Congratulations</div>
                <div className="m-10">You got through {state.roundNumber - 1} rounds in {state.time} seconds!</div>
                <div className="button m-10" onClick={startGame}>Restart</div>
            </div>
        )
    }

    const nextRound = (tState: GameProps) => {
        console.log(`Incrementing Round`)

        tState.roundNumber++

        //Determine the random colour
        let r = Math.floor(Math.random() * 180) + 10
        let g = Math.floor(Math.random() * 180) + 10
        let b = Math.floor(Math.random() * 180) + 10

        const divergence = tState.roundNumber < 4 ? 0.4 : tState.roundNumber < 7 ? 0.3 : tState.roundNumber < 10 ? 0.2 : 0.1

        const divergenceLighter = Math.floor(Math.random() * 2) - 1

        tState.currentColour = divergenceLighter ? `rgba(${r},${g},${b},${1 - divergence})` : `rgb(${r},${g},${b})`
        tState.divergentColour = divergenceLighter ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${1 - divergence})`

        //Determine the grid size based on the rounds passed
        tState.columnCount = tState.roundNumber < 4 ? 2 : tState.roundNumber < 7 ? 3 : tState.roundNumber < 10 ? 4 : 5
        tState.rowCount = tState.columnCount
        tState.itemCount = tState.columnCount * tState.rowCount

        tState.divergentIndex = Math.floor(Math.random() * tState.itemCount)
    }

    //Render the component
    //Type-safe way of rendering the game based on the state
    const whichRender: Record<GameState, () => JSX.Element> = {
        "playing": renderPlaying,
        "paused": renderPaused,
        "stopped": renderStopped,
        "finished": renderFinished
    }

    const game = whichRender[state.gameState]()

    return (
        <div className="flex border-solid border-2 border-black shadow shadow-black rounded-md flex-1 w-full">
            <audio ref={successRef} src="/colour-clicker/success_bell.mp3"></audio>
            <audio ref={failRef} src="/colour-clicker/fail.mp3"></audio>
            {game}
        </div>
    )
}