import React from 'react';
import './_index.scss';
import CheckboxTree from '../react-checkbox-tree/index';
import { Select } from '@grafana/ui';
import { getBackendSrv } from '@grafana/runtime';

export type facilityTreeProps = {
    click?: Function;
};

//tslint:disable-next-line:class-name
export interface facilityItem {
    checked: [];
    expanded: [];
    filterText: any;
    nodesFiltered: any;
    nodes: any;
    selectedOption: any;

    sitesListinfo: [];
    siteOptions: siteData[];

    filterPlaceholder: any;
}



//for select--------
// tslint:disable-next-line:class-name
interface siteData {
    value: any;
    label: any;
}
//-----------------select


class FacilityTree extends React.Component<facilityTreeProps,facilityItem> {
    constructor(props) {
        super(props);

        this.onFilterChange = this.onFilterChange.bind(this);
        this.filterTree = this.filterTree.bind(this);
        this.filterNodes = this.filterNodes.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.onCkeck = this.onCkeck.bind(this);

        this.state = {
            checked: [],
            expanded: [],
            filterText: '',
            nodesFiltered: [],
            nodes: [],
            selectedOption: null,
            sitesListinfo: [],
            siteOptions: [],
            filterPlaceholder: " 태그 검색 ..."
        };
        this.getSiteList();
        //this.getTreeinfo(1);
        console.log('constructor');
    }

    //backend-----
    getSiteList() {
        getBackendSrv().get("/thingspin/sites").then((result: any) => {
            //console.log(result);
            const elements = [];
            if (result.length > 0) {
              //console.log("react sites list count: ",result.length);
              this.setState({sitesListinfo: []}); // initialize
              this.setState({sitesListinfo: result});
              //console.log('react/site: ',this.state.sitesListinfo);

              for (let i = 0; i < result.length; i++) {
                  elements.push({value: result[i].id,label: result[i].name});
              }

              //console.log("react/elements:",elements);
              this.setState({siteOptions: elements });
              //this.getTreeinfo();
            } else {
              console.log("** sites list empty **");
            }
          });
    }
    getTreeinfo(siteid) {
        const url = "/thingspin/sites/"+siteid+"/facilities/tree";
        console.log('url',url);
        getBackendSrv().get(url).then((result: any) => {
            console.log("react/treeinfo ",siteid,": ",result);
            this.setState({nodesFiltered: result});
            this.setState({nodes: result});
          });
    }

    //check tree
    onCkeck = (checked,a,Taginfo) => {
        //console.log(Taginfo);
        //console.log(this.state.selectedOption);

        this.setState({ checked });
        const siteData = this.state.selectedOption;
        this.props.click({ Taginfo,siteData});
    };

    //site select function
    handleChange = selectedOption => {
        this.setState({selectedOption});
        console.log('option selected: ',selectedOption);
        //this.setState({filterPlaceholder: selectedOption.label+" 의 태그 조회"});
        this.getTreeinfo(selectedOption.value);
    };

    //search filter-------------
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
    //------------------------------search filter

    render() {
        const {selectedOption} = this.state;
        return (
            <div>
                <div className="facility-site-pos">
                <Select
                    value = {selectedOption}
                    onChange = {this.handleChange}
                    options = {this.state.siteOptions}
                    placeholder = "사이트 선택"
                    className = "facility-select"
                    ></Select>
                </div>
                <div className = "facility-section-line"/>
                {selectedOption ?
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

export default FacilityTree;
