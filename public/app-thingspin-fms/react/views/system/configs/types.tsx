export enum ConfigSectionEnum {
    License = 'license',
    ContentsDirectory = 'contents',
    ServiceDeamon = 'service',
    API = 'api',
    Control = 'control',
}

export interface Section {
    key: ConfigSectionEnum;
    name: string;
}

export interface Item {
    tag: string;
    attribute: string;
    value?: any;
    devel?: boolean;
}

export interface Props {
    section: Section;
}

export interface PropsSection {
    solo: boolean;
    section: Section;
}

export interface PropsItems extends Props {
    item: Item;
}

export interface StatesConfig {
    mode: string;
    solo: boolean;
    sections: Section[];
}

export interface StatesSection {
}

export interface StatesItems {
}
