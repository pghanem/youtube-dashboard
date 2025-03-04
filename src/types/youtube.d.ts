// Necessary for Vercel to find the YT namespace
/* eslint-disable @typescript-eslint/no-explicit-any */

declare namespace YT {
	interface Player {
		cueVideoById: (videoId: string) => void;
		loadVideoById: (videoId: string) => void;
		playVideo: () => void;
		pauseVideo: () => void;
		stopVideo: () => void;
		seekTo: (seconds: number, allowSeekAhead: boolean) => void;
		getCurrentTime: () => number;
		getDuration: () => number;
		getPlayerState: () => number;
		destroy: () => void;
	}

	interface PlayerOptions {
		videoId?: string;
		width?: number | string;
		height?: number | string;
		playerVars?: {
			autoplay?: 0 | 1;
			controls?: 0 | 1 | 2;
			disablekb?: 0 | 1;
			enablejsapi?: 0 | 1;
			fs?: 0 | 1;
			iv_load_policy?: 1 | 3;
			modestbranding?: 0 | 1;
			playsinline?: 0 | 1;
			rel?: 0 | 1;
			showinfo?: 0 | 1;
			start?: number;
			end?: number;
		};
		events?: {
			onReady?: (event: any) => void;
			onStateChange?: (event: OnStateChangeEvent) => void;
			onPlaybackQualityChange?: (event: any) => void;
			onPlaybackRateChange?: (event: any) => void;
			onError?: (event: any) => void;
			onApiChange?: (event: any) => void;
		};
	}

	interface OnStateChangeEvent {
		data: number;ts
		target: Player;
	}

	const PlayerState: {
		UNSTARTED: number;
		ENDED: number;
		PLAYING: number;
		PAUSED: number;
		BUFFERING: number;
		CUED: number;
	};
}

interface Window {
	YT: {
		Player: new (
			elementId: string | HTMLElement,
			options: YT.PlayerOptions
		) => YT.Player;
		PlayerState: {
			UNSTARTED: number;
			ENDED: number;
			PLAYING: number;
			PAUSED: number;
			BUFFERING: number;
			CUED: number;
		};
	};
	onYouTubeIframeAPIReady: () => void;
}