export interface YouTubePlayer {
    destroy: () => void;
    getDuration: () => number;
    getCurrentTime: () => number;
    getPlayerState: () => number;
    pauseVideo: () => void;
    playVideo: () => void;
    seekTo: (seconds: number) => void;
}

export interface YouTubeEvent {
    data: number;
    target: YouTubePlayer;
}

declare global {
    interface Window {
        YT: {
            Player: new (
                element: HTMLElement,
                options: {
                    videoId: string;
                    playerVars: Record<string, number>;
                    events: {
                        onReady: () => void;
                        onStateChange: (event: YouTubeEvent) => void;
                    };
                },
            ) => YouTubePlayer;
            PlayerState: {
                PLAYING: number;
                PAUSED: number;
                ENDED: number;
                BUFFERING: number;
                CUED: number;
                UNSTARTED: number;
            };
        };
        onYouTubeIframeAPIReady: () => void;
    }
}
