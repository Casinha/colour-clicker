'use client'

import { useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfo } from '@fortawesome/free-solid-svg-icons'
import $ from "jquery"

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
    failedColours: string[]
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
        time: 0,
        failedColours: []
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
            5: `grid-cols-5`,
            6: `grid-cols-6`
        }

        const className = `grid ${gridCols[state.columnCount]} gap-2 lg:gap-4 items-center justify-center`

        const items: JSX.Element[] = []
        for (let i = 0; i < state.itemCount; i++) {
            const key = `item-${i}`
            items.push(
                <div key={key} className="colour-item w-12 h-12 md:w-16 md:h-16 lg:w-24 lg:h-24 flex items-start justify-center py-5 hover:py-0" style={{ backgroundColor: i == state.divergentIndex ? state.divergentColour : state.currentColour }} onClick={() => { clickItem(i) }}>
                    <div className="eyes hidden lg:block">
                        <div id={`eye-${i}-l`} className="eye"></div>
                        <div id={`eye-${i}-r`} className="eye"></div>
                    </div>
                    <div className="squint w-full h-full">
                        <svg viewBox="00 0 140 69" transform="scale(0.5)">
                            <path d="M132.9,67.3C132.6,67.3,132.3,67.2,132,67.1C112.2,57.8,85.2,63.7,84.9,63.7C84.2,63.9,83.5,63.6,83,63.1C82.5,62.6,82.3,61.9,82.4,61.2C84.6,51.1,112.2,39.3,115.3,38C116.4,37.6,117.6,38.1,118,39.1C118.4,40.2,117.9,41.4,116.9,41.8C107.7,45.7,93.6,53,88.4,58.8C97.2,57.4,117.4,55.6,133.7,63.3C134.7,63.8,135.2,65,134.7,66.1C134.4,66.9,133.7,67.3,132.9,67.3zM8.2,67.1C28,57.8,55,63.7,55.3,63.7C56,63.9,56.7,63.6,57.2,63.1C57.7,62.6,57.9,61.9,57.8,61.2C55.5,51.2,28,39.4,24.8,38.1C23.7,37.7,22.5,38.2,22.1,39.2C21.7,40.3,22.2,41.5,23.2,41.9C32.4,45.8,46.5,53.1,51.7,58.9C42.9,57.5,22.7,55.7,6.4,63.4C5.4,63.9,4.9,65.1,5.4,66.2C5.8,66.9,6.5,67.4,7.3,67.4C7.6,67.3,7.9,67.3,8.2,67.1zM113.9,26.6C113.9,26.6,95.5,21.6,81.5,2.6L79.1,10.1C79.1,10.1,98.2,29.4,113.9,26.6zM59.2,10.1L56.8,2.6C42.8,21.6,24.4,26.6,24.4,26.6C40.2,29.4,59.2,10.1,59.2,10.1z" stroke="white" fill="white" strokeWidth="3"/>
                        </svg>
                    </div>
                </div>
            )
        }

        return (
            <div className="flex flex-1 flex-col items-center justify-between min-h-0 overflow-y-auto px-5" onMouseMove={(event: any) => { mouseMove(event) }}>
                <div className="flex items-center justify-between w-full">
                    <div className="flex-1"></div>
                    <div className='my-5 flex flex-1 flex-col items-center'>
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
            if (state.roundNumber == 30) {
                return completeGame()
            }

            playSuccess()

            const tState = { ...state }
            nextRound(tState)

            return setState(tState)
        }

        playFail()

        clearInterval(timer)
        const tState = { ...state }

        tState.failedColours.push(state.currentColour)
        tState.gameState = "finished"

        setState(tState)
    }

    const pauseGame = () => {
        console.log(`Pausing Game`)
        const tState = { ...state }

        tState.gameState = "paused"

        setState(tState)
    }

    const mouseMove = (event: MouseEvent) => {
        var eyes = $(".eye");

        eyes.each((i, eye) => {
            var x = ($(eye).offset()!.left) + ($(eye).width()! / 2);
            var y = ($(eye).offset()!.top) + ($(eye).height()! / 2);
            var rad = Math.atan2(event.pageX - x, event.pageY - y);
            var rot = (rad * (180 / Math.PI) * -1) + 180;
            $(eye).css({
                '-webkit-transform': 'rotate(' + rot + 'deg)',
                '-moz-transform': 'rotate(' + rot + 'deg)',
                '-ms-transform': 'rotate(' + rot + 'deg)',
                'transform': 'rotate(' + rot + 'deg)'
            });
        })
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
        const tState = { ...state }

        tState.gameNumber++
        tState.roundNumber = 0
        tState.gameState = "playing"
        tState.time = 0

        nextRound(tState)
        setState(tState)

        setTimer(setInterval(() => {
            setState((state) => { return state.gameState == "playing" ? { ...state, time: Math.round((state.time + 0.1) * 100) / 100 } : state })
        }, 100))
    }

    const completeGame = () => {
        clearInterval(timer)
        const tState = { ...state }

        tState.roundNumber++;
        tState.gameState = "finished"

        setState(tState)
    }

    //Manage methods for rendering the game when finished
    const renderFinished = (): JSX.Element => {
        const troubleColourElements: JSX.Element[] = []

        for (let i = 0; i < state.failedColours.length; i++) {
            const failedColour = state.failedColours[i]
            troubleColourElements.push(
                <div key={`trouble-colour-${i}`} className="w-11 h-11 md:w-16 md:h-16 lg:w-24 lg:h-24" style={{ backgroundColor: failedColour }}></div>)
        }

        return (
            <div className="flex flex-col flex-1 justify-center items-center">
                <div className='flex-1 flex flex-col items-center justify-center'>
                    <div className="uppercase m-5 text-lg">Congratulations</div>
                    <div className="m-10">You got through {state.roundNumber - 1} rounds in {state.time} seconds!</div>
                    <div className="button m-10" onClick={startGame}>Restart</div>
                </div>
                <div className="flex-1 flex flex-col items-center min-h-0">
                    <div>Swatch:</div>
                    <div className="flex flex-wrap justify-start mx-10 md:max-w-lg overflow-y-auto">
                        {troubleColourElements}
                    </div>
                </div>
            </div>
        )
    }

    const nextRound = (tState: GameProps) => {
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
        tState.columnCount = tState.roundNumber < 4 ? 2 : tState.roundNumber < 7 ? 3 : tState.roundNumber < 10 ? 4 : tState.roundNumber < 20 ? 5 : 6
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
        <div className="flex border-solid border-2 border-black shadow shadow-black rounded-md flex-1 w-full min-h-0">
            <audio ref={successRef} src="./success_bell.mp3"></audio>
            <audio ref={failRef} src="./fail.mp3"></audio>
            {game}
        </div>
    )
}