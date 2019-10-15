
export interface TsConnect {
    id: number;
    name: string;
    flow_id: string;
    type: string;
    params: any;
    active: boolean;
    enable: boolean;
    intervals: number;
    creatd: Date;
    updated: string;

    status?: any;
    publish?: boolean;
    [name: string]: any;
}

export interface GroupTsConnect {
    [type: string]: TsConnect[];
}

export interface TsConnectHistory {
    created: string;
    event: string;
    description: string;
}
