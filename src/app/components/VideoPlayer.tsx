'use client';

import { YouTubeVideoResult } from '@/types/videoTypes';
import React, { JSX, useEffect, useRef, useState } from 'react';

declare global {
    interface Window {
        onYouTubeIframeAPIReady: () => void;
    }
}

interface VideoPlayerProps {
    selectedVideo: YouTubeVideoResult | null;
}

/**
 * VideoPlayer - A YouTube video player component with custom video controls.
 */
export default function VideoPlayer({
    selectedVideo,
}: VideoPlayerProps): JSX.Element {
    // Core state
    const playerInstance = useRef<YT.Player | null>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [videoDuration, setVideoDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [trimStart, setTrimStart] = useState(0);
    const [trimEnd, setTrimEnd] = useState(100);
    const [isDraggingState, setIsDraggingState] = useState<
        'left' | 'right' | null
    >(null);
    const [videoId, setVideoId] = useState<string | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [playerReady, setPlayerReady] = useState(false);
    const [isVideoLoading, setIsVideoLoading] = useState(false);

    // Refs to avoid closure issues
    const trimStartRef = useRef(0);
    const trimEndRef = useRef(100);
    const isDraggingRef = useRef<'left' | 'right' | null>(null);

    // Custom setter for isDragging that updates both state and ref
    const setIsDragging = (value: 'left' | 'right' | null) => {
        isDraggingRef.current = value;
        setIsDraggingState(value);
    };

    // Keep refs in sync with state
    useEffect(() => {
        trimStartRef.current = trimStart;
    }, [trimStart]);
    useEffect(() => {
        trimEndRef.current = trimEnd;
    }, [trimEnd]);

    // Initialize player
    useEffect(() => {
        if (!playerContainerRef.current) return;

        const initPlayer = () => {
            if (playerInstance.current || !playerContainerRef.current) return;

            playerInstance.current = new window.YT.Player(
                playerContainerRef.current,
                {
                    videoId: '',
                    playerVars: {
                        controls: 0,
                        disablekb: 1,
                        rel: 0,
                        modestbranding: 1,
                        showinfo: 0,
                    },
                    events: {
                        onReady: () => setPlayerReady(true),
                        onStateChange: handlePlayerStateChange,
                    },
                },
            );
        };

        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
            window.onYouTubeIframeAPIReady = initPlayer;
        } else {
            initPlayer();
        }

        return () => {
            stopTimeUpdate();
            if (playerInstance.current) {
                playerInstance.current.destroy();
                playerInstance.current = null;
            }
        };
    }, []);

    // Handle video changes
    useEffect(() => {
        if (!selectedVideo || !playerReady || !playerInstance.current) return;

        const newVideoId = selectedVideo.id.videoId;
        if (newVideoId && newVideoId !== videoId) {
            // Mark as loading to hide the time indicator
            setIsVideoLoading(true);

            setVideoId(newVideoId);

            // Load saved trim values or use defaults
            let startTrim = 0;
            let endTrim = 100;

            const savedTrim = localStorage.getItem(`yt-trim-${newVideoId}`);
            if (savedTrim) {
                const { start, end } = JSON.parse(savedTrim);
                startTrim = start;
                endTrim = end;
            }

            setTrimStart(startTrim);
            setTrimEnd(endTrim);

            // Just cue the video without auto-playing
            playerInstance.current.cueVideoById(newVideoId);
        }
    }, [selectedVideo, playerReady, videoId]);

    // Update current time once duration is available
    useEffect(() => {
        if (
            videoId &&
            playerInstance.current &&
            playerReady &&
            isVideoLoading
        ) {
            const checkDuration = () => {
                const duration = playerInstance.current?.getDuration();
                if (duration && duration > 0) {
                    setVideoDuration(duration);
                    // Now convert the percentage to seconds
                    const startTimeSeconds =
                        (trimStartRef.current / 100) * duration;
                    setCurrentTime(startTimeSeconds);

                    // Video is now loaded, show the indicator
                    setIsVideoLoading(false);
                } else {
                    // If duration not available yet, try again
                    setTimeout(checkDuration, 100);
                }
            };

            checkDuration();
        }
    }, [videoId, playerReady, isVideoLoading]);

    // Simplified player state change handler
    const handlePlayerStateChange = (event: YT.OnStateChangeEvent) => {
        const isNowPlaying = event.data === window.YT.PlayerState.PLAYING;
        setIsPlaying(isNowPlaying);

        if (isNowPlaying) {
            setVideoDuration(playerInstance.current?.getDuration() || 0);
            startTimeUpdate();
        } else {
            stopTimeUpdate();
        }
    };

    // Clean time update functions
    const startTimeUpdate = () => {
        stopTimeUpdate();
        intervalRef.current = setInterval(() => {
            if (!playerInstance.current) return;

            const time = playerInstance.current.getCurrentTime();
            setCurrentTime(time);

            // Skip boundary checks while dragging using the ref
            if (isDraggingRef.current) return;

            const duration = playerInstance.current.getDuration();
            const trimStartTime = (trimStartRef.current / 100) * duration;
            const trimEndTime = (trimEndRef.current / 100) * duration;

            // Handle trim boundaries
            if (time >= trimEndTime) {
                playerInstance.current.seekTo(trimStartTime, true);
                setCurrentTime(trimStartTime);
            } else if (time < trimStartTime) {
                playerInstance.current.seekTo(trimStartTime, true);
            }
        }, 200);
    };

    const stopTimeUpdate = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    // Simplified play/pause control
    const togglePlayPause = () => {
        if (!playerInstance.current) return;

        if (isPlaying) {
            playerInstance.current.pauseVideo();
        } else {
            const duration = playerInstance.current.getDuration();
            const trimStartTime = (trimStartRef.current / 100) * duration;
            const trimEndTime = (trimEndRef.current / 100) * duration;
            const currentPos = playerInstance.current.getCurrentTime();

            // If we're at or past the end trim, seek back to start
            if (currentPos >= trimEndTime) {
                playerInstance.current.seekTo(trimStartTime, true);
            } else if (currentPos < trimStartTime) {
                playerInstance.current.seekTo(trimStartTime, true);
            }

            playerInstance.current.playVideo();
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
            if (!isDraggingState || !sliderRef.current) return;

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

            if (isDraggingState === 'left') {
                newPosition = Math.min(newPosition, trimEnd - 5);
                setTrimStart(newPosition);
            } else {
                newPosition = Math.max(newPosition, trimStart + 5);
                setTrimEnd(newPosition);
            }
        };

        const handleMouseUp = () => {
            if (isDraggingState && videoId) {
                localStorage.setItem(
                    `yt-trim-${videoId}`,
                    JSON.stringify({
                        start: trimStart,
                        end: trimEnd,
                    }),
                );

                if (playerInstance.current) {
                    const duration = playerInstance.current.getDuration();
                    const trimStartTime = (trimStart / 100) * duration;
                    const trimEndTime = (trimEnd / 100) * duration;
                    const currentPosition =
                        playerInstance.current.getCurrentTime();

                    // After releasing, check if we need repositioning
                    if (currentPosition < trimStartTime) {
                        playerInstance.current.seekTo(trimStartTime, true);
                        setCurrentTime(trimStartTime);
                    } else if (currentPosition > trimEndTime && isPlaying) {
                        playerInstance.current.seekTo(trimStartTime, true);
                        setCurrentTime(trimStartTime);
                    }
                }
            }
            setIsDragging(null);
        };

        if (isDraggingState) {
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
    }, [isDraggingState, trimStart, trimEnd, videoId, isPlaying]);

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
                    {selectedVideo.snippet.title.replace(/&#39;/g, "'") ?? ''}
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
                    {/* Video slider track */}
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
                        {!isVideoLoading && (
                            <div
                                className="absolute w-1 h-5 rounded bg-red-500 transform -translate-x-1/2 -translate-y-1/2 z-10"
                                style={{
                                    left: `${(currentTime / videoDuration) * 100}%`,
                                    top: '50%',
                                }}
                            ></div>
                        )}
                    </div>

                    {/* Left draggable handle */}
                    <div
                        className={`absolute top-2 w-3 lg:w-1 h-6 bg-gray-600 rounded cursor-ew-resize transform -translate-y-1/8 -translate-x-1`}
                        style={{ left: `${trimStart}%` }}
                        onMouseDown={(e) => handleDragStart('left', e)}
                        onTouchStart={(e) => handleDragStart('left', e)}
                    ></div>

                    {/* Right draggable handle */}
                    <div
                        className={`absolute top-2 w-3 lg:w-1 h-6 bg-gray-600 rounded cursor-ew-resize -translate-y-1/8`}
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
