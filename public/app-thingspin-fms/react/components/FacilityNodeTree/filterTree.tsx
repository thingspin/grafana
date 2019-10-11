import React, { Component, ChangeEvent } from 'react';
import CheckboxTree from '../react-checkbox-tree/index';
import { FilterTreeProps, FilterTreeState } from './model';

export default class FilterTree extends Component<FilterTreeProps, FilterTreeState> {
    state: FilterTreeState = {
        checked: [],
        prevChecked: [],
        expanded: [],
        filterText: '',
        nodesFiltered: this.props.nodes,
        nodes: this.props.nodes,
        filterPlaceholder: " 태그 검색 ..."
    };

    UNSAFE_componentWillReceiveProps({nodes, nodesChecked}: FilterTreeProps) {
        //console.log("componentWillReceive");
        if (this.props.nodes !== nodes || this.props.nodesChecked !== nodesChecked) {
            const updateState: any = {
                nodes,
                nodesFiltered: nodes,
            };
            this.putNodeIcon(nodes);

            updateState.checked = nodesChecked;
            this.setState(updateState);
        }
    }

    UNSAFE_componentWillMount() {
        //console.log("componentWillMount: ",this.props);
        if (this.props.nodes && this.props.nodesChecked) {
            const updateState: any = {
                nodes: this.props.nodes,
                checked: this.props.nodesChecked,
            };

            this.putNodeIcon(this.props.nodes);
            this.setState(updateState);
        }
    }

    putNodeIcon(node: any[]) {
        if (node && node.length) {
           //console.log("node length: ",node.length);
           for (const n of node) {
                //console.log(n.label," ",n.children.length);
                if (n.tag_id === 0) {
                    if (n.site_id < 0) {
                        n.icon = <span className="icon-connection"><i className="fa fa-plug" /></span>;
                        if (n.children && n.children.length) {
                            this.putNodeIcon(n.children);
                        } else {
                            //n.showCheckbox = false;
                            n.disabled = true;
                        }
                    }else {
                        //n.icon = <span className="icon-facility"><i className="fa fa-steam fa-1x" /></span>;
                        if (n.children && n.children.length) {
                            this.putNodeIcon(n.children);
                        } else {
                            n.icon = <span className="icon-empty"><i className="fa fa-steam" /></span>;
                            //n.showCheckbox = false;
                            n.disabled = true;
                        }
                    }
                }else {
                    //console.log(n.label);
                    if (n.tag_name ==="" && n.tag_table_name ==="") {
                        //empty tag
                        //n.showCheckbox = false;
                        n.disabled = true;
                    }
                }
            }
        }
    }

    //CHECK TREE
    onCheck = (checked: any, a: any, Taginfo: any[]) => {
        let checkedSize = checked.length;
        if (checked && checked.length) {
            for (let i = 0; i < checkedSize; i += 1) {
                if (Taginfo[i].tag_id === 0) {
                    checked.splice(i, 1);
                    Taginfo.splice(i, 1);
                    checkedSize = checked.length;
                    i -= 1;
                }
            }
        }

        this.setState({ checked });
        this.props.click({ checked, Taginfo }); //sending to parent component
    };

    //TAG FILTER
    onFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
        this.setState({
            filterText: e.target.value
        }, this.filterTree);
    }

    filterTree = () => {
        const updateState = (!this.state.filterText)
            ?
            ({ nodes }: any) => ({
                nodesFiltered: nodes,
            })
            :
            ({ nodes }: any) => ({
                nodesFiltered: nodes.reduce(this.filterNodes, [])
            });
        //reset nodes back to un filtered state
        this.setState(updateState);
    }

    filterNodes = (filtered: any, node: any) => {
        const { filterText } = this.state;
        const children = (node.children || []).reduce(this.filterNodes, []);
        if (
            // Node's label matches the search string
            node.label.toLocaleLowerCase().indexOf(filterText.toLocaleLowerCase()) > -1
            // Or a children has a matching node
            || children.length
        ) {
            filtered.push({ ...node, children });
        }

        return filtered;
    }

    render() {
        const { filterText, filterPlaceholder, nodesFiltered, checked, expanded } = this.state;
        //console.log("filterTree Render:",checked);
        return (
            <div>
                <div className="facility-filter-pos">
                    <input
                        className="facility-filter-text"
                        placeholder={filterPlaceholder}
                        type="text"
                        value={filterText}
                        onChange={this.onFilterChange}
                    />
                </div>
                <div className="facility-tree-pos">
                    <CheckboxTree
                        icons={{
                            check: <i className="fa fa-check-square" />,
                            uncheck: <span className="rct-icon rct-icon-uncheck" />,
                            halfCheck: <span className="rct-icon rct-icon-half-check" />,
                            expandClose: <span className="rct-icon rct-icon-expand-close" />,
                            expandOpen: <span className="rct-icon rct-icon-expand-open" />,
                            expandAll: <span className="rct-icon rct-icon-expa nd-all" />,
                            collapseAll: <span className="rct-icon rct-icon-collapse-all" />,
                            parentClose: <span className="icon-facility"><i className="fa fa-steam-square fa-lg" /></span>,
                            parentOpen: <span className="icon-facility"><i className="fa fa-steam fa-lg" /></span>,
                            leaf: <span className="icon-tag"><i className="tsi icon-ts-tag" /></span>,
                        }}
                        nodes={nodesFiltered}
                        checked={checked}
                        expanded={expanded}
                        onCheck={this.onCheck}
                        onExpand={(exp: any) => this.setState({ expanded: exp })}
                        optimisticToggle={false}
                    ></CheckboxTree>
                </div>
            </div>
        );
    }
}
