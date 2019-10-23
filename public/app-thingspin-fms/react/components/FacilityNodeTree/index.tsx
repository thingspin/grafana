// 3rd party libs
import React from 'react';

// Grafana libs
//import { Select } from '@grafana/ui';

// Thingspin libs
import FilterTree from './filterTree';
import TsMqttController from 'app-thingspin-fms/utils/mqttController';

// style libs
import siteModel from './SiteModel';
import { SiteOptions, facilityTreeProps, FacilityItem, TreeInfo, FacilityTreeType } from './model';

export default class FacilityTree extends React.Component<facilityTreeProps, FacilityItem> {
    _isMounted = true;
    state: FacilityItem = {
        Taginfo: [],
        checked: [],
        // testChecked: [],
        checkedSave: [],

        nodes: [],
        sitesListinfo: [],
        siteOptions: [],
        connectionList: [],
    };

    $location: angular.ILocationService = this.props.inject.get('$location'); // for route
    $rootScope: angular.IRootScopeService = this.props.inject.get('$rootScope');

    // MQTT
    mqttClient: TsMqttController; // mqtt client instance

    //props check
    UNSAFE_componentWillReceiveProps(nextProps: facilityTreeProps) {
        this.restoreFacilityData(nextProps).then((state) => {
            this.setState(state);
        });
    }

    private async componentInit() {
        // JGW( empty sequence )
        // this.initMqtt();

        const [updateState, fdState] = await Promise.all([
            this.getSiteList(),
            this.restoreFacilityData(),
        ]);

        if (this._isMounted) {
            this.setState({
                ...updateState,
                ...fdState,
            });
        }
    }

    UNSAFE_componentWillMount() {
        this._isMounted = true;
        this.componentInit();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    //restore checked item
    async restoreFacilityData(item: facilityTreeProps = this.props): Promise<TreeInfo> {
        //site selected
        const { siteinfo: { value, }, taginfo } = item;
        const siteInfoState = await this.findSiteinfo(value);
        // tag selected

        const updateState: any = {
            checkedSave: taginfo.map((info: any) => (info.value)),
            Taginfo: taginfo,
        };

        return {
            ...siteInfoState,
            ...updateState,
        };
    }

    async getSiteList(): Promise<TreeInfo> {
        if (!this._isMounted) {
            return null;
        }

        try {
            const [ sites, ptags ] = await Promise.all([
                siteModel.getFactilitySite(FacilityTreeType.Site),
                siteModel.getFactilitySite(FacilityTreeType.Ptag),
            ]);

            const selectedOption = siteModel.generateSiteOpts(-1, "ALL Tags", FacilityTreeType.Site);
            const { value, isCustom } = selectedOption;

            const siteOptions: any[] = [selectedOption].concat(sites, ptags);
            //("sitelist: ", siteOptions);
            const updateState: TreeInfo = await this.getTreeinfo(value, isCustom);

            return {
                ...updateState,
                selectedOption,
                siteOptions,
            } as any;
        } catch (err) {
            console.error("get Sites, error!");
            console.error(err);
        }

        return null;
    }

    async findSiteinfo(siteid: any) {
        if (!this._isMounted) {
            return null;
        }

        try {
            const [ sites, ptags ] = await Promise.all([
                siteModel.getFactilitySite(FacilityTreeType.Site),
                siteModel.getFactilitySite(FacilityTreeType.Ptag),
            ]);

            const siteOptions: SiteOptions[] = [ siteModel.generateSiteOpts(-1, "ALL Tags", FacilityTreeType.Site) ]
                .concat(sites, ptags);
            const i: number = siteOptions.findIndex(({ value }) => (value === siteid));
            const target: number = i > 0 ? i : 0;
            const selectedOption = siteOptions[target];
            const { value, isCustom } = selectedOption;

            const treeState = await this.getTreeinfo(value, isCustom);

            return {
                ...treeState,
                siteOptions,
                selectedOption,
            } as any;
        } catch (err) {
            console.error("get Sites, error!");
            console.error(err);
        }

        return null;
    }

    private async getTreeinfo(siteid: any, isCustom: boolean): Promise<TreeInfo> {
        if (!this._isMounted) {
            return null;
        }

        try {
            const nodes: any[] = await siteModel.getTreeinfo(siteid, isCustom);
            if (nodes && nodes.length) {
                return {
                    nodes,
                } as any;
            }
        } catch (err) {
            console.error("get Treeinfo, error!");
            console.error(err);
        }

        return null;
    }


    async initMqtt(): Promise<void> {
        const mqttUrl: string = `ws://${this.$location.host()}:${this.$location.port()}/thingspin-proxy/mqtt` as string;
        const listenerTopic: string = "/thingspin/+/+/status" as string;

        this.mqttClient = new TsMqttController(mqttUrl, listenerTopic);
        try {
            await this.mqttClient.run(this.recvMqttMessage.bind(this));
        } catch (e) {
            console.error(e);
        }
    }

    recvMqttMessage(topic: string, payload: string | object): void {
        const topics = topic.split("/");
        //const id = topics[topics.length - 2];
        const target = topics[topics.length - 3];
        //let isChange = false;
        switch (target) {
            case 'connect':
                break;
            default:
        }
    }

    //page move
    connManagePage() {
        this.$location.url(`/thingspin/manage/data/connect/`).replace();
        this.$rootScope.$apply();
    }

    siteManagePage = () => {
        this.$location.url(`/thingspin/manage/data/connect`).replace();
        this.$rootScope.$apply();
    }

    //CHECK TREE
    onCheck2({ checked, Taginfo }: any) {
        const { selectedOption } = this.state;

        this.setState({
            Taginfo,
            checked: checked,
        });
        this.sendTagData(Taginfo, selectedOption);
        //this.props.click({ Taginfo, selectedOption });
    }

    sendTagData(TagData: any[], siteData: any) {
        const { click } = this.props;
        if (!click) {
            return;
        }

        /*
        const Taginfo = (siteData.value === -1)
            //All Tags
            ? TagData.filter(({ tag_id }) => (tag_id < 0))
            : TagData.filter(({ site_id }) => (siteData.value === site_id));
        */

        click({
            siteData,
            Taginfo: TagData || [],
        });
    }

    //SITE SELECTION event
    handleChange = async (selectedOption: any) => {
        const { checked, Taginfo } = this.state;
        const updateState = await this.getTreeinfo(selectedOption.value, selectedOption.isCustom);
        this.setState({
            ...updateState,
            selectedOption,
        });

        console.log("handleChange checked: ", checked);
        this.sendTagData(Taginfo, selectedOption);
    };

    customSingleValue = ({ data }: { data: any }) => (
        <div className="input-select">
            <div className="input-select__single-value">
                {data.icon && <span className="input-select__icon">{data.icon}</span>}
                <span>{data.label}</span>
            </div>
        </div>
    );

    render() {
        const { siteOptions, checkedSave, nodes } = this.state;
        const isDataEmpty = (nodes.length === 0 || siteOptions.length === 0) ? true : false;

        //("render-checkedsave:",checkedSave," DataEmpty:",isDataEmpty);

        return (
            <div className="facility-tree-container">
            {/*
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
            */}
                <div className="facility-section-line" />

                {<FilterTree
                        nodes={nodes}
                        nodesChecked={checkedSave}
                        click={(checked: any, Taginfo: any) => this.onCheck2(checked)}
                    />
                }
                <div>
                    {isDataEmpty && <div>
                            <div className="facility-warning-facility-empty"><i className="fa fa-exclamation-triangle">&nbsp;</i> WARNING</div>
                            <div className="facility-warning-facility-empty">설정된 데이터가 없습니다.</div>
                            <div className="facility-warning-facility-empty">데이터 연결을 설정 하세요.</div>
                            <button className="facility-siteManage-page-btn2" onClick={this.siteManagePage}>
                                데이터 연결 관리 이동  &nbsp;&nbsp;<i className="fa fa-arrow-right"></i>
                                </button>
                        </div>
                    }
                </div>
            </div>
        );
    }

}
