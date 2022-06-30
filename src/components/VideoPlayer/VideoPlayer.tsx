import { Component, createSignal, onMount, onCleanup } from 'solid-js'
import { PlayPauseIcon, MiniPlayerIcon, TheaterIcon, FullScreenIcon } from './VideoPlayerIcons'

import './VideoPlayer.css'

export interface VideoPlayerProps {
	src: string
}

const VideoPlayer: Component<VideoPlayerProps> = (props: VideoPlayerProps) => {
	let video: HTMLVideoElement | undefined

	const [paused, setPaused] = createSignal(true)
	const [miniPlayer, setMiniPlayer] = createSignal(false)
	const [theater, setTheater] = createSignal(false)
	const [fullScreen, setFullScreen] = createSignal(false)

	const togglePlay = () => {
		video!.paused ? video!.play() : video!.pause()
	}
	const toggleMiniPlayer = () => {
		setMiniPlayer(!miniPlayer())
	}
	const toggleTheaterMode = () => {
		setFullScreen(false)
		setTheater(!theater())
	}
	const toggleFullScreenMode = () => {
		if (document.fullscreenElement === null) {
			video?.requestFullscreen()
		} else {
			document.exitFullscreen()
		}
	}

	onMount(() => {
		document.addEventListener('keydown', e => {
			switch (e.key.toLowerCase()) {
				case ' ':
				case 'k':
					togglePlay()
					break
			}
		})
		document.addEventListener('fullscreenchange', () => {
			// setTheater(false)
			setFullScreen(document.fullscreenElement !== null)
		})
		video!.addEventListener('click', () => togglePlay())
		video!.addEventListener('play', () => setPaused(false))
		video!.addEventListener('pause', () => setPaused(true))
	})

	onCleanup(() => {
		document.removeEventListener('keydown', e => {})
		video!.removeEventListener('click', () => togglePlay())
		video!.removeEventListener('play', () => setPaused(false))
		video!.removeEventListener('paused', () => setPaused(false))
	})

	return (
		<div class='video-container' classList={{ paused: paused(), theater: theater(), 'full-screen': fullScreen() }}>
			<div class='video-controls-container'>
				<div class='timeline-container'></div>
				<div class='controls'>
					<button class='play-pause-btn' onClick={togglePlay}>
						{PlayPauseIcon}
					</button>
					<button class='mini-player-btn' onClick={toggleMiniPlayer}>
						{MiniPlayerIcon}
					</button>
					<button class='theater-btn' onClick={toggleTheaterMode}>
						{TheaterIcon}
					</button>
					<button class='full-screen-btn' onClick={toggleFullScreenMode}>
						{FullScreenIcon}
					</button>
				</div>
			</div>
			<video ref={video} src={props.src}></video>
		</div>
	)
}

export default VideoPlayer
