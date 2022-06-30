import type { Component } from 'solid-js'
import VideoPlayer from './components/VideoPlayer/VideoPlayer'

const App: Component = () => {
	return <VideoPlayer src='src/assets/Video.mp4' />
}

export default App
