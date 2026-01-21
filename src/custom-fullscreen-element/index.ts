import { DyteUIBuilder, UIConfig } from "@dytesdk/ui-kit";
import { Meeting } from "@dytesdk/ui-kit/dist/types/types/dyte-client";

export interface CustomFullscreenElementArgs {
    targetElement: HTMLElement;
}

/**
 * CustomFullscreenElementAddOn
 * @description
 * Addon to add a target element different than the default dyte-meeting element.
 * Passed target element will be full-screened on click of dyte-fullscreen-toggle
 * @example
 * const addon = new CustomFullscreenElementAddOn({
 *   targetElement: document.getElementById('root')
 * });
 */
export default class CustomFullscreenElementAddOn {
    targetElement: HTMLElement;

    constructor(args: CustomFullscreenElementArgs) {
        this.targetElement = args.targetElement;
    }

    async unregister() {
        this.targetElement = null;
    }

    register(oldConfig: UIConfig, _meeting: Meeting, getBuilder: (c: UIConfig) => DyteUIBuilder) {
        // Clone config
        const builder = getBuilder(oldConfig);
        const config = builder.build();
        
        // Set targetElement to cloned config
        if (config.root && Array.isArray(config.root['div#controlbar-left'])) {
            const fullScreenToggleIndex = config.root['div#controlbar-left'].indexOf('dyte-fullscreen-toggle');
            if(fullScreenToggleIndex > -1){
                config.root['div#controlbar-left'][fullScreenToggleIndex] = ['dyte-fullscreen-toggle', {
                    variant: 'vertical',
                    targetElement: this.targetElement,
                }];
            }
        }
        // Handle smaller screens
        ['dyte-more-toggle.activeMoreMenu', 'dyte-more-toggle.activeMoreMenu.md', 'dyte-more-toggle.activeMoreMenu.sm'].forEach((configElemKey) => {
            const configElem = config?.root?.[configElemKey] as any;
            configElem?.forEach((dyteElemConfigSet: any) => {
                if (dyteElemConfigSet[0] === 'dyte-fullscreen-toggle') {
                    dyteElemConfigSet[1].targetElement = this.targetElement;
                }
            });
        });
        return config;
    }
}
