import { JSX } from 'react';

/**
 * VideoPlayerSkeleton - A simple animated skeleton component for the video player.
 *
 * @returns {JSX.Element} - Returns a VideoTile shaped loading skeleton element.
 */
export default function VideoTileSkeleton(): JSX.Element {
    return (
        <div className="p-4 my-4 rounded-lg border border-gray-200 flex gap-4 animate-pulse">
            <div className="relative overflow-hidden rounded-lg bg-gray-300 h-[90px] w-[120px]"></div>
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
            </div>
        </div>
    );
}
