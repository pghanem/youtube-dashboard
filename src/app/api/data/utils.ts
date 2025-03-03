export const PAGE_SIZE = 10;

/**
 * getVideosData - Fetches video data with pagination.
 *
 * @param {number} page - The page number (default: 1).
 * @param {number} limit - The number of items per page (default: PAGE_SIZE).
 * @returns {Promise} - A promise that resolves with the paginated video data and pagination info.
 */
export async function getVideosData(page = 1, limit = PAGE_SIZE) {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Get the JSON data using the appropriate method for the environment
    const allData = await loadVideosData();

    return {
        items: allData.items.slice(startIndex, endIndex),
        pagination: {
            total: allData.items.length,
            page: page,
            limit: limit,
            totalPages: Math.ceil(allData.items.length / limit),
            hasNextPage: endIndex < allData.items.length,
            hasPrevPage: page > 1,
        },
    };
}

/**
 * Helper function to load the videos data using the appropriate method for the environment
 */
async function loadVideosData() {
    let videos;

    try {
        if (process.env.NODE_ENV === 'development') {
            const response = await fetch(
                'http://localhost:3000/data/videos.json',
            );
            if (!response.ok) {
                throw new Error(`Failed to fetch JSON: ${response.status}`);
            }
            videos = await response.json();
        } else {
            videos = await import('../../../../data/videos.json').then(
                (module) => module.default,
            );
        }

        return videos;
    } catch (error) {
        console.error('Error loading videos data:', error);
        throw new Error('Failed to load videos data');
    }
}
