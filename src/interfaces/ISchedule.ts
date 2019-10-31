export interface IScheduleStudios {
    edges: {
        isMain: boolean;
        node: {
            name: string;
        };
    }[];
}

export interface IScheduleTrailer {
    id: string;
    site: string;
}

export interface IScheduleLink {
    site: string;
    url: string;
}

export interface IScheduleCoverImage {
    large: string;
    color: string;
}

export interface IScheduleTitle {
    romaji: string;
}

export interface IScheduleMedia {
    id: number;
    siteUrl: string;
    source: string;
    title: IScheduleTitle;
    coverImage: IScheduleCoverImage;
    externalLinks: IScheduleLink[];
    trailer: IScheduleTrailer;
    studios: IScheduleStudios;
}

export interface ISchedule {
    media: IScheduleMedia;
    episode: number;
    airingAt: number;
    timeUntilAiring: number;
}

export interface IPageInfo {
    currentPage: number;
    hasNextPage: boolean;
}

export interface IPage {
    pageInfo: IPageInfo;
    airingSchedules: ISchedule[];
}

export interface IScheduleResponseData {
    Page: IPage;
}

export interface IScheduleError {
    message: string;
    status: number;
}

export interface IScheduleResponse {
    errors?: IScheduleError[];
    data: IScheduleResponseData | null;
}
