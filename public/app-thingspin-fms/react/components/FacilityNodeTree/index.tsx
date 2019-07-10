import React from 'react';
import './_index.scss';
import { Select } from '@grafana/ui';
import { getBackendSrv } from '@grafana/runtime';
import { auto, ILocationService, IRootScopeService } from 'angular';
import FilterTree from './filterTree';
//import { Item } from 'app-thingspin-fms/react/views/system/configs/types';


export type facilityTreeProps = {
    click?: Function;
    inject: auto.IInjectorService; // for route
    taginfo: any;
    siteinfo: any;
};

//tslint:disable-next-line:class-name
export interface facilityItem {
    Taginfo: [];
    checked: [];
    testChecked: [];
    expanded: [];

    nodes: any;
    nodesCount: any;
    selectedOption: any;

    sitesListinfo: [];
    siteOptions: siteData[];

    filterPlaceholder: string;

    checkedSave: [];
}

//for select--------
// tslint:disable-next-line:class-name
interface siteData {
    value: any;
    label: any;
}
//-----------------select

class FacilityTree extends React.Component<facilityTreeProps, facilityItem> {
    _isMounted = true;
    state: facilityItem = {
        Taginfo: [],
        checked: [],
        testChecked: [],
        checkedSave: [],

        expanded: [],

        nodes: [],
        nodesCount: 0,
        selectedOption: null,
        sitesListinfo: [],
        siteOptions: [],
        filterPlaceholder: " 태그 검색 ...",
    };

    $location: ILocationService; // for route
    $rootScope: IRootScopeService;

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.onCheck2 = this.onCheck2.bind(this);

        this.$location = this.props.inject.get('$location') as ILocationService; // for route
        this.$rootScope = this.props.inject.get('$rootScope') as IRootScopeService;
        this.connManagePage = this.connManagePage.bind(this);
        this.siteManagePage = this.siteManagePage.bind(this);

        this.restoreFacilityData = this.restoreFacilityData.bind(this);

        this.customSingleValue = this.customSingleValue.bind(this);


        //console.log("constructor");
    }

    //props check
    componentWillReceiveProps(nextProps) {
        //test.
        console.log("props-tag: ", nextProps.taginfo);
        console.log("props-site: ", nextProps.siteinfo);

        this.restoreFacilityData(nextProps);

        if (this.props.taginfo !== nextProps.taginfo || this.props.siteinfo !== nextProps.siteinfo) {
            console.log("props change");
        } else {
            console.log("props same");
        }
    }

    componentWillMount() {
        //console.log("componentWillMount");
        this._isMounted = true;
        this.getSiteList();
        //console.log(this.props);
        if (this.props.taginfo && this.props.taginfo.length > 0) {
            //console.log("data exist");
            this.restoreFacilityData(this.props);
        } else {
            //console.log("data empty");
        }
    }

    componentDidMount() {
        //console.log('componentDidMount');
    }
    componentWillUpdate(nextProps, nextState) {
        //console.log('componentWillUpdate');
    }
    componentDidUpdate(prevProps, prevState) {
        //console.log('componentDidUpdate');
    }
    componentWillUnmount() {
        this._isMounted = false;
        //console.log('componentWillUnmount');
    }
    //restore checked item
    restoreFacilityData(item) {
        //console.log("restore");
        //site selected
        const selectedOption = item.siteinfo;
        const taginfo = item.taginfo;

        getBackendSrv().get("/thingspin/sites").then((result: any) => {
            const elements = [];
            let idx;
            if (result && result.length > 0 && this._isMounted) {
                this.setState({ sitesListinfo: result });

                for (let i = 0; i < result.length; i++) {
                    if (result[i].id === selectedOption.value) {
                        idx = i;
                    }
                    elements.push({ value: result[i].id, label: result[i].name, icon: <i className="tsi icon-ts-site">&nbsp;&nbsp;</i> });
                }
                this.setState({ siteOptions: elements });
                this.setState({ selectedOption: elements[idx] });
                this.getTreeinfo(selectedOption.value);
            } else {
                console.log("** sites list empty **");
            }
        }).catch((err: any) => {
            console.log("get Sites, error!");
            console.log(err);
        });
        // tag selected
        const elements = [];

        if (taginfo && taginfo.length > 0) {
            for (let i = 0; i < taginfo.length; i++) {
                const data = taginfo[i].value;
                elements.push(data);
            }
            this.setState({ checkedSave: elements as any });
        } else {
            this.setState({ checkedSave: [] });
        }
    }

    //TEST SAMPLE
    /*
    testGetList() {
        getBackendSrv().get("/thingspin/sites/sample").then((result: any) => {
            //console.log(result);
            const elements = [];
            if (result && result.length > 0) {
              this.setState({sitesListinfo: []}); // initialize
              this.setState({sitesListinfo: result});

              for (let i = 0; i < result.length; i++) {
                  elements.push({value: result[i].id,label: result[i].name});
              }

              //copy elemenets to select options
              //init set first index
              this.setState({siteOptions: elements });
              this.setState({selectedOption: elements[0]});
              this.testGetTree(this.state.selectedOption.value);
            } else {
              console.log("** sites list empty **");
            }
          });
    }
    testGetTree(siteid) {
        const url = "/thingspin/sites/"+siteid+"/facilities/tree/sample";
        //console.log('url',url);
        getBackendSrv().get(url).then((result: any) => {

            this.setState({nodes: result});
            this.setState({nodesCount: result.length});
          });
    }
*/

    //BACKEND SRV
    async getSiteList() {
        try {
            const elements = [];
            const result = await getBackendSrv().get("/thingspin/sites");
            //console.log(result);

            if (result && result.length > 0 && this._isMounted) {
                this.setState({ sitesListinfo: result });

                for (let i = 0; i < result.length; i++) {
                    elements.push({ value: result[i].id, label: result[i].name, icon: <i className="fa fa-industry">&nbsp;&nbsp;</i> });
                }

                //copy elemenets to select options
                //init set first index
                this.setState({ siteOptions: elements });
                this.setState({ selectedOption: elements[0] });
                this.getTreeinfo(this.state.selectedOption.value);
            } else {
                console.log("** sites list empty **");
            }
        } catch (err) {
            console.log("get Sites, error!");
            console.log(err);
        }
    }
    async getTreeinfo(siteid) {
        const url = `/thingspin/sites/${siteid}/facilities/tree`;
        //console.log('url',url);
        try {
            const result = await getBackendSrv().get(url);

            if (result && result.length > 0 && this._isMounted) {
                this.setState({ nodes: result });
                this.setState({ nodesCount: result.length });
                //console.log("getTreeinfo: ",this.state.nodes);
            }
        } catch (err) {
            console.log("get Treeinfo, error!");
            console.log(err);
       }
    }

    //page move
    connManagePage() {
        console.log('react/go Connection Manage page');
        this.$location.url(`/thingspin/manage/data/connect/`).replace();
        this.$rootScope.$apply();
    }
    siteManagePage() {
        console.log('react/go Site Manage Page');
        this.$location.url(`/thingspin/manage/data/site`).replace();
        this.$rootScope.$apply();
    }

    //CHECK TREE
    onCheck2(checked) {
        console.log(checked);
        const siteData = this.state.selectedOption;
        const Taginfo = checked.Taginfo;
        this.setState({ Taginfo: Taginfo });
        this.setState({ checked: checked.checked });

        this.props.click({ Taginfo, siteData });
    }
    //SITE SELECTION
    handleChange = selectedOption => {
        this.setState({ selectedOption });
        this.getTreeinfo(selectedOption.value);
    };

    //TEST
    /*
    testChecked() {
        //refresh/
        console.log("check: ",this.state.checked);
        console.log("saved: ",this.state.testChecked);
    }
    testSave() {
        this.setState({testChecked: this.state.checked});
    }
    */

    customSingleValue = ({ data }) => (
        <div className="input-select">
            <div className="input-select__single-value">
                {data.icon && <span className="input-select__icon">{data.icon}</span>}
                <span>{data.label}</span>
            </div>
        </div>
    );

    render() {
        const { selectedOption } = this.state;
        const { siteOptions, nodesCount, checkedSave } = this.state;
        let isdataEmpty = false;

        //console.log("render:",checkedSave);

        if (nodesCount === 0 || siteOptions.length === 0) {
            //console.log("render nodesCount NULL");
            isdataEmpty = true;
        }

        return (
            <div className="facility-tree-container">
                <div className="facility-site-pos">
                    <Select
                        value={selectedOption}
                        onChange={this.handleChange}
                        options={siteOptions}
                        placeholder="사이트 선택"
                        className="facility-select"
                        components={{ SingleValue: this.customSingleValue }}
                    />
                </div>

                <div className="facility-section-line" />
                {isdataEmpty ?
                    null
                    :
                    <FilterTree
                        nodes={this.state.nodes}
                        nodesChecked={checkedSave}
                        click={(checked, Taginfo) => this.onCheck2(checked)}
                    />
                }
                <div>
                    {isdataEmpty ?
                        <div>
                            <div className="facility-warning-facility-empty"><i className="fa fa-exclamation-triangle">&nbsp;</i> WARNING</div>
                            <div className="facility-warning-facility-empty">설정된 데이터가 없습니다.</div>
                            <button className="facility-siteManage-page-btn2" onClick={this.siteManagePage}>사이트 관리 이동</button>
                        </div>
                        : null
                    }
                </div>
            </div>
        );
    }

}

export default FacilityTree;