'use client';

import { YouTubeVideoResult } from '@/types/videoTypes';
import React, { JSX, useEffect, useRef, useState } from 'react';
import { YouTubeEvent, YouTubePlayer } from '@/types/youtube';

interface VideoPlayerProps {
    selectedVideo: YouTubeVideoResult | null;
}

/**
 * VideoPlayer - A YouTube video player component with custom video controls.
 *
 * @param {YouTubeVideoResult | null} selectedVideo - The video object to be played, or null if no video is selected.
 *
 * @returns {JSX.Element} - Returns a video player with custom controls, including play/pause buttons and trim settings.
 */
export default function VideoPlayer({
    selectedVideo,
}: VideoPlayerProps): JSX.Element {
    const playerRef = useRef<YouTubePlayer>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [videoDuration, setVideoDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [trimStart, setTrimStart] = useState(0);
    const [trimEnd, setTrimEnd] = useState(100);
    const [isDragging, setIsDragging] = useState<'left' | 'right' | null>(null);
    const [videoId, setVideoId] = useState<string | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // TODO: Likely more to optimize here. Look into state and hook dependency optimizations.

    useEffect(() => {
        if (!selectedVideo) return;

        const initializePlayer = () => {
            if (!selectedVideo || !playerContainerRef.current) return;

            if (playerRef.current) {
                playerRef.current.destroy();
            }

            playerRef.current = new window.YT.Player(
                playerContainerRef.current,
                {
                    videoId: selectedVideo.id.videoId,
                    playerVars: {
                        controls: 0,
                        disablekb: 1,
                        rel: 0,
                        modestbranding: 1,
                        showinfo: 0,
                    },
                    events: {
                        onReady: onPlayerReady,
                        onStateChange: onPlayerStateChange,
                    },
                },
            );
        };

        const onPlayerReady = () => {
            if (!playerRef.current) return;
            setVideoDuration(playerRef.current.getDuration());
            setIsPlaying(
                playerRef.current.getPlayerState() ===
                    window.YT.PlayerState.PLAYING,
            );

            // Update current time every 200ms
            intervalRef.current = setInterval(() => {
                if (playerRef.current) {
                    const time = playerRef.current.getCurrentTime();
                    setCurrentTime(time);

                    const trimStartTime =
                        (trimStart / 100) * playerRef.current.getDuration();
                    const trimEndTime =
                        (trimEnd / 100) * playerRef.current.getDuration();

                    // If video reaches the trim end or is before trim start, go to trim start
                    if (
                        (time >= trimEndTime || time < trimStartTime) &&
                        isPlaying
                    ) {
                        playerRef.current.seekTo(trimStartTime);
                    }
                }
            }, 200);
        };

        const newVideoId = selectedVideo.id.videoId;
        setVideoId(newVideoId);

        // Load saved trim values from localStorage
        const savedTrim = localStorage.getItem(`yt-trim-${newVideoId}`);
        if (savedTrim) {
            const { start, end } = JSON.parse(savedTrim);
            setTrimStart(start);
            setTrimEnd(end);
        } else {
            // Reset trim values for new video
            setTrimStart(0);
            setTrimEnd(100);
        }

        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = initializePlayer;
        } else {
            initializePlayer();
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
            }
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [selectedVideo]);

    const onPlayerStateChange = (event: YouTubeEvent) => {
        setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
    };

    const togglePlayPause = () => {
        if (!playerRef.current) return;

        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            const trimStartTime =
                (trimStart / 100) * playerRef.current.getDuration();
            const trimEndTime =
                (trimEnd / 100) * playerRef.current.getDuration();
            const currentPosition = playerRef.current.getCurrentTime();

            if (
                currentPosition < trimStartTime ||
                currentPosition >= trimEndTime
            ) {
                playerRef.current.seekTo(trimStartTime);
            }

            playerRef.current.playVideo();
        }
    };

    const handleDragStart = (
        handle: 'left' | 'right',
        e: React.MouseEvent | React.TouchEvent,
    ) => {
        e.preventDefault();
        setIsDragging(handle);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent | TouchEvent) => {
            if (!isDragging || !sliderRef.current) return;

            const sliderRect = sliderRef.current.getBoundingClientRect();
            const sliderWidth = sliderRect.width;
            let clientX;

            if ('touches' in e) {
                clientX = e.touches[0].clientX;
            } else {
                clientX = e.clientX;
            }

            let newPosition = ((clientX - sliderRect.left) / sliderWidth) * 100;

            // Constrain to valid range (0-100)
            newPosition = Math.max(0, Math.min(100, newPosition));

            if (isDragging === 'left') {
                newPosition = Math.min(newPosition, trimEnd - 5);
                setTrimStart(newPosition);
            } else {
                newPosition = Math.max(newPosition, trimStart + 5);
                setTrimEnd(newPosition);
            }
        };

        const handleMouseUp = () => {
            if (isDragging && videoId) {
                localStorage.setItem(
                    `yt-trim-${videoId}`,
                    JSON.stringify({
                        start: trimStart,
                        end: trimEnd,
                    }),
                );

                if (isPlaying && playerRef.current) {
                    const trimStartTime =
                        (trimStart / 100) * playerRef.current.getDuration();
                    const trimEndTime =
                        (trimEnd / 100) * playerRef.current.getDuration();
                    const currentPosition = playerRef.current.getCurrentTime();

                    if (
                        currentPosition < trimStartTime ||
                        currentPosition > trimEndTime
                    ) {
                        playerRef.current.seekTo(trimStartTime);
                    }
                }
            }
            setIsDragging(null);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchmove', handleMouseMove, {
                passive: false,
            });
            document.addEventListener('touchend', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleMouseMove);
            document.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging, trimStart, trimEnd, videoId, isPlaying]);

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    if (!selectedVideo) {
        return (
            <div className="flex items-center justify-center h-full text-lg text-gray-500">
                No video selected
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <div className="aspect-video">
                <div ref={playerContainerRef} className="w-full h-full"></div>
            </div>

            <div className="bg-gray-100 p-3 rounded-b-lg border-t border-gray-200">
                {/* Video title */}
                <div className="min-w-0 p-2 font-bold text-lg">
                    {selectedVideo.snippet.title ?? ''}
                </div>
                {/* Play or Pause */}
                <div className="flex items-center mb-3">
                    <button
                        onClick={togglePlayPause}
                        className="bg-white hover:bg-gray-200 text-gray-800 px-4 py-1 border rounded m-2 cursor-pointer"
                    >
                        {isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <div className="text-gray-800">
                        {formatTime(currentTime)} / {formatTime(videoDuration)}
                    </div>
                </div>

                {/* Video slider controls */}
                <div className="relative h-10">
                    {/* Video slider tracj */}
                    <div
                        ref={sliderRef}
                        className="absolute top-4 left-0 right-0 h-1 bg-gray-300 rounded"
                    >
                        {/* Trimmed region */}
                        <div
                            className="absolute h-full bg-gray-500 rounded"
                            style={{
                                left: `${trimStart}%`,
                                width: `${trimEnd - trimStart}%`,
                            }}
                        ></div>

                        {/* Indicator for current video position */}
                        <div
                            className="absolute w-1 h-5 rounded bg-red-500 transform -translate-x-1/2 -translate-y-1/2 z-10"
                            style={{
                                left: `${(currentTime / videoDuration) * 100}%`,
                                top: '50%',
                            }}
                        ></div>
                    </div>

                    {/* Left draggable handle */}
                    <div
                        className={`absolute top-2 w-1.5 lg:w-1 h-6 bg-gray-600 rounded cursor-ew-resize transform -translate-y-1/8 -translate-x-1`}
                        style={{ left: `${trimStart}%` }}
                        onMouseDown={(e) => handleDragStart('left', e)}
                        onTouchStart={(e) => handleDragStart('left', e)}
                    ></div>

                    {/* Right draggable handle */}
                    <div
                        className={`absolute top-2 w-1.5 lg:w-1 h-6 bg-gray-600 rounded cursor-ew-resize -translate-y-1/8`}
                        style={{
                            left: `${trimEnd}%`,
                        }}
                        onMouseDown={(e) => handleDragStart('right', e)}
                        onTouchStart={(e) => handleDragStart('right', e)}
                    ></div>
                </div>

                {/* Video start / end display */}
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                    <span>
                        Start: {formatTime((trimStart / 100) * videoDuration)}
                    </span>
                    <span>
                        End: {formatTime((trimEnd / 100) * videoDuration)}
                    </span>
                </div>
            </div>
        </div>
    );
}
