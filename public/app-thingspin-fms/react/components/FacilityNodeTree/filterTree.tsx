import React, { Component } from 'react';
import CheckboxTree from '../react-checkbox-tree/index';

export interface Props {
    nodes: [];
    nodesChecked: [];
    click?: Function;
}
interface State {
    checked: [];
    prevChecked: [];
    expanded: [];
    filterText: any;
    nodesFiltered: any;
    nodes: any;
    nodesCount: any;

    filterPlaceholder: any;
}
class FilterTree extends Component<Props,State> {

    constructor(props) {

        super(props);

        this.putNodeIcon = this.putNodeIcon.bind(this);
        this.onFilterChange = this.onFilterChange.bind(this);
        this.filterTree = this.filterTree.bind(this);
        this.filterNodes = this.filterNodes.bind(this);

        this.state = {
            checked: [],
            prevChecked: [],
            expanded: [],
            filterText: '',
            nodesFiltered: this.props.nodes,
            nodes: this.props.nodes,
            nodesCount: null,
            filterPlaceholder: " 태그 검색 ..."
        };

        //console.log("react/filter: ",this.props.nodes);
    }

    componentWillReceiveProps(nextProps) {
        // this.props 는 아직 바뀌지 않은 상태
        //console.log("componentWillReceive");
        //console.log("prev -node: ",this.props.nodes);
        //console.log("prev: ",this.props.nodesChecked);
        //console.log("next: ",nextProps.nodesChecked);
        if (this.props.nodes !== nextProps.nodes || this.props.nodesChecked !== nextProps.nodesChecked) {
            //console.log(nextProps.nodes);
            this.putNodeIcon(nextProps.nodes);
            this.setState({nodesFiltered: nextProps.nodes});
            this.setState({nodes: nextProps.nodes});
            this.setState({nodesCount: nextProps.nodes.length});
            let nChecked = 0;
            nChecked = nextProps.nodesChecked.length;

            //console.log("props change: ",nChecked);

           if ( nChecked > 0 ) {
                //console.log("props Checked change: ",nChecked,nextProps.nodesChecked);
                this.setState({checked: nextProps.nodesChecked});
            }
        }else {
            //console.log("props same");
        }
    }
    componentWillMount() {
        //console.log("componentWillMount");
        this.putNodeIcon(this.props.nodes);
    }

    putNodeIcon(node) {
        //console.log("parent check");
        if (node && node.length > 0) {
            for (let i = 0; i < node.length; i++) {
                if (node[i].tag_id === 0) {
                    //console.log("parent: ",node[i].value);
                    //console.log(node[i].children);
                    node[i]['icon'] = <span className="icon-facility"><i className="fa fa-steam fa-1x"/></span>;
                    this.putNodeIcon(node[i].children);
                } else {
                    node[i]['icon'] =  <span className="icon-tag"><i className="tsi icon-ts-tag"/></span>;
                }
            }
        }
    }
    //CHECK TREE
    onCheck = (checked,a,Taginfo) => {
        //console.log("FT-oncheck tag: ",Taginfo);
        //console.log("FT-oncheck checked: ",checked);
        let checkedSize = checked.length;
        if (checked && checked.length > 0) {
            //console.log("TEST_CHECKED");
            for (let i = 0; i < checkedSize; i++) {
                if (Taginfo[i].tag_id === 0) {
                    //console.log("delete: ",i);
                    checked.splice(i,1);
                    Taginfo.splice(i,1);
                    checkedSize = checked.length;
                    i--;
                }
            }
        }
        //console.log(checked.length);
        //console.log(checked);
        //console.log(Taginfo);
        this.setState({ checked });
        this.props.click({checked,Taginfo}); //sending to parent component
    };

     //TAG FILTER
    onFilterChange(e) {
        this.setState({ filterText: e.target.value }, this.filterTree);
    }
    filterTree() {
        //reset nodes back to un filtered state
        if (!this.state.filterText) {
            this.setState(prevState =>({
                nodesFiltered: prevState.nodes,
            }));
            return;
        }

        const nodesFiltered = prevState => (
            {nodesFiltered: prevState.nodes.reduce(this.filterNodes,[])}
        );

        this.setState(nodesFiltered);
    }
    filterNodes(filtered, node) {
        //console.log(this.state);
        const { filterText } = this.state;
        const children = (node.children || []).reduce(this.filterNodes,[]);
        if (
            // Node's label matches the search string
            node.label.toLocaleLowerCase().indexOf(filterText.toLocaleLowerCase()) > -1 ||
            // Or a children has a matching node
            children.length
        ) {
            filtered.push({ ...node, children });
        }

        return filtered;
    }

  render() {
      //console.log("filterTree Render");
    return (
        <div>
            <div className="facility-filter-pos">
                <input
                    className="facility-filter-text"
                    placeholder={this.state.filterPlaceholder}
                    type="text"
                    value={this.state.filterText}
                    onChange={this.onFilterChange}
                    />
            </div>
            <div className="facility-tree-pos">
                <CheckboxTree
                    icons={{
                        check: <i className="fa fa-check-square"/>,
                        uncheck: <span className="rct-icon rct-icon-uncheck" />,
                        halfCheck: <span className="rct-icon rct-icon-half-check" />,
                        expandClose: <span className="rct-icon rct-icon-expand-close" />,
                        expandOpen: <span className="rct-icon rct-icon-expand-open" />,
                        expandAll: <span className="rct-icon rct-icon-expa nd-all" />,
                        collapseAll: <span className="rct-icon rct-icon-collapse-all" />,
                        parentClose: <span className="icon-facility"><i className="fa fa-steam-square fa-1x"/></span>,
                        parentOpen: <span className="icon-facility"><i className="fa fa-steam fa-1x"/></span>,
                        leaf: <span className="icon-tag"><i className="tsi icon-ts-tag"/></span>,
                    }}
                    nodes={this.state.nodesFiltered}
                    checked = {this.state.checked}
                    expanded = {this.state.expanded}
                    onCheck = {this.onCheck}
                    onExpand = {expanded => this.setState({ expanded })}
                    optimisticToggle={false}
                ></CheckboxTree>
            </div>
        </div>
    );
  }
}

export default FilterTree;