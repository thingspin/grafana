import { ReactNode } from 'react';

import { Props } from './index';

export enum Check {
    Checked = 'checked',
    Expanded = 'expanded',
}

export interface LanguageShape {
    collapseAll: string;
    expandAll: string;
    toggle: string;
}

export interface IconsShape {
    check: ReactNode;
    uncheck: ReactNode;
    halfCheck: ReactNode;
    expandClose: ReactNode;
    expandOpen: ReactNode;
    expandAll: ReactNode;
    collapseAll: ReactNode;
    parentClose: ReactNode;
    parentOpen: ReactNode;
    leaf: ReactNode;
}

export type ListShape = string[];

export interface TreeNodeShape {
    // Required
    label: any;
    value: any;

    // Optional
    title?: string;
    icon?: ReactNode;
    disabled?: boolean;
    className?: string;
    showCheckbox?: boolean;
    children?: TreeNodeShape[];

    // Etc
    [name: string]: any;
}

export default class NodeModel {
    constructor(protected props: Props, protected flatNodes: any = {}) { }

    setProps(props: Props): void {
        this.props = props;
    }

    clone(): NodeModel {
        const clonedNodes: any = {};

        // Re-construct nodes one level deep to avoid shallow copy of mutable characteristics
        Object.keys(this.flatNodes).forEach((value: string): void => {
            const node = this.flatNodes[value];
            // Deep Copy(?)
            clonedNodes[value] = { ...node };
        });

        return new NodeModel(this.props, clonedNodes);
    }

    getNode(value: string): any {
        // shallow copy(Call by reference)
        return this.flatNodes[value];
    }

    flattenNodes(nodes: TreeNodeShape[], parent: TreeNodeShape = {} as TreeNodeShape, depth = 0): void {
        if (!Array.isArray(nodes) || nodes.length === 0) {
            return;
        }

        const { disabled, noCascade } = this.props;

        // Flatten the `node` property for internal lookups
        nodes.forEach((node: TreeNodeShape, index: number) => {
            const isParent = this.nodeHasChildren(node);

            this.flatNodes[node.value] = {
                label: node.label,
                value: node.value,
                children: node.children,
                parent,
                isParent,
                isLeaf: !isParent,
                showCheckbox: node.showCheckbox !== undefined ? node.showCheckbox : true,
                disabled: this.getDisabledState(node, parent, disabled, noCascade),
                treeDepth: depth,
                index,
                origin: node,
            };
            this.flattenNodes(node.children, node, depth + 1);
        });
    }

    nodeHasChildren(node: TreeNodeShape): boolean {
        return Array.isArray(node.children) && node.children.length > 0;
    }

    getDisabledState(node: TreeNodeShape, parent: TreeNodeShape, disabledProp: boolean, noCascade: boolean): boolean {
        if (disabledProp
            || (!noCascade && parent.disabled)) {
            return true;
        }

        return Boolean(node.disabled);
    }

    deserializeLists(lists: any): void {
        const listKeys: Check[] = [Check.Checked, Check.Expanded];

        // Reset values to false
        Object.keys(this.flatNodes).forEach((value: string): void => {
            for (const listKey of listKeys) {
                this.flatNodes[value][listKey] = false;
            }
        });

        // Deserialize values and set their nodes to true
        for (const listKey of listKeys) {
            for (const value of lists[listKey]) {
                if (this.flatNodes[value] !== undefined) {
                    this.flatNodes[value][listKey] = true;
                }
            }
        }
    }

    serializeList(key: string): string[] {
        return Object
            .keys(this.flatNodes)
            .filter( (value: string): string => (this.flatNodes[value][key]));
    }

    expandAllNodes(expand: any): NodeModel {
        Object.keys(this.flatNodes).forEach( (value: string): void => {
            if (this.flatNodes[value].isParent) {
                this.flatNodes[value].expanded = expand;
            }
        });

        return this;
    }

    toggleChecked(node: any, isChecked: string, noCascade: boolean): NodeModel {
        const flatNode = this.flatNodes[node.value];

        if (flatNode.isLeaf || noCascade) {
            if (node.disabled) {
                return this;
            }

            // Set the check status of a leaf node or an uncoupled parent
            this.toggleNode(node.value, Check.Checked, isChecked);
        } else {
            // Percolate check status down to all children
            flatNode.children.forEach((child: any): void => {
                this.toggleChecked(child, isChecked, noCascade);
            });
        }

        return this;
    }

    toggleNode(nodeValue: string, key: string, toggleValue: any): NodeModel {
        this.flatNodes[nodeValue][key] = toggleValue;

        return this;
    }
}
