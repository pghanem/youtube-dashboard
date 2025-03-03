'use client';

import { useState, useEffect, useRef, useCallback, JSX } from 'react';
import { YouTubeVideoResult } from '@/types/videoTypes';
import VideoSidePanel from '@/app/components/VideoSidePanel';
import VideoPlayer from '@/app/components/VideoPlayer';
import VideoPlayerSkeleton from '@/app/components/VideoPlayerSkeleton';
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';
import { PAGE_SIZE } from '@/app/api/data/utils';

export const GlobalErrorFallback = ({ error }: { error: Error }) => {
    return (
        <div>
            <h2>Something went wrong:</h2>
            <p>{error.message}</p>
        </div>
    );
};

/**
 * YoutubeDashboard - This is the parent client side element for the YouTube Dashboard.
 *
 * @returns {JSX.Element} - Returns a YouTube Dashboard component.
 */
export default function YouTubeDashboard(): JSX.Element {
    const [videos, setVideos] = useState<Array<YouTubeVideoResult>>([]);
    const [selectedVideo, setSelectedVideo] =
        useState<YouTubeVideoResult | null>(null);
    const [isLoadingMoreVideos, setIsLoadingMoreVideos] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const videoPlayerContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const fetchMoreVideos = async () => {
            setIsLoadingMoreVideos(true);
            try {
                const response = await fetch(
                    `/api/data?page=${page}&limit=${PAGE_SIZE}`,
                );

                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }

                const data = await response.json();

                if (data.items && data.items.length > 0 && !selectedVideo) {
                    setSelectedVideo(data.items[0]);
                }

                setVideos((prev) => [...prev, ...data.items]);
                setHasMore(data.pagination.hasNextPage);
            } catch (error) {
                console.error('Error fetching more videos:', error);
                setError('Failed to load more videos. Please try again later.');
            } finally {
                setIsLoadingMoreVideos(false);
            }
        };
        fetchMoreVideos();
    }, [page]);

    // Relevant on mobile devices in single column view, this is necessary in order to bring the video player into view when a video is selected
    useEffect((): void => {
        if (selectedVideo && videoPlayerContainerRef.current) {
            videoPlayerContainerRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    }, [selectedVideo]);

    const handleVideoSelect = useCallback((video: YouTubeVideoResult): void => {
        setSelectedVideo(video);
    }, []);

    const handleLoadMore = useCallback((): void => {
        if (!isLoadingMoreVideos && hasMore) {
            setPage((prev) => prev + 1);
        }
    }, [isLoadingMoreVideos, hasMore]);

    return (
        <ErrorBoundary errorComponent={GlobalErrorFallback}>
            <div className="mx-auto px-4 lg:px-8">
                {error && (
                    <div
                        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
                        role="alert"
                    >
                        <p>{error}</p>
                    </div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    <div
                        className="order-1 lg:order-2 lg:col-span-3 pt-4 lg:pt-0"
                        ref={videoPlayerContainerRef}
                    >
                        <div className="flex h-full items-center">
                            <div className="flex-grow">
                                {videos.length === 0 ? (
                                    <VideoPlayerSkeleton />
                                ) : (
                                    selectedVideo && (
                                        <VideoPlayer
                                            selectedVideo={selectedVideo}
                                        />
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="order-2 lg:order-1 lg:col-span-2">
                        <VideoSidePanel
                            videos={videos}
                            selectedVideo={selectedVideo}
                            onVideoSelect={handleVideoSelect}
                            loading={isLoadingMoreVideos}
                            onLoadMore={handleLoadMore}
                            hasMore={hasMore}
                        />
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}
