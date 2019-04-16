import React, { PureComponent } from 'react';
import { connectWithStore } from 'app/core/utils/connectWithReduxStore';
import { MapSearchProps, MapSearchState } from '../types';

export class MapSearch extends PureComponent<MapSearchProps, MapSearchState> {
    state = {
        isLoading: true,
    };

    async componentWillMount() {
    }

    render() {
        return <div></div>;
    }
}

const mapDispatchToProps = {
};

const mapStateToProps = (state: MapSearchState) => ({
});

export default connectWithStore(MapSearch, mapStateToProps, mapDispatchToProps);
