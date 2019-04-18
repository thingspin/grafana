
export interface TsConnect {
    id: number;
    name: string;
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
