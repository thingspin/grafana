import React, { PureComponent } from 'react';
import { createStore } from 'redux';
import { projectListReducer as droneProjects } from './state/reducer';

import ProjectList from './components/ProjectList';
import ProjectInfo from './components/ProjectInfo';
import MapSearch from './components/MapSearch';

const store = createStore(droneProjects);

export class TsDrone extends PureComponent {
    params: {
        meta: 'project',
        id: null,
        mode: 'view'
    };

    constructor(props) {
        super(props);
        const { $route } = props;

        if ( $route.current.params.meta !== undefined ) {
          this.params = $route.current.params;
        }
      }

    // render() {
    //     return (<ProjectList store={store} params={this.params}/>);
    // }

    render() {
        const { params } = this;

        return (params === undefined
            ? (<ProjectList store={store} params={this.params}/>)
            : params.meta === 'project'
            ? <ProjectInfo store={store} params={params} />
            : params.meta === 'map'
            ? <MapSearch store={store} params={params} />
            : <div>{params.meta}</div>
        );
    }

}
