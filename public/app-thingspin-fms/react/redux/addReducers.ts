import { addRootReducer } from 'app/store/configureStore';
// Rule : 모든 리듀서는 Reducer라는 이름을 제외하고 Root에 등록한다.
import { tsNavbarReducer as thingspinNavbar } from './reducers/navbar';
import { tsToolbarReducer as thingspinToolbar } from './reducers/toolbar';

import { projectListReducer as droneProjects } from '../../pro/drone/state/reducer';
import { projectReducer as droneProject } from '../../pro/drone/state/reducer';

export default function addThingspinReducers() {
  addRootReducer([
    {
      thingspinNavbar,
      thingspinToolbar,
      droneProjects,
      droneProject,
    },
  ]);
}
