import _ from 'lodash';
import $ from 'jquery';
import coreModule from 'app/core/core_module';

const template = /* html */`
<div class="dropdown cascade-open">
  <span>
    <span class="query-part-parameters"></span>
  </span>
</div>
`;

/** @ngInject */
export function tsQueryPartEditorDirective(templateSrv: any): angular.IDirective {
  const paramTemplate = '<input type="text" class="hide input-mini tight-form-func-param"></input>';

  return {
    restrict: 'E',
    template,
    scope: {
      part: '=',
      handleEvent: '&',
      debounce: '@',
    },
    link: function postLink($scope: any, elem: any) {
      const { part } = $scope;
      const partDef = part.def;
      const $paramsContainer = elem.find('.query-part-parameters');
      const debounceLookup = $scope.debounce;

      $scope.partActions = [];

      function clickFuncParam(this: HTMLAnchorElement, paramIndex: number) {
        /*jshint validthis:true */
        const $link = $(this);
        const $input = $link.next();

        $input.val(part.params[paramIndex]);
        $input.css('width', `${$link.width() + 16}px`);

        $link.hide();
        $input.show();
        $input.focus();
        $input.select();

        const typeahead = $input.data('typeahead');
        if (typeahead) {
          $input.val('');
          typeahead.lookup();
        }
      }

      function inputBlur(this: HTMLInputElement, paramIndex: number) {
        /*jshint validthis:true */
        const $input = $(this);
        const $link = $input.prev();
        const newValue = $input.val();

        if (newValue !== '' || part.def.params[paramIndex].optional) {
          $link.html(templateSrv.highlightVariablesAsHtml(newValue));

          part.updateParam($input.val(), paramIndex);
          $scope.$apply(() => {
            $scope.handleEvent({ $event: { name: 'part-param-changed' } });
          });
        }

        $input.hide();
        $link.show();
      }

      function inputKeyPress(this: HTMLInputElement, paramIndex: number, e: any) {
        if (e.which === 13) {
          /*jshint validthis:true */
          inputBlur.call(this, paramIndex);
        }
      }

      function inputKeyDown(this: HTMLInputElement) {
        /*jshint validthis:true */
        this.style.width = `${(3 + this.value.length) * 8}px`;
      }

      function addTypeahead($input: JQuery, { options, dynamicLookup, type }: any, paramIndex: number) {
        if (!options && !dynamicLookup) {
          return;
        }

        const typeaheadSource = (query: string, callback: any) => {
          if (options) {
            return (type === 'int')
              ? _.map(options, (val: any) => val.toString() )
              : options;
          }

          $scope.$apply(() => {
            $scope.handleEvent({ $event: { name: 'get-param-options' } }).then((result: any) => {
              const dynamicOptions = _.map(result, ({ value }: any) => _.escape(value));
              callback(dynamicOptions);
            });
          });
        };

        $input.attr('data-provide', 'typeahead');

        // Bootstrap 3 typeahead plugin
        $input.typeahead({
          source: typeaheadSource,
          minLength: 0,
          items: 1000,
          updater: (value: string) => {
            value = _.unescape(value);
            setTimeout(() => {
              inputBlur.call($input[0], paramIndex);
            }, 0);
            return value;
          },
        });

        const typeahead = $input.data('typeahead');
        typeahead.lookup = function () { // add method
          this.query = this.$element.val() || '';
          const items = this.source(this.query, $.proxy(this.process, this));
          return items ? this.process(items) : items;
        };

        if (debounceLookup) {
          typeahead.lookup = _.debounce(typeahead.lookup, 500, { leading: true });
        }
      }

      $scope.showActionsMenu = () => {
        $scope.handleEvent({ $event: { name: 'get-part-actions' } }).then((res: any) => {
          $scope.partActions = res;
        });
      };

      $scope.triggerPartAction = (action: string) => {
        $scope.handleEvent({ $event: { name: 'action', action: action } });
      };

      function addElementsAndCompile() {
        _.each(partDef.params, (param: any, index: number) => {
          if (param.optional && part.params.length <= index) {
            return;
          }

          if (index > 0) {
            $('<span>, </span>').appendTo($paramsContainer);
          }

          const paramValue = templateSrv.highlightVariablesAsHtml(part.params[index]);
          const $paramLink = $(`<a class="graphite-func-param-link pointer">${paramValue}</a>`);
          const $input = $(paramTemplate);

          $paramLink.appendTo($paramsContainer);
          $input.appendTo($paramsContainer);

          $input.blur(_.partial(inputBlur, index));
          $input.keyup(inputKeyDown);
          $input.keypress(_.partial(inputKeyPress, index));
          $paramLink.click(_.partial(clickFuncParam, index));

          addTypeahead($input, param, index);
        });
      }

      function relink() {
        $paramsContainer.empty();
        addElementsAndCompile();
      }

      relink();
    },
  };
}

coreModule.directive('tsQueryPartEditor', tsQueryPartEditorDirective);
