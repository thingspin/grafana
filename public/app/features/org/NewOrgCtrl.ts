import angular from 'angular';
import config from 'app/core/config';
import { BackendSrv } from 'app/core/services/backend_srv';
import { NavModelSrv } from 'app/core/core';

export class NewOrgCtrl {
  /** @ngInject */
  constructor($scope: any, $http: any, backendSrv: BackendSrv, navModelSrv: NavModelSrv) {
    $scope.navModel = navModelSrv.getNav('admin', 'global-orgs', 0);
    $scope.newOrg = { name: '' };

    $scope.createOrg = () => {
      backendSrv.post('/api/orgs/', $scope.newOrg).then((result: any) => {
        // Create the default menu based on default org
        backendSrv.get("/thingspin/org/default/1").then( defaultData => {
          const jsonDefaultData = {
            defaultMenu: defaultData
          };
          backendSrv.post('/thingspin/org/new/'+result.orgId,jsonDefaultData).then( () => {
            // Add the user into the new org
            backendSrv.post('/api/user/using/' + result.orgId).then(() => {
              window.location.href = config.appSubUrl + '/org';
            });
          });
        });
      });
    };
  }
}

angular.module('grafana.controllers').controller('NewOrgCtrl', NewOrgCtrl);
