// ref source : 'app/features/plugins/built_in_plugins.ts'
// datasource
import * as tsFmsDatasource from 'app-thingspin-fms/plugins/datasource/thingspin/module';
// Panel
// import * as tsFmTagGraphPanel from 'app-thingspin-fms/plugins/panel/fm-tag-graph/module';
import * as thingspinPictureitPanel from 'app-thingspin-fms/plugins/panel/thingspin-pictureit-panel/module';
import * as thingspinJupyterPanel from 'app-thingspin-fms/plugins/panel/thingspin-jupyter-panel/module';

export const thingspinBuiltInPlugins = {
    'app-thingspin-fms/plugins/datasource/thingspin/module': tsFmsDatasource,
    'app-thingspin-fms/plugins/panel/thingspin-pictureit-panel/module': thingspinPictureitPanel,
    'app-thingspin-fms/plugins/panel/thingspin-jupyter-panel/module': thingspinJupyterPanel,
    // 'app-thingspin-fms/plugins/panel/fm-tag-graph/module': tsFmTagGraphPanel,
};
