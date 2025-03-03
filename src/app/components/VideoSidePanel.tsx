'use client';

import { YouTubeVideoResult } from '@/types/videoTypes';
import VideoList from './VideoList';
import SearchInput from '@/app/components/SearchInput';
import { useState, useMemo, JSX } from 'react';

interface VideoSidePanelProps {
    videos: YouTubeVideoResult[];
    selectedVideo: YouTubeVideoResult | null;
    onVideoSelect: (video: YouTubeVideoResult) => void;
    loading?: boolean;
    onLoadMore: () => void;
}

/**
 * VideoSidePanel - A scrollable side panel that displays a list of videos with search and pagination functionality.
 *
 * @param {YouTubeVideoResult[]} videos - List of videos to be displayed in the panel.
 * @param {YouTubeVideoResult | null} selectedVideo - The currently selected video, or null if no video is selected.
 * @param {(video: YouTubeVideoResult) => void} onVideoSelect - Callback function triggered when a video is selected.
 * @param {boolean} [loading=false] - Optional prop to indicate if the videos are still loading.
 * @param {() => void} [onLoadMore] - Callback function for loading more videos when paginating.
 *
 * @returns {JSX.Element} - Returns the VideoSidePanel component, which includes a video list and search functionality.
 */
export default function VideoSidePanel({
    videos,
    selectedVideo,
    onVideoSelect,
    loading = false,
    onLoadMore,
}: VideoSidePanelProps): JSX.Element {
    const [searchTerm, setSearchTerm] = useState('');

    // useMemo here for more efficient searching as well as general rendering optimization
    const filteredVideos = useMemo(() => {
        if (!searchTerm.trim()) {
            return videos;
        }

        const term = searchTerm.toLowerCase();
        return videos.filter(
            (video) =>
                video.snippet.title.toLowerCase().includes(term) ||
                (video.snippet.description &&
                    video.snippet.description.toLowerCase().includes(term)),
        );
    }, [searchTerm, videos]);

    const handleSearch = (term: string): void => {
        setSearchTerm(term);
    };

    return (
        <div className="h-screen flex flex-col">
            <SearchInput onSearch={handleSearch} />
            <div className="px-3 py-2 text-sm text-gray-500 h-8 rounded-xl flex items-center shadow-md mb-2">
                {searchTerm
                    ? `Found ${filteredVideos.length} results for "${searchTerm}"`
                    : 'Scroll down to see more results.'}
            </div>
            <VideoList
                videos={filteredVideos}
                selectedVideo={selectedVideo}
                onVideoSelect={onVideoSelect}
                loading={loading}
                onLoadMore={onLoadMore}
            />
        </div>
    );
}
