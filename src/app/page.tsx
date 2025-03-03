import { getVideosData, PAGE_SIZE } from '@/app/api/data/utils';
import YouTubeDashboard from '@/app/components/YouTubeDashboard';

export default async function Page() {
    // Server-side fetching of the first PAGE_SIZE videos, allowing the first set of videos to show up immediately.
    // Note: This may not be ideal in a real-world scenario, as the video tiles are highly interactive.
    // I kept it here to demonstrate some server-side optimizations, but it may not be the best choice for a YouTube-like dashboard.
    const initialData = await getVideosData(1, PAGE_SIZE);

    return (
        <YouTubeDashboard
            initialVideos={initialData.items}
            initialHasMore={initialData.pagination.hasNextPage}
        />
    );
}
