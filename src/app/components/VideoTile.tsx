'use client';

import Image from 'next/image';
import { YouTubeVideoResult } from '@/types/videoTypes';
import { JSX } from 'react';

interface VideoTileProps {
    video: YouTubeVideoResult;
    isSelected: boolean;
    onSelect: (video: YouTubeVideoResult) => void;
}

/**
 * VideoTile - Represents a single video tile for use in the video list. Shows the video thumbnail and title, and includes onSelect logic.
 *
 * @param {YouTubeVideoResult} video - The video data to display in the tile, including thumbnail and title.
 * @param {boolean} isSelected - Flag indicating whether this video tile is selected.
 * @param {(video: YouTubeVideoResult) => void} onSelect - Callback function that is triggered when the video tile is clicked.
 *
 * @returns {JSX.Element} - Returns a video tile that displays the video’s thumbnail and title, and responds to selection.
 */
export default function VideoTile({
    video,
    isSelected,
    onSelect,
}: VideoTileProps): JSX.Element {
    return (
        <div
            className={`p-4 my-4 rounded-lg border-gray-200 cursor-pointer flex gap-4 ${
                isSelected
                    ? 'bg-blue-100 hover:bg-blue-200'
                    : 'hover:bg-gray-200'
            }`}
            onClick={
                video.id.channelId
                    ? () =>
                          window.open(
                              `https://www.youtube.com/channel/${video.id.channelId}`,
                              '_blank',
                          )
                    : () => onSelect(video)
            }
        >
            <div
                className="relative overflow-hidden rounded-lg object-cover"
                style={{
                    width: video.snippet.thumbnails.default.width ?? 120,
                    height: video.snippet.thumbnails.default.height ?? 90,
                }}
            >
                <Image
                    src={video.snippet.thumbnails.default.url}
                    alt={video.snippet.title}
                    fill
                    className="object-cover"
                    unoptimized
                />
            </div>
            {/* Instead of a full decode, only replacing the apostrophes since that's the only one encoded */}
            <div className="flex-1">
                <p className="font-semibold text-gray-800">
                    {video.snippet.title.replace(/&#39;/g, "'")}
                </p>
                <p className="text-sm text-gray-600">
                    {video.snippet.description.substring(0, 100)}...
                </p>
            </div>
        </div>
    );
}
