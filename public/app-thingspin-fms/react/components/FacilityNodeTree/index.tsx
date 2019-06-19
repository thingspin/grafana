import React from 'react';
import './_index.scss';
//import CheckboxTree from '../react-checkbox-tree/index';
import { Select } from '@grafana/ui';
import { getBackendSrv } from '@grafana/runtime';
import { auto, ILocationService } from 'angular';
import FilterTree from './filterTree';

export type facilityTreeProps = {
    click?: Function;
    inject: auto.IInjectorService; // for route
};

//tslint:disable-next-line:class-name
export interface facilityItem {
    checked: [];
    expanded: [];

    nodes: any;
    nodesCount: any;
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
    $location: ILocationService; // for route

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.onCheck2 = this.onCheck2.bind(this);

        this.onFacilityTagButton = this.onFacilityTagButton.bind(this);
        this.onAllTagButton = this.onAllTagButton.bind(this);

        this.$location = this.props.inject.get('$location') as any; // for route
        this.connManagePage = this.connManagePage.bind(this);
        this.siteManagePage = this.siteManagePage.bind(this);

        this.state = {
            checked: [],
            expanded: [],

            nodes: [],
            nodesCount: null,
            selectedOption: null,
            sitesListinfo: [],
            siteOptions: [],
            filterPlaceholder: " 태그 검색 ..."
        };
        this.getSiteList();
    }

    //BACKEND SRV
    getSiteList() {
        getBackendSrv().get("/thingspin/sites").then((result: any) => {
            //console.log(result);
            const elements = [];
            if (result.length > 0) {
              this.setState({sitesListinfo: []}); // initialize
              this.setState({sitesListinfo: result});

              for (let i = 0; i < result.length; i++) {
                  elements.push({value: result[i].id,label: result[i].name});
              }

              //copy elemenets to select options
              //init set first index
              this.setState({siteOptions: elements });
              this.setState({selectedOption: elements[0]});
              //console.log("react/facility/options: ",this.state.siteOptions);
              //console.log("react/facility/selected: ",this.state.selectedOption);
              this.getTreeinfo(this.state.selectedOption.value);
            } else {
              console.log("** sites list empty **");
            }
          });
    }
    getTreeinfo(siteid) {
        const url = "/thingspin/sites/"+siteid+"/facilities/tree";
        //console.log('url',url);
        getBackendSrv().get(url).then((result: any) => {

            this.setState({nodes: result});
            this.setState({nodesCount: result.length});
            //console.log("getTreeinfo: ",this.state.nodes);
          });
    }

    //page move
    connManagePage() {
        console.log('react/go Connection Manage page');
        this.$location.path(`/thingspin/manage/data/connect/`);
    }
    siteManagePage() {
        console.log('react/go Site Manage Page');
        this.$location.path(`/thingspin/manage/data/site`);
    }

    //BUTTON ACTION
    onFacilityTagButton() {
        console.log("onTagButton: ",this.state.selectedOption.value);
        this.getTreeinfo(this.state.selectedOption.value);
    }
    onAllTagButton() {
        getBackendSrv().get('/thingspin/tagdefine').then((result: any) => {
            console.log("tagdefine: ",result);

            //this.setState({nodesFiltered: result});
            //this.setState({nodes: result});
            //this.setState({nodesCount: result.length});

          }).catch((err: any) => {
            console.log("After ordering, error!");
            console.log(err);
        });
    }

    //CHECK TREE
    /*
    onCheck = (checked,a,Taginfo) => {
        console.log(Taginfo);
        console.log(this.state.selectedOption);
        this.setState({ checked });
        const siteData = this.state.selectedOption;
        this.props.click({ Taginfo,siteData});
    };
    */
    onCheck2(Taginfo) {
        console.log("react/test:",Taginfo);
        this.setState({checked: Taginfo});
        const siteData = this.state.selectedOption;
        this.props.click({ Taginfo,siteData});
    }
    //SITE SELECTION
    handleChange = selectedOption => {
        this.setState({selectedOption});
        console.log('option selected: ',selectedOption);
        //this.setState({filterPlaceholder: selectedOption.label+" 의 태그 조회"});
        this.getTreeinfo(selectedOption.value);
    };

    render() {
        const {selectedOption} = this.state;
        const {siteOptions} = this.state;
        const {nodesCount} = this.state;
        let isdataEmpty = false;

        console.log("render siteoptions: ",siteOptions);
        console.log("render nodesCount: ",nodesCount);


        if (nodesCount === null || siteOptions.length === 0) {
            console.log("render nodesCount NULL");
            isdataEmpty = true;
        }

        return (
            <div className = "facility-tree-container">
                <div className="facility-site-pos">
                <Select
                    value = {selectedOption}
                    onChange = {this.handleChange}
                    options = {siteOptions}
                    placeholder = "사이트 선택"
                    className = "facility-select"
                    ></Select>
                </div>

                <div className = "facility-section-line"/>
                  <FilterTree nodes = {this.state.nodes} click={(item) => this.onCheck2(item.Taginfo)}></FilterTree>
                <div>
                    { isdataEmpty?
                        <div>
                            <button onClick = {this.siteManagePage}>사이트 관리</button>
                        </div>
                        : null
                    }
                </div>
           </div>
        );
    }

}

export default FacilityTree;
