export interface IWatchingMediaTitle {
    romaji: string;
}

export interface IWatchingMedia {
    status: string;
    siteUrl: string;
    id: string;
    title: IWatchingMediaTitle;
}

export interface IWatchingPageInfo {
    currentPage: number;
    hasNextPage: boolean;
}

export interface IWatchingPage {
    pageInfo: IWatchingPageInfo;
    media: IWatchingMedia[];
}

export interface IWatchingData {
    Page: IWatchingPage;
}

export interface IWatchingError {
    message: string;
    status: number;
}

export interface IWatchingResponse {
    errors?: IWatchingError[];
    data: IWatchingData | null;
}
