import React, { Component } from 'react';
import CheckboxTree from '../react-checkbox-tree/index';

export interface Props {
    nodes: [];
    click?: Function;
}
interface State {
    checked: [];
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

        this.onFilterChange = this.onFilterChange.bind(this);
        this.filterTree = this.filterTree.bind(this);
        this.filterNodes = this.filterNodes.bind(this);

        this.state = {
            checked: [],
            expanded: [],
            filterText: '',
            nodesFiltered: this.props.nodes,
            nodes: this.props.nodes,
            nodesCount: null,
            filterPlaceholder: " 태그 검색 ..."
        };

        console.log("react/filter: ",this.props.nodes);
    }
    componentWillReceiveProps(nextProps) {
        // this.props 는 아직 바뀌지 않은 상태
        //console.log("props change");
        this.setState({nodesFiltered: this.props.nodes});
        this.setState({nodes: this.props.nodes});
        this.setState({nodesCount: this.props.nodes.length});
    }

    //CHECK TREE
    onCkeck = (checked,a,Taginfo) => {
        console.log("filterTree: ",Taginfo);
        this.setState({ checked });
        this.props.click({Taginfo}); //sending to parent component
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
      const {nodesCount} = this.state;

    return (
        <div>
            { nodesCount?
                    <div className="facility-filter-pos">
                        <input
                            className="filter-text"
                            placeholder={this.state.filterPlaceholder}
                            type="text"
                            value={this.state.filterText}
                            onChange={this.onFilterChange}
                            />
                    </div>
                : null
            }
            <div className="facility-tree-pos">
                <CheckboxTree
                    nodes={this.state.nodesFiltered}
                    checked = {this.state.checked}
                    expanded = {this.state.expanded}
                    onCheck = {this.onCkeck}
                    onExpand = {expanded => this.setState({ expanded })}
                ></CheckboxTree>
            </div>
        </div>
    );
  }
}

export default FilterTree;
