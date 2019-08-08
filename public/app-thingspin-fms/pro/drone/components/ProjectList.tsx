import React from 'react';
import { PureComponent } from 'react';
import { connectWithStore } from 'app/core/utils/connectWithReduxStore';

import { notifyApp } from 'app/core/actions';
import { createWarningNotification } from 'app/core/copy/appNotification';

import { FilterInput } from 'app/core/components/FilterInput/FilterInput';
import LayoutSelector, { LayoutMode, LayoutModes } from 'app/core/components/LayoutSelector/LayoutSelector';
import classNames from 'classnames';

import { ProjectListState, ProjectListProps } from '../types';
import { loadProjectList } from '../state/actions';
import { ProjectListItem } from './ProjectListItem';

import { ProjectInfoEditor } from './ProjectInfoEditor';

export class ProjectList extends PureComponent<ProjectListProps, ProjectListState> {
    state: ProjectListState = {
        isLoading: true,
        isAddMode: false,
        layoutMode: LayoutModes.List,
        projects: null
    };

    unsubscribe: any;

    constructor(props: ProjectListProps) {
        super(props);
        const { store } = this.props;

        this.unsubscribe = store.subscribe(() => {
            const state = store.getState()['droneProjects'];
            this.setState({ projects: state.projects });
            this.forceUpdate();
        });
    }

    async componentWillMount() {
        try {
            this.setState({ isLoading: true });
            await this.props.loadProjectList();
            this.setState({ isLoading: false });
        } catch (error) {
            console.error(error);
        }
    }

    async componentWillUnmount() {
        this.unsubscribe();
    }

    renderProjectItem = (item: any, index: any) => {
        return (<ProjectListItem key={index} project={item} onDelete={this.onDelete}/>);
    };

    renderProjectList = () => {
        const { projects, layoutMode, isAddMode } = this.state;

        const listStyle = classNames({
            'card-section': true,
            'card-list-layout-grid': layoutMode === LayoutModes.Grid,
            'card-list-layout-list': layoutMode === LayoutModes.List,
        });

        return (<div className="page-scrollbar-content drone-project-list page-container page-body">
                <PageTitle value="프로젝트 관리" />
                <PageTools
                    onSearchQueryChange={this.onSearchQueryChange}
                    onAdd={this.onAdd}
                    layoutMode={layoutMode}
                    isAddMode={isAddMode}
                />
                {isAddMode ? (
                        <ProjectInfoEditor onSave={this.onSave} onCancel={this.onCancel} onWarnning={this.onWarnning}/>
                    ) : (
                        <section className={listStyle}>
                        <ol className='drone-project-list--items card-list'>
                            {projects
                                ? Array.from(projects.values()).map((project, id) => {
                                    return this.renderProjectItem(project, id);
                                })
                                : null
                            }
                        </ol>
                        </section>
                    )}
            </div>
        );
    };

    onAdd = () => {
        this.setState({ isAddMode: true });
    };

    onClose = () => {
        this.setState({ isAddMode: false });
    };

    onSave = (data: any) => {
        this.onClose();
        this.setState({ isLoading: true });
        this.props.loadProjectList();
        this.setState({ isLoading: false });
    };

    onDelete = (id: string) => {
        this.onClose();
        this.setState({ isLoading: true });
        this.props.loadProjectList();
        this.setState({ isLoading: false });
    };

    onCancel = () => {
        this.onClose();
    };

    onWarnning = (title: any, message: any) => {
        this.props.notifyApp(createWarningNotification(title, message));
    }

    onSearchQueryChange = (value: string) => {
    };

    onSetLayoutMode(mode: LayoutMode) {
    }

    render() {
        return this.renderProjectList();
    }
}

const PageTitle = (props: any) => {
    const { value } = props;
    return (
        <div className="gf-form-group">
            <div className="grafana-info-box">
                <h2>{value}</h2>
            </div>
        </div>
    );
};

const PageTools = (props: any) => {
    const toolsEnabled = false;
    const { isAddMode, onAdd } = props;
    const { layoutMode, onSearchQueryChange } = props;

    return (
        <div className="page-action-bar">
        {toolsEnabled ? (
            <div className="gf-form gf-form--grow">
                <FilterInput
                    labelClassName="gf-form--has-input-icon gf-form--grow"
                    inputClassName="gf-form-input"
                    placeholder="Search project"
                    value="" //{search}
                    onChange={ () => onSearchQueryChange}
                />
                <LayoutSelector mode={layoutMode} onLayoutModeChanged={(mode: LayoutMode) => null /*onSetLayoutMode(mode)*/} />
            </div>
        ) : (
            null
        )}
        <div className="page-action-bar__spacer" />
        {!isAddMode ? (
            <button className="fa fa-plus btn btn-secondary gf-form-btn" onClick={onAdd}> 프로젝트 추가</button>
        ) : (
            null
        )}
    </div>
    );
};

const mapDispatchToProps = {
    notifyApp,
    loadProjectList,
};

const mapStateToProps = (state: ProjectListState) => ({
    projects: state.projects,
});

export default connectWithStore(ProjectList, mapStateToProps, mapDispatchToProps);
