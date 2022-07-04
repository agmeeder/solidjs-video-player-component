/**
 * This Solid-JS Video Player Component is based on the excelent video https://youtu.be/ZeNyjnneq_w by Web Dev Simplified.
 */
import { Component, createSignal, onMount, Show } from 'solid-js'
import { PlayIcon, MuteIcon, ClosedCaptionIcon, MiniPlayerIcon, TheaterIcon, FullScreenIcon } from './VideoPlayerIcons'

import './VideoPlayer.css'

export interface VideoPlayerOptions {
	src?: string
	captions?: boolean
	playSpeed?: boolean
	miniPlayerMode?: boolean
	theaterMode?: boolean
	fullScreenMode?: boolean
}

export enum VolumeLevels {
	LOW = 'low',
	HIGH = 'high',
	MUTED = 'muted',
}

const defaultOptions: VideoPlayerOptions = {
	fullScreenMode: true,
	miniPlayerMode: true,
	theaterMode: true,
}

const VideoPlayer: Component<VideoPlayerOptions> = (options: VideoPlayerOptions = { ...defaultOptions }) => {
	let video: HTMLVideoElement | undefined
	let videoContainer: HTMLDivElement | undefined
	let previewImg: HTMLImageElement | undefined
	let thumbnailImg: HTMLImageElement | undefined
	let timelineContainer: HTMLDivElement | undefined

	const [paused, setPaused] = createSignal(true)
	const [wasPaused, setWasPaused] = createSignal(false)
	const [caption, setCaption] = createSignal(false)
	const [playbackRate, setPlaybackRate] = createSignal(1)
	const [miniPlayer, setMiniPlayer] = createSignal(false)
	const [theater, setTheater] = createSignal(false)
	const [fullScreen, setFullScreen] = createSignal(false)
	const [volume, setVolume] = createSignal(0.5)
	const [volumeLevel, setVolumeLevel] = createSignal(VolumeLevels.HIGH)
	const [currentTime, setCurrentTime] = createSignal(0)
	const [totalTime, setTotalTime] = createSignal(0)
	const [scrubbing, setScrubbing] = createSignal(false)

	const togglePlay = () => {
		video!.paused ? video!.play() : video!.pause()
	}

	const toggleMute = () => {
		video!.muted = !video!.muted
		if (video!.muted) {
			setVolumeLevel(VolumeLevels.MUTED)
		} else if (volume() >= 0.5) {
			setVolumeLevel(VolumeLevels.HIGH)
		} else {
			setVolumeLevel(VolumeLevels.LOW)
		}
	}

	const volumeChange = (e: Event) => {
		const newVolume = parseFloat((e.target as HTMLInputElement).value)

		if (newVolume === 0) {
			toggleMute()
		} else {
			if (video!.muted) toggleMute()
			setVolume(newVolume)

			if (newVolume >= 0.5) {
				setVolumeLevel(VolumeLevels.HIGH)
			} else {
				setVolumeLevel(VolumeLevels.LOW)
			}

			video!.volume = newVolume
		}
	}

	const toggleCaption = () => {
		if (options.captions) {
			const isHidden = video!.textTracks[0].mode === 'hidden'
			video!.textTracks[0].mode = isHidden ? 'showing' : 'hidden'
			setCaption(isHidden)
		}
	}

	const changePlaybackSpeed = () => {
		setPlaybackRate(playbackRate() + 0.25)
		if (playbackRate() > 2) setPlaybackRate(0.25)
		video!.playbackRate = playbackRate()
	}

	const toggleTheaterMode = () => {
		if (options.theaterMode) {
			setFullScreen(false)
			setTheater(!theater())
		}
	}

	const toggleFullScreenMode = () => {
		if (document.fullscreenElement) {
			document.exitFullscreen()
		} else {
			video?.requestFullscreen()
		}
	}

	const toggleMiniPlayerMode = () => {
		if (options.miniPlayerMode) {
			if (document.pictureInPictureElement) {
				document.exitPictureInPicture()
			} else {
				if (document.pictureInPictureEnabled) video?.requestPictureInPicture()
			}
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

	const toggleScrubbing = (e: MouseEvent) => {
		const rect = timelineContainer!.getBoundingClientRect()
		const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width
		setScrubbing((e.buttons & 1) === 1)

		if (scrubbing()) {
			setWasPaused(video!.paused)
			video!.pause()
		} else {
			video!.currentTime = percent * video!.duration
			if (!wasPaused()) video!.play()
		}

		handleTimelineUpdate(e)
	}

	const handleTimelineUpdate = (e: MouseEvent) => {
		const rect = timelineContainer!.getBoundingClientRect()
		const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width
		const previewImgNumber = Math.max(1, Math.floor((percent * video!.duration) / 10))
		const previewImgSrc = `src/assets/previewImgs/preview${previewImgNumber}.jpg`
		previewImg!.src = previewImgSrc
		timelineContainer!.style.setProperty('--preview-position', percent.toString())

		if (scrubbing()) {
			e.preventDefault()
			thumbnailImg!.src = previewImgSrc
			timelineContainer!.style.setProperty('--progress-position', percent.toString())
		}
	}

	onMount(() => {
		video!.textTracks[0].mode = 'hidden'
		setPlaybackRate(video!.playbackRate)

		document.addEventListener('keydown', e => {
			const tagName = document.activeElement?.tagName.toLowerCase()

			if (tagName === 'input') return

			switch (e.key.toLowerCase()) {
				case ' ':
					if (tagName === 'button') return
				case 'k':
					togglePlay()
					break
				case 'c':
					toggleCaption()
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
		document.addEventListener('mouseup', e => {
			if (scrubbing()) toggleScrubbing(e)
		})
		document.addEventListener('mousemove', e => {
			if (scrubbing()) handleTimelineUpdate(e)
		})

		video?.addEventListener('loadeddata', () => {
			setTotalTime(video!.duration)
		})
		video?.addEventListener('timeupdate', () => {
			setCurrentTime(video!.currentTime)
			const percent = video!.currentTime / video!.duration
			timelineContainer!.style.setProperty('--progress-position', percent.toString())
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
				'mini-player': miniPlayer(),
				'full-screen': fullScreen(),
				paused: paused(),
				theater: theater(),
				caption: caption(),
				scrubbing: scrubbing(),
			}}
			data-volume-level={volumeLevel().valueOf()}>
			<img ref={thumbnailImg} class='thumbnail-img'></img>
			<div class='video-controls-container'>
				<div
					ref={timelineContainer}
					class='timeline-container'
					onmousedown={toggleScrubbing}
					onmousemove={handleTimelineUpdate}>
					<div class='timeline'>
						<img ref={previewImg} class='preview-img'></img>
						<div class='thumb-indicator'></div>
					</div>
				</div>
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
							onChange={e => volumeChange(e)}></input>
					</div>
					<div class='duration-container'>
						<div class='current-time'>{formatDuration(currentTime())}</div>/
						<div class='total-time'>{formatDuration(totalTime())}</div>
					</div>
					<Show when={options.captions}>
						<button class='closed-caption-btn' onClick={toggleCaption}>
							{ClosedCaptionIcon}
						</button>
					</Show>
					<Show when={options.playSpeed}>
						<button class='speed-btn wide-btn' onClick={changePlaybackSpeed}>
							{`${playbackRate()}x`}
						</button>
					</Show>
					<Show when={document.pictureInPictureEnabled && options.miniPlayerMode}>
						<button class='mini-player-btn' onClick={toggleMiniPlayerMode}>
							{MiniPlayerIcon}
						</button>
					</Show>
					<Show when={options.theaterMode}>
						<button class='theater-btn' onClick={toggleTheaterMode}>
							{TheaterIcon}
						</button>
					</Show>
					<Show when={options.fullScreenMode}>
						<button class='full-screen-btn' onClick={toggleFullScreenMode}>
							{FullScreenIcon}
						</button>
					</Show>
				</div>
			</div>
			<video ref={video} src={options.src}>
				<track kind='captions' srclang='en' src='src/assets/subtitles.vtt'></track>
			</video>
		</div>
	)
}

export default VideoPlayer
