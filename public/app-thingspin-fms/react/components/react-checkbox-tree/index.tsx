import React, { ReactNode } from 'react';
import classNames from 'classnames';
import isEqual from 'lodash/isEqual';
const  nanoid = require('nanoid');

import Button from './Button';
import TreeNode from './TreeNode';
import NodeModel, { TreeNodeShape, ListShape, IconsShape, LanguageShape, Check } from './models';

export interface Props {
    nodes: TreeNodeShape[];

    checked?: ListShape;
    disabled?: boolean;
    expandDisabled?: boolean;
    expandOnClick?: boolean;
    expanded?: ListShape;
    icons?: IconsShape;
    id?: string;
    lang?: LanguageShape;
    name?: string;
    nameAsArray?: boolean;
    nativeCheckboxes?: boolean;
    noCascade?: boolean;
    onlyLeafCheckboxes?: boolean;
    optimisticToggle?: boolean;
    showExpandAll?: boolean;
    showNodeIcon?: boolean;
    showNodeTitle?: boolean;

    onCheck?: (value: string[], clickNode: object, origin: any) => void;
    onClick?: Function;
    onExpand?: Function;
}

interface States {
    id: string;
    model: NodeModel;
    prevProps: Props;
}

export default class CheckboxTree extends React.Component<Props, States> {
    static defaultProps: any = {
        checked: [],
        disabled: false,
        expandDisabled: false,
        expandOnClick: false,
        expanded: [],
        icons: {
            check: <span className="rct-icon rct-icon-check" />,
            uncheck: <span className="rct-icon rct-icon-uncheck" />,
            halfCheck: <span className="rct-icon rct-icon-half-check" />,
            expandClose: <span className="rct-icon rct-icon-expand-close" />,
            expandOpen: <span className="rct-icon rct-icon-expand-open" />,
            expandAll: <span className="rct-icon rct-icon-expand-all" />,
            collapseAll: <span className="rct-icon rct-icon-collapse-all" />,
            parentClose: <span className="rct-icon rct-icon-parent-close" />,
            parentOpen: <span className="rct-icon rct-icon-parent-open" />,
            leaf: <span className="rct-icon rct-icon-leaf" />,
        },
        id: null,
        lang: {
            collapseAll: 'Collapse all',
            expandAll: 'Expand all',
            toggle: 'Toggle',
        },
        name: undefined,
        nameAsArray: false,
        nativeCheckboxes: false,
        noCascade: false,
        onlyLeafCheckboxes: false,
        optimisticToggle: true,
        showExpandAll: false,
        showNodeIcon: true,
        showNodeTitle: false,
        onCheck: () => {},
        onClick: null,
        onExpand: () => {},
    };

    constructor(props: Props) {
        super(props);

        const model = new NodeModel(props);
        model.flattenNodes(props.nodes);
        model.deserializeLists({
            checked: props.checked,
            expanded: props.expanded,
        });

        this.state = {
            id: props.id || `rct-${nanoid(7)}`,
            model,
            prevProps: props,
        };

        this.onCheck = this.onCheck.bind(this);
        this.onExpand = this.onExpand.bind(this);
        this.onNodeClick = this.onNodeClick.bind(this);
        this.onExpandAll = this.onExpandAll.bind(this);
        this.onCollapseAll = this.onCollapseAll.bind(this);
    }

    // eslint-disable-next-line react/sort-comp
    static getDerivedStateFromProps(newProps: Props, prevState: States): object {
        const { model, prevProps } = prevState;
        const { disabled, id, nodes } = newProps;
        let newState: object = { ...prevState, prevProps: newProps };

        // Apply new properties to model
        model.setProps(newProps);

        // Since flattening nodes is an expensive task, only update when there is a node change
        if (!isEqual(prevProps.nodes, nodes) || prevProps.disabled !== disabled) {
            model.flattenNodes(nodes);
        }

        if (id !== null) {
            newState = { ...newState, id };
        }
        model.deserializeLists({
            checked: newProps.checked,
            expanded: newProps.expanded,
        });

        return newState;
    }

    onCheck(nodeInfo: any): void {
        const { noCascade, onCheck } = this.props;
        const model = this.state.model.clone();
        const node = model.getNode(nodeInfo.value);

        model.toggleChecked(nodeInfo, nodeInfo.checked, noCascade);

        // thingspin add code -----
        const checked: string[] = model.serializeList(Check.Checked);
        const originData: any[] = checked.map((value) => model.getNode(value).origin);
        // thingspin add code -----

        onCheck([...checked], { ...node, ...nodeInfo }, [...originData]);
    }

    onExpand(nodeInfo: any) {
        const { onExpand } = this.props;
        const model = this.state.model.clone();
        const node = model.getNode(nodeInfo.value);

        model.toggleNode(nodeInfo.value, Check.Expanded, nodeInfo.expanded);
        onExpand(model.serializeList(Check.Expanded), { ...node, ...nodeInfo });
    }

    onNodeClick(nodeInfo: any): void {
        const { onClick } = this.props;
        const { model } = this.state;
        const node = model.getNode(nodeInfo.value);

        onClick({ ...node, ...nodeInfo });
    }

    onExpandAll(): void {
        this.expandAllNodes();
    }

    onCollapseAll(): void {
        this.expandAllNodes(false);
    }

    expandAllNodes(expand = true): void {
        const { onExpand } = this.props;

        onExpand(
            this.state.model.clone()
                .expandAllNodes(expand)
                .serializeList(Check.Expanded),
        );
    }

    determineShallowCheckState(node: TreeNodeShape, noCascade: boolean): number {
        const flatNode = this.state.model.getNode(node.value);

        if (flatNode.isLeaf || noCascade) {
            return flatNode.checked ? 1 : 0;
        }

        if (this.isEveryChildChecked(node)) {
            return 1;
        }

        if (this.isSomeChildChecked(node)) {
            return 2;
        }

        return 0;
    }

    isEveryChildChecked(node: TreeNodeShape): boolean {
        return node.children.every(child => this.state.model.getNode(child.value).checkState === 1);
    }

    isSomeChildChecked(node: TreeNodeShape): boolean {
        return node.children.some(child => this.state.model.getNode(child.value).checkState > 0);
    }

    renderTreeNodes(nodes: TreeNodeShape[], parent: any = {}): ReactNode {
        const {
            expandDisabled,
            expandOnClick,
            icons,
            lang,
            noCascade,
            onClick,
            onlyLeafCheckboxes,
            optimisticToggle,
            showNodeTitle,
            showNodeIcon,
        } = this.props;
        const { id, model } = this.state;
        const { icons: defaultIcons } = CheckboxTree.defaultProps;

        const treeNodes: ReactNode[] = nodes.map((node: TreeNodeShape): ReactNode => {
            const key = node.value;
            const flatNode = model.getNode(node.value);
            const children: ReactNode = flatNode.isParent ? this.renderTreeNodes(node.children, node) : null;

            // Determine the check state after all children check states have been determined
            // This is done during rendering as to avoid an additional loop during the
            // deserialization of the `checked` property
            flatNode.checkState = this.determineShallowCheckState(node, noCascade);

            // Show checkbox only if this is a leaf node or showCheckbox is true
            const showCheckbox = onlyLeafCheckboxes ? flatNode.isLeaf : flatNode.showCheckbox;

            // Render only if parent is expanded or if there is no root parent
            const parentExpanded = parent.value ? model.getNode(parent.value).expanded : true;

            if (!parentExpanded) {
                return null;
            }

            return (
                <TreeNode
                    key={key}
                    checked={flatNode.checkState}
                    className={node.className}
                    disabled={flatNode.disabled}
                    expandDisabled={expandDisabled}
                    expandOnClick={expandOnClick}
                    expanded={flatNode.expanded}
                    icon={node.icon}
                    icons={{ ...defaultIcons, ...icons }}
                    label={node.label}
                    lang={lang}
                    optimisticToggle={optimisticToggle}
                    isLeaf={flatNode.isLeaf}
                    isParent={flatNode.isParent}
                    showCheckbox={showCheckbox}
                    showNodeIcon={showNodeIcon}
                    title={showNodeTitle ? node.title || node.label : node.title}
                    treeId={id}
                    value={node.value}
                    onCheck={this.onCheck}
                    onClick={onClick && this.onNodeClick}
                    onExpand={this.onExpand}
                >
                    {children}
                </TreeNode>
            );
        });

        return (<ol>
            {treeNodes}
        </ol>);
    }

    renderExpandAll(): ReactNode {
        const { icons: { expandAll, collapseAll }, lang, showExpandAll } = this.props;

        if (!showExpandAll) {
            return null;
        }

        return (
            <div className="rct-options">
                <Button className="rct-option rct-option-expand-all"
                    title={lang.expandAll}
                    onClick={this.onExpandAll}
                >
                    {expandAll}
                </Button>
                <Button className="rct-option rct-option-collapse-all"
                    title={lang.collapseAll}
                    onClick={this.onCollapseAll}
                >
                    {collapseAll}
                </Button>
            </div>
        );
    }

    renderHiddenInput(): ReactNode {
        const { name, nameAsArray } = this.props;

        if (name === undefined) {
            return null;
        }

        if (nameAsArray) {
            return this.renderArrayHiddenInput();
        }

        return this.renderJoinedHiddenInput();
    }

    renderArrayHiddenInput(): ReactNode[] {
        const { checked, name } = this.props;

        return checked.map((value: any): ReactNode => (
            <input key={value} name={`${name}[]`} type="hidden" value={value} />
        ));
    }

    renderJoinedHiddenInput(): ReactNode {
        const { checked, name } = this.props;
        const inputValue = checked.join(',');

        return <input name={name} type="hidden" value={inputValue} />;
    }

    render(): ReactNode {
        const { disabled, nodes, nativeCheckboxes } = this.props;
        const treeNodes = this.renderTreeNodes(nodes);

        const className = classNames({
            'react-checkbox-tree': true,
            'rct-disabled': disabled,
            'rct-native-display': nativeCheckboxes,
        });

        return (
            <div className={className}>
                {this.renderExpandAll()}
                {this.renderHiddenInput()}
                {treeNodes}
            </div>
        );
    }
}
