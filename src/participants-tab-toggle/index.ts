import { RtkUiBuilder, UIConfig } from "@cloudflare/realtimekit-ui";
import { Meeting } from "@cloudflare/realtimekit-ui/dist/types/types/rtk-client";
import ActionToggle from "./ActionToggle";

export interface ParticipantTabToggleArgs {
    position: "start" | "end";
    label: string;
    initialValue?: () => boolean;
    onEnabled: () => void;
    onDisabled: () => void;
    onStateChange?: (callback: (state: boolean) => void) => void;
    attributes?: { [key: string]: any };
}

/**
 * This class is used to add a button to the participants tab.
 * The button can be added to the start or end of the tab.
 *
 * @param {string} args.position - The position of the button. Can be 'start' or 'end'.
 * @param {string} args.label - The label of the button.
 * @param {string} args.label - Function to return the initial state, component might be removed from DOM and thus does not retain its state
 * @param {Function} args.onEnabled - The function to be called when the toggle is checked
 * @param {Function} args.onDisabled - The function to be called when the toggle is unchecked
 * @param {Object} args.attributes - The attributes to be added to the button.
 *
 * @returns {UIConfig} modified config
 *
 * @example
 *  action = new ParticipantTabToggle({
 *     onEnabled: () => {
 *       alert('toggled true!');
 *     },
 *     onDisabled: () => {
 *       alert('toggled true!');
 *     },
 *     label: 'Click me',
 *     initialValue?: () => true;
 *     position: 'start',
 *   });
 *  pass the action to the addon register function
 */
export default class ParticipantTabToggle {
    meeting?: Meeting;

    onEnabled: () => void;

    onDisabled: () => void;

    label: string;

    position = "start";

    initialValue: () => boolean = () => false;

    onStateChange: (cb: (state: boolean) => void) => void = () => {};

    constructor(args: ParticipantTabToggleArgs) {
        this.position = args.position;
        this.label = args.label;
        this.onEnabled = args.onEnabled;
        this.onDisabled = args.onDisabled;
        if(args.initialValue){
            this.initialValue = args.initialValue
        }
        this.onStateChange = args.onStateChange;
    }

    async unregister() {
        // TODO: Remove the changer from the body
    }

    register(config: UIConfig, meeting: Meeting, getBuilder: (c: UIConfig) => RtkUiBuilder) {
        if (!customElements.get("participant-tab-toggle")) {
            customElements.define(
                "participant-tab-toggle",
                ActionToggle
            );
        }

        this.meeting = meeting;
        if(!config.root) return config;

        if (!config.root["rtk-participants"]) {
            config.root["rtk-participants"] = {};
        }

        // Add buttons with config
        const builder = getBuilder(config);
        const participants = builder.find(`rtk-participants`);
        participants?.add("participant-tab-toggle", {
            slot: this.position,
            label: this.label,
            // @ts-ignore
            initialValue: this.initialValue,
            // @ts-ignore
            onStateChange: this.onStateChange,
            // @ts-ignore
            onEnabled: this.onEnabled,
            // @ts-ignore
            onDisabled: this.onDisabled,
        });

        // Return the updated config
        return builder.build();
    }
}
