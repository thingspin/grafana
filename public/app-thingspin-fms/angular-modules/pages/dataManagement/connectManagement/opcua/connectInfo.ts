import angular, { ITimeoutService } from 'angular';
import { InputModel } from './controller';

interface InputEnable {
    name: boolean;
    endpoint: boolean;
    policy: boolean;
    mode: boolean;
    auth: boolean;
}

export class TsOpcUaConnectInfoCtrl implements angular.IController {
    // Inheritance data
    input: InputModel;
    connectStatus: string;

    // UI setting data
    inputEnable: InputEnable = {
        name: false,
        endpoint: false,
        policy: false,
        mode: false,
        auth: false,
    };
    selectList = {
        policy: ["None", "Basic128RSA15", "Basic256", "Basic256HA256",],
        mode: ["None", "Sign", "Sign & Encrypt",],
        auth: ["Anonymous", "Username and Password", "Certificate and Primary Key",],
    };

    changeEvt() {
        const { name, endpointUrl, securityPolicy, securityMode, auth } = this.input;

        this.inputEnable = {
            name: !!name,
            endpoint: !!endpointUrl,
            policy: !!securityPolicy,
            mode: !!securityMode,
            auth: !!auth,
        };
    }

    /** @ngInject */
    constructor(private $timeout: ITimeoutService) {
    }

    $onInit(): void {
        this.$timeout(()=> {
            $('#input-name').focus();
        });
    }

}



export class TsOpcUaConnectInfoDirective implements angular.IDirective {
    templateUrl = require('./connectInfo.html');
    restrict = 'E';
    bindToController = true;
    controllerAs = 'ctrl';
    controller = TsOpcUaConnectInfoCtrl;
    scope = {
        input: "=",
        connectStatus: "=",
        btnClick: "&",
    };

    /** @ngInject */
    constructor() {
    }
}

angular.module('thingspin.directives').directive('tsOpcConnectInfo', [() => new TsOpcUaConnectInfoDirective()]);
