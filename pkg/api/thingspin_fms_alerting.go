package api

import (
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/alerting"
)

func GetTsAlertNotifiers(c *models.ReqContext) Response {
	notifiers := alerting.GetNotifiers()
	var tsNotifiers []*alerting.NotifierPlugin
	for _, value := range notifiers {
		if value.Type == "email" {
			value.OptionsTemplate = `
			<div class="ts-notification-email-area">
				<span class="ts-notification-email-title">Email 주소</span>
				<div class="ts-notification-divider"></div>
				<div class="gf-form">
					<textarea rows="7" class="gf-form-input width-27" required ng-model="ctrl.model.settings.addresses"></textarea>
				</div>
				<div class="gf-form">
					<span>다중 메일을 보낼때 ","를 입력하세요.</span>
				</div>
			</div>
			`
			tsNotifiers = append(tsNotifiers, value)
		}else if value.Type == "webhook" {
			value.OptionsTemplate = `
			<div class="ts-notification-webhook-area">
				<span class="ts-notification-webhook-title">Webhook 설정</span>
				<div class="ts-notification-divider"></div>
				<div class="gf-form">
				<span class="gf-form-label width-10">Url</span>
				<input type="text" required class="gf-form-input max-width-26" ng-model="ctrl.model.settings.url"></input>
				</div>
				<div class="gf-form">
				<span class="gf-form-label width-10">Http Method</span>
				<div class="gf-form-select-wrapper width-14">
					<select class="gf-form-input" ng-model="ctrl.model.settings.httpMethod" ng-options="t for t in ['POST', 'PUT']">
					</select>
				</div>
				</div>
				<div class="gf-form">
				<span class="gf-form-label width-10">Username</span>
				<input type="text" class="gf-form-input max-width-14" ng-model="ctrl.model.settings.username"></input>
				</div>
				<div class="gf-form">
				<span class="gf-form-label width-10">Password</span>
				<input type="text" class="gf-form-input max-width-14" ng-model="ctrl.model.settings.password"></input>
				</div>
			</div>
		  `
			tsNotifiers = append(tsNotifiers, value)
		}
	}
	return JSON(200, tsNotifiers)
}