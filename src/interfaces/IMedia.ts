export interface IMedia {
    id: number;
}

export interface IMediaData {
    Media: IMedia;
}

export interface IMediaError {
    message: string;
    status: number;
}

export interface IMediaResponse {
    errors?: IMediaError[];
    data: IMediaData | null;
}
