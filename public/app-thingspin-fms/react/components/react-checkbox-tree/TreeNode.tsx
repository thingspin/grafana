import classNames from 'classnames';
import React, { ReactNode } from 'react';

import Button from './Button';
import NativeCheckbox from './NativeCheckbox';
import { IconsShape, LanguageShape } from './models';

interface Props {
    checked: number;
    disabled: boolean;
    expandDisabled: boolean;
    expanded: boolean;
    icons: IconsShape;
    isLeaf: boolean;
    isParent: boolean;
    label: ReactNode; //node
    lang: LanguageShape;

    optimisticToggle: boolean;
    showNodeIcon: boolean;
    treeId: string;
    value: string | number;
    onCheck: Function;
    onExpand: Function;

    className?: string;
    expandOnClick?: boolean;
    icon?: ReactNode;
    showCheckbox?: boolean;
    title?: string;
    onClick?: Function;
}

class TreeNode extends React.Component<Props> {
    static defaultProps: any = {
        children: null,
        className: null,
        expandOnClick: false,
        icon: null,
        showCheckbox: true,
        title: null,
        onClick: () => {},
    };

    constructor(props: Props) {
        super(props);

        this.onCheck = this.onCheck.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onExpand = this.onExpand.bind(this);
    }

    onCheck(): void {
        const { value, onCheck } = this.props;

        onCheck({ value, checked: this.getCheckState({ toggle: true }) });
    }

    onClick(): void {
        const {
            expandOnClick,
            isParent,
            value,
            onClick,
        } = this.props;

        // Auto expand if enabled
        if (isParent && expandOnClick) {
            this.onExpand();
        }

        onClick({ value, checked: this.getCheckState({ toggle: false }) });
    }

    onExpand(): void {
        const { expanded, value, onExpand } = this.props;

        onExpand({ value, expanded: !expanded });
    }

    getCheckState({ toggle }: { toggle: boolean }): boolean {
        const { checked, optimisticToggle } = this.props;

        // Toggle off state to checked
        if (checked === 0 && toggle) {
            return true;
        }

        // Node is already checked and we are not toggling
        if (checked === 1 && !toggle) {
            return true;
        }

        // Get/toggle partial state based on cascade model
        if (checked === 2) {
            return optimisticToggle;
        }

        return false;
    }

    renderCollapseButton(): ReactNode {
        const { expandDisabled, isLeaf, lang } = this.props;

        if (isLeaf) {
            return (
                <span className="rct-collapse">
                    <span className="rct-icon" />
                </span>
            );
        }

        return (
            <Button
                className="rct-collapse rct-collapse-btn"
                disabled={expandDisabled}
                title={lang.toggle}
                onClick={this.onExpand}
            >
                {this.renderCollapseIcon()}
            </Button>
        );
    }

    renderCollapseIcon(): ReactNode {
        const { expanded, icons: { expandClose, expandOpen } } = this.props;

        return (!expanded) ? expandClose: expandOpen;
    }

    renderCheckboxIcon(): ReactNode {
        const { checked, icons: { uncheck, check, halfCheck } } = this.props;

        if (checked === 0) {
            return uncheck;
        }

        if (checked === 1) {
            return check;
        }

        return halfCheck;
    }

    renderNodeIcon(): ReactNode {
        const {
            expanded,
            icon,
            icons: { leaf, parentClose, parentOpen },
            isLeaf,
        } = this.props;

        if (icon !== null) {
            return icon;
        }

        if (isLeaf) {
            return leaf;
        }

        return (!expanded) ? parentClose : parentOpen;
    }

    renderBareLabel(children: ReactNode): ReactNode {
        const { onClick, title } = this.props;
        const clickable = onClick !== null;

        return (
            <span className="rct-bare-label" title={title}>
                {clickable ? (
                    <span
                        className="rct-node-clickable"
                        onClick={this.onClick}
                        onKeyPress={this.onClick}
                        role="button"
                        tabIndex={0}
                    >
                        {children}
                    </span>
                ) : children}
            </span>
        );
    }

    renderCheckboxLabel(children: ReactNode): ReactNode {
        const {
            checked,
            disabled,
            title,
            treeId,
            value,
            onClick,
        } = this.props;
        const clickable = onClick !== null;
        const inputId = `${treeId}-${String(value).split(' ').join('_')}`;

        const render = (<>
            <label key={0} htmlFor={inputId} title={title}>
                <NativeCheckbox
                    checked={checked === 1}
                    disabled={disabled}
                    id={inputId}
                    indeterminate={checked === 2}
                    onClick={this.onCheck}
                    onChange={() => {}}
                />
                <span className="rct-checkbox">
                    {this.renderCheckboxIcon()}
                </span>
                {!clickable ? children : null}
            </label>

            {clickable && <span
                    key={1}
                    className="rct-node-clickable"
                    onClick={this.onClick}
                    onKeyPress={this.onClick}
                    role="link"
                    tabIndex={0}
            >
                {children}
            </span>}
        </>);

        return render;
    }

    renderLabel(): ReactNode {
        const { label, showCheckbox, showNodeIcon } = this.props;
        const labelChildren: ReactNode = (<>
            {showNodeIcon && <span className="rct-node-icon">{this.renderNodeIcon()}</span>}
            <span className="rct-title">{label}</span>
        </>);

        return (!showCheckbox)
            ? this.renderBareLabel(labelChildren)
            : this.renderCheckboxLabel(labelChildren);
    }

    renderChildren(): ReactNode {
        return (!this.props.expanded) ? null : this.props.children;
    }

    render(): ReactNode {
        const { className, disabled, expanded, isLeaf, } = this.props;
        const nodeClass = classNames({
            'rct-node': true,
            'rct-node-leaf': isLeaf,
            'rct-node-parent': !isLeaf,
            'rct-node-expanded': !isLeaf && expanded,
            'rct-node-collapsed': !isLeaf && !expanded,
            'rct-disabled': disabled,
        }, className);

        return (
            <li className={nodeClass}>
                <span className="rct-text">
                    {this.renderCollapseButton()}
                    {this.renderLabel()}
                </span>
                {this.renderChildren()}
            </li>
        );
    }
}

export default TreeNode;
