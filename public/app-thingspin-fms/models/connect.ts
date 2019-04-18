
export interface TsConnect {
    id: number;
    flowid: string;
    type: string;
    params: any;
    active: boolean;
    creatd: Date;
    updated: Date;
}

export interface GroupTsConnect {
    [type: string]: TsConnect[];
}
