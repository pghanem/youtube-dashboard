export interface YouTubeVideosResponse {
    kind: string;
    etag: string;
    nextPageToken: string;
    regionCode: string;
    pageInfo: {
        totalResults: number;
        resultsPerPage: number;
    };
    items: YouTubeVideoResult[];
}

export interface YouTubeVideoResult {
    kind: string;
    etag: string;
    id: {
        kind: string;
        videoId?: string;
        channelId?: string;
    };
    snippet: {
        publishedAt: string;
        channelId: string;
        title: string;
        description: string;
        thumbnails: {
            default: Thumbnail;
            medium: Thumbnail;
            high: Thumbnail;
        };
        channelTitle: string;
        liveBroadcastContent: string;
        publishTime: string;
    };
}

interface Thumbnail {
    url: string;
    width: number;
    height: number;
}
