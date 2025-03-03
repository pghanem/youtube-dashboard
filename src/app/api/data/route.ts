import { NextRequest, NextResponse } from 'next/server';
import { getVideosData } from './utils';

/**
 * GET - Fetches a paginated list of videos based on the `page` and `limit` query parameters.
 *
 * @param {NextRequest} request - The request object containing pagination parameters.
 * @returns {NextResponse} - JSON response with video data or an error message.
 *
 * Defaults to `page=1` and `limit=10` if not provided. Returns a 500 error if data fetch fails.
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        const data = await getVideosData(page, limit);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Failed to load data' },
            { status: 500 },
        );
    }
}
