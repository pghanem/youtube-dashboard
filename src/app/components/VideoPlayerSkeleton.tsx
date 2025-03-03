import { JSX } from 'react';

/**
 * VideoPlayerSkeleton - A simple animated skeleton component for the video player.
 *
 * @returns {JSX.Element} - Returns a VideoPlayer shaped loading skeleton element.
 */
export default function VideoPlayerSkeleton(): JSX.Element {
    return (
        <div className="flex flex-col animate-pulse">
            <div className="aspect-video bg-gray-300 rounded"></div>
            <div className="bg-gray-100 p-3 rounded-b-lg border-t border-gray-200 mt-2">
                <div className="flex items-center mb-3">
                    <div className="bg-white w-16 h-8 rounded mr-3"></div>
                    <div className="bg-gray-300 w-24 h-6 rounded"></div>
                </div>
                <div className="relative h-10 bg-gray-300 rounded"></div>
            </div>
        </div>
    );
}
