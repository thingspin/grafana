import config from 'app/core/config';
import { coreModule } from 'app/core/core';

export class TsSignup {
  /** @ngInject */
  constructor(private $scope: any, private backendSrv: any, $location: any, contextSrv: any) {
    $scope.$parent.ctrl.navbarEnable = false;
    contextSrv.sidemenu = false;
    $scope.ctrl = this;

    $scope.formModel = {};

    const { email, code } = $location.search();

    // validate email is semi ok
    if (email && !email.match(/^\S+@\S+$/)) {
      console.log('invalid email');
      return;
    }

    $scope.formModel.orgName = email;
    $scope.formModel.email = email;
    $scope.formModel.username = email;
    $scope.formModel.code = code;

    $scope.verifyEmailEnabled = false;
    $scope.autoAssignOrg = false;

    $scope.navModel = {
      main: {
        icon: 'gicon gicon-branding',
        text: 'Sign Up',
        subTitle: 'Register your Grafana account',
        breadcrumbs: [{ title: 'Login', url: 'login' }],
      },
    };

    backendSrv.get('/api/user/signup/options').then(({verifyEmailEnabled, autoAssignOrg}: any) => {
      $scope.verifyEmailEnabled = verifyEmailEnabled;
      $scope.autoAssignOrg = autoAssignOrg;
    });
  }

  submit() {
    const { signUpForm, formModel } = this.$scope;
    if (!signUpForm.$valid) {
      return;
    }

    this.backendSrv.post('/api/user/signup/step2', formModel).then(({ code }: any) => {
      location.href = config.appSubUrl + (code === 'redirect-to-select-org') ? '/profile/select-org?signup=1' : '/';
    });
  }
}

coreModule.controller('TsSignup', TsSignup);
