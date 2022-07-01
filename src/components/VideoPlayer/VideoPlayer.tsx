import { Component, createSignal, onMount, Show } from 'solid-js'
import { PlayIcon, MuteIcon, ClosedCaptionIcon, MiniPlayerIcon, TheaterIcon, FullScreenIcon } from './VideoPlayerIcons'

import './VideoPlayer.css'

export interface VideoPlayerProps {
	src: string
}

export enum VolumeLevels {
	LOW = 'low',
	HIGH = 'high',
	MUTED = 'muted',
}

const VideoPlayer: Component<VideoPlayerProps> = (props: VideoPlayerProps) => {
	let video: HTMLVideoElement | undefined
	let videoContainer: HTMLDivElement | undefined

	const [paused, setPaused] = createSignal(true)
	const [caption, setCaption] = createSignal(false)
	const [miniPlayer, setMiniPlayer] = createSignal(false)
	const [theater, setTheater] = createSignal(false)
	const [fullScreen, setFullScreen] = createSignal(false)
	const [volume, setVolume] = createSignal(0.5)
	const [volumeLevel, setVolumeLevel] = createSignal(VolumeLevels.HIGH)
	const [currentTime, setCurrentTime] = createSignal(0)
	const [totalTime, setTotalTime] = createSignal(0)

	const togglePlay = () => {
		video!.paused ? video!.play() : video!.pause()
	}

	const toggleMute = () => {
		video!.muted = !video!.muted
	}

	const volumeChange = (e: Event) => {
		video!.volume = parseFloat((e.target as HTMLInputElement).value)
		video!.muted = (e.target as HTMLInputElement).value === '0'
		setVolume(video!.volume)
	}

	const toggleCaption = () => {
		setCaption(!caption())
	}

	const toggleTheaterMode = () => {
		setFullScreen(false)
		setTheater(!theater())
	}

	const toggleFullScreenMode = () => {
		if (document.fullscreenElement) {
			document.exitFullscreen()
		} else {
			video?.requestFullscreen()
		}
	}

	const toggleMiniPlayerMode = () => {
		if (document.pictureInPictureElement) {
			document.exitPictureInPicture()
		} else {
			if (document.pictureInPictureEnabled) video?.requestPictureInPicture()
		}
	}

	const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
		minimumIntegerDigits: 2,
	})

	const formatDuration = (time: number) => {
		const seconds = Math.floor(time % 60)
		const minutes = Math.floor(time / 60) % 60
		const hours = Math.floor(time / 3600)
		if (hours === 0) {
			return `${minutes}:${leadingZeroFormatter.format(seconds)}`
		} else {
			return `${hours}:${leadingZeroFormatter.format(minutes)}:${leadingZeroFormatter.format(seconds)}`
		}
	}

	const skip = (seconds: number) => {
		video!.currentTime += seconds
	}

	onMount(() => {
		document.addEventListener('keydown', e => {
			const tagName = document.activeElement?.tagName.toLowerCase()

			if (tagName === 'input') return

			switch (e.key.toLowerCase()) {
				case ' ':
					if (tagName === 'button') return
				case 'k':
					togglePlay()
					break
				case 'f':
					toggleFullScreenMode()
					break
				case 't':
					toggleTheaterMode()
					break
				case 'i':
					toggleMiniPlayerMode()
					break
				case 'm':
					toggleMute()
					break
				case 'arrowleft':
				case 'j':
					skip(-5)
					break
				case 'arrowright':
				case 'l':
					skip(5)
					break
			}
		})
		document.addEventListener('fullscreenchange', () => {
			setMiniPlayer(false)
			setTheater(false)
			setFullScreen(document.fullscreenElement !== null)
		})
		video?.addEventListener('loadeddata', () => {
			setTotalTime(video!.duration)
		})
		video?.addEventListener('timeupdate', () => {
			setCurrentTime(video!.currentTime)
		})
		video?.addEventListener('click', () => togglePlay())
		video?.addEventListener('play', () => setPaused(false))
		video?.addEventListener('pause', () => setPaused(true))
		video?.addEventListener('enterpictureinpicture', () => setMiniPlayer(true))
		video?.addEventListener('leavepictureinpicture', () => setMiniPlayer(false))
	})

	return (
		<div
			ref={videoContainer}
			class='video-container'
			classList={{
				paused: paused(),
				'mini-player': miniPlayer(),
				theater: theater(),
				'full-screen': fullScreen(),
				caption: caption(),
			}}
			data-volume-level={volumeLevel().valueOf()}>
			<div class='video-controls-container'>
				<div class='timeline-container'></div>
				<div class='controls'>
					<button class='play-pause-btn' onClick={togglePlay}>
						{PlayIcon}
					</button>
					<div class='volume-container'>
						<button class='mute-btn' onClick={toggleMute}>
							{MuteIcon}
						</button>
						<input
							class='volume-slider'
							type='range'
							min='0'
							max='1'
							step='any'
							value={volume()}
							onChange={volumeChange}></input>
					</div>
					<div class='duration-container'>
						<div class='current-time'>{formatDuration(currentTime())}</div>/
						<div class='total-time'>{formatDuration(totalTime())}</div>
					</div>
					<button class='closed-caption-btn' onClick={toggleCaption}>
						{ClosedCaptionIcon}
					</button>
					<Show when={document.pictureInPictureEnabled}>
						<button class='mini-player-btn' onClick={toggleMiniPlayerMode}>
							{MiniPlayerIcon}
						</button>
					</Show>
					<button class='theater-btn' onClick={toggleTheaterMode}>
						{TheaterIcon}
					</button>
					<button class='full-screen-btn' onClick={toggleFullScreenMode}>
						{FullScreenIcon}
					</button>
				</div>
			</div>
			<video
				ref={video}
				src={props.src}
				onVolumeChange={e => {
					video!.volume = volume()
					if (video!.muted || video!.volume === 0) {
						setVolumeLevel(VolumeLevels.MUTED)
					} else if (video!.volume >= 0.5) {
						setVolumeLevel(VolumeLevels.HIGH)
					} else {
						setVolumeLevel(VolumeLevels.LOW)
					}
				}}>
				<track kind='captions' srclang='en' src='src/assets/subtitles.vtt'></track>
			</video>
		</div>
	)
}

export default VideoPlayer
