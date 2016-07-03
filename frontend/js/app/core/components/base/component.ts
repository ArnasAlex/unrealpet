/// <reference path="../../../../typings/refs.d.ts" />
import ko = require('knockout');

export class Component implements Components.IComponent{
    name: string;
    template: string | Components.IRequiredTemplate;
    createViewModel: () => Components.IComponentViewModel;

    register(){
        ko.components.register(this.name, this.getConfig());
    }

    getBaseTemplatePath() {
        return 'text!core/components/'
    }

    private getConfig() {
        return {
            viewModel: {
                createViewModel: (params, componentInfo) => {
                    var model = this.createViewModel();
                    model.init(params.options, componentInfo.element);
                    return model;
                }
            },
            template: this.template
        };
    }
}