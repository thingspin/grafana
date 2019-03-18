import { addRootReducer } from 'app/store/configureStore';
// Rule : 모든 리듀서는 Reducer라는 이름을 제외하고 Root에 등록한다.
import { viewModeReducer as thingspinViewMode } from './reducers/viewMode';

export default function addThingspinReducers() {
  addRootReducer([
    {
      thingspinViewMode,
    },
  ]);
}
