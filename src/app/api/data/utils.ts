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

    const response = await fetch(
        new URL(
            '/data/videos.json',
            process.env.NODE_ENV === 'development'
                ? 'http://localhost:3000'
                : process.env.VERCEL_URL || 'http://localhost:3000',
        ),
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch JSON: ${response.status}`);
    }

    const allData = await response.json();

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
