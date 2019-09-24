// 3rd party libs
import React from 'react';

// Grafana libs
//import { Select } from '@grafana/ui';

// Thingspin libs
import FilterTree from './filterTree';
import TsMqttController from 'app-thingspin-fms/utils/mqttController';

// style libs
import './_index.scss';
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
        console.log("props-tag: ", nextProps.taginfo);
        console.log("props-site: ", nextProps.siteinfo);

        this.restoreFacilityData(nextProps).then((state) => {
            this.setState(state);
        });
    }

    private async componentInit() {
        const { taginfo } = this.props;
        let updateState = await this.getSiteList();
        this.initMqtt();
        siteModel.getConnectInfo();

        if (taginfo) {
            const fdState = await this.restoreFacilityData(this.props);

            // rewrite
            updateState = {
                ...updateState,
                ...fdState,
            };
        }

        if (this._isMounted) {
            this.setState(updateState);
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
    async restoreFacilityData(item: facilityTreeProps): Promise<TreeInfo> {
        //site selected
        console.log("restore item:", item);
        console.log(item.siteinfo);
        const { siteinfo: { value, isCustom }, taginfo } = item;
        const siteInfoState = await this.findSiteinfo(value, isCustom);
        // tag selected

        const updateState: any = (taginfo)
            ? {
                checkedSave: taginfo.map((info: any) => (info.value)),
                Taginfo: taginfo,
            }
            : {
                checkedSave: [],
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
            console.log("sitelist: ", siteOptions);
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

    async findSiteinfo(siteid: any, isCustom: boolean) {
        if (!this._isMounted) {
            return null;
        }

        try {
            const sites: SiteOptions[] = await siteModel.getFactilitySite(FacilityTreeType.Site);
            const ptags: SiteOptions[] = await siteModel.getFactilitySite(FacilityTreeType.Ptag);

            const siteOptions: SiteOptions[] = [siteModel.generateSiteOpts(-1, "ALL Tags", FacilityTreeType.Site)]
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
            console.log("MQTT Connected");
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
        console.log('react/go Connection Manage page');
        this.$location.url(`/thingspin/manage/data/connect/`).replace();
        this.$rootScope.$apply();
    }

    siteManagePage = () => {
        console.log('react/go Site Manage Page');
        this.$location.url(`/thingspin/manage/data/site`).replace();
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

        //console.log("sendTagData: ",TagData);
        /*
        const Taginfo = (siteData.value === -1)
            //All Tags
            ? TagData.filter(({ tag_id }) => (tag_id < 0))
            : TagData.filter(({ site_id }) => (siteData.value === site_id));
        */
        console.log('sendTagData: ', TagData, siteData);

        click({
            siteData,
            Taginfo: TagData || [],
        });
    }

    //SITE SELECTION event
    handleChange = async (selectedOption: any) => {
        const { checked, Taginfo } = this.state;
        console.log("handleChange");
        console.log(selectedOption);
        const updateState = await this.getTreeinfo(selectedOption.value, selectedOption.isCustom);
        this.setState({
            ...updateState,
            selectedOption,
        });

        console.log("handleChange checked: ", checked);
        console.log("handleChange Tag: ", Taginfo);
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

        console.log("render-checkedsave:",checkedSave," DataEmpty:",isDataEmpty);

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
                            <button className="facility-siteManage-page-btn2" onClick={this.siteManagePage}>사이트 관리 이동</button>
                        </div>
                    }
                </div>
            </div>
        );
    }

}
