'use client';

import { useRef, useEffect, JSX } from 'react';
import { YouTubeVideoResult } from '@/types/videoTypes';
import VideoTile from './VideoTile';
import VideoTileSkeleton from '@/app/components/VideoTileSkeleton';
import { PAGE_SIZE } from '@/app/api/data/utils';

interface VideoListProps {
    videos: YouTubeVideoResult[];
    selectedVideo: YouTubeVideoResult | null;
    onVideoSelect: (video: YouTubeVideoResult) => void;
    loading: boolean;
    onLoadMore: () => void;
}

/**
 * VideoList - Displays a scrollable list of videos within the side panel, showing each video in a tile.
 *            Includes functionality to select a video and load more videos when scrolling.
 *
 * @param {YouTubeVideoResult[]} videos - Array of videos to display in the list.
 * @param {YouTubeVideoResult | null} selectedVideo - The currently selected video, or null if no video is selected.
 * @param {(video: YouTubeVideoResult) => void} onVideoSelect - Function to handle video selection.
 * @param {boolean} loading - Flag indicating whether the videos are still loading.
 * @param {() => void} onLoadMore - Callback function to load more videos when pagination is triggered.
 *
 * @returns {JSX.Element} - Returns the JSX.Element for a scrollable video list with selection and pagination.
 */
export default function VideoList({
    videos,
    selectedVideo,
    onVideoSelect,
    loading = false,
    onLoadMore,
}: VideoListProps): JSX.Element {
    const videoListRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (!videoListRef.current || loading) return;

            const { scrollTop, clientHeight, scrollHeight } =
                videoListRef.current;

            if (scrollTop + clientHeight >= scrollHeight - 100) {
                onLoadMore();
            }
        };

        const currentRef = videoListRef.current;
        if (currentRef) {
            currentRef.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (currentRef) {
                currentRef.removeEventListener('scroll', handleScroll);
            }
        };
    }, [loading, onLoadMore]);

    return (
        <div ref={videoListRef} className="flex-1 overflow-y-auto">
            {videos.map((video: YouTubeVideoResult, index: number) => (
                <VideoTile
                    key={video.id?.videoId || `video-${index}`}
                    video={video}
                    isSelected={selectedVideo?.id.videoId === video.id.videoId}
                    onSelect={onVideoSelect}
                />
            ))}

            {loading &&
                Array.from({ length: PAGE_SIZE }).map((_, index) => (
                    <VideoTileSkeleton
                        key={`skeleton-${index + videos.length}`}
                    />
                ))}
        </div>
    );
}
