import type { Component } from 'solid-js'
import VideoPlayer, { VideoPlayerOptions } from './components/VideoPlayer/VideoPlayer'

const App: Component = () => {
	const options: VideoPlayerOptions = {
		src: 'src/assets/Video.mp4',
		captions: true,
		playSpeed: true,
		fullScreenMode: true,
		miniPlayerMode: true,
		theaterMode: true,
	}

	return <VideoPlayer {...options} />
}

export default App
