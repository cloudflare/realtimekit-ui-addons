import { RTKStore } from "@cloudflare/realtimekit";
import { HandRaiseIcon } from "./HandRaiseButton";

export default class RaisedHand extends HTMLElement {
    _shadowRoot = undefined;
    _participant = undefined;
    _raised = false;
    _meeting = undefined;
    
    handRaisedStore: RTKStore = undefined;
    
    static icon = HandRaiseIcon;

    static get observedAttributes() {
        return ["raised"];
    }

    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ mode: "open" });
        this.updateShowHand = this.updateShowHand.bind(this);
    }

    get participant() {
        return this._participant;
    }

    set participant(participant) {
        this._participant = participant;
    }

    set meeting(meeting) {
        this._meeting = meeting;
    }

    get meeting() {
        return this._meeting;
    }

    get raised() {
        return this._raised;
    }

    set raised(raised) {
        this._raised = raised;
    }

    disconnectedCallback() {
        this.handRaisedStore.unsubscribe(this.participant.id, this.updateShowHand);
    }

    updateShowHand() {
        this.raised = !!this.handRaisedStore.get(this.participant.id)?.raised;
        this.updateContent();

        const participant = this.participant.id === this.meeting.self.id ? this.meeting.self : this.meeting.participants.joined.get(this.participant.id);
        
        /**
         * NOTE(ravindra-cloudflare): this is needed since PIP of web-core relies on this
         * In future, Web Core should also start using RTKStore
        */
        participant.raised = this.raised;

        /**
         * NOTE(ravindra-cloudflare): These PIP related lines are needed to show hand raise in PIP
         * */
        const pip = this.meeting.participants.pip;
        pip.updateSource?.(participant.id, {
            handRaised: this.raised
        });

    }

    connectedCallback() {
        this.handRaisedStore = this.meeting.stores.stores.get('handRaise');
        this.raised = !!this.handRaisedStore.get(this.participant.id)?.raised;
        this.handRaisedStore.subscribe(this.participant.id, this.updateShowHand);
        this.updateShowHand();
    }

    attributeChangedCallback() {
        this.updateContent();
    }

    updateContent() {
        this._shadowRoot.innerHTML = `
	  <style>
		:host {
		  display: ${this.raised ? 'flex': 'none'};
          color: var(--rtk-colors-brand-500, 33 96 253);
		}
	  </style>
	  <div style="position: absolute; top: 5px; right: 5px; height: 32px; width: 32px;">
		  ${RaisedHand.icon}
	  </div>
	`;
    }
}
