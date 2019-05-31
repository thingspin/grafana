export interface LanguageShape {
    collapseAll: string;
    expandAll: string;
    toggle: string;
}

export interface IconsShape {
    check: any;
    uncheck: any;
    halfCheck: any;
    expandClose: any;
    expandOpen: any;
    expandAll: any;
    collapseAll: any;
    parentClose: any;
    parentOpen: any;
    leaf: any;
}

export type ListShape = any[];

export interface NodeShape {
    label: any;
    value: string | number;

    disabled?: boolean;
    icon?: any;
    showCheckbox?: boolean;
    title?: string;
}
