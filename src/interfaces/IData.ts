export interface IDataChannel {
    shows: number[];
}

export interface IDataGuild {
    [x: string]: IDataChannel;
}

export interface IData {
    [x: string]: IDataGuild;
}
