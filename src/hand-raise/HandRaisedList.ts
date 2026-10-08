import { RTKStore } from '@cloudflare/realtimekit';

const STYLES = `
    :host {
        display: flex;
        width: 100%;
        flex-direction: column;
        line-height: initial;
        font-family: var(--rtk-font-family, sans-serif);
        font-feature-settings: normal;
        font-variation-settings: normal;
        margin-top: var(--rtk-space-2, 8px);
        margin-bottom: var(--rtk-space-2, 8px);
        box-sizing: border-box;
        padding-left: var(--rtk-space-3, 12px);
        padding-right: var(--rtk-space-3, 12px);
        padding-top: var(--rtk-space-0, 0px);
        padding-bottom: var(--rtk-space-0, 0px);
        flex-basis: 0px;
    }

    .container {
        margin-bottom: var(--rtk-space-4, 16px);
        width: 100%;
    }

    .heading-count {
        margin: var(--rtk-space-0, 0px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--rtk-space-0, 0px);
        font-size: 14px;
        font-weight: 400;
        color: rgb(var(--rtk-colors-text-900, 255 255 255 / 0.88));
        text-align: center;
    }

    .participants {
        margin-top: var(--rtk-space-2, 8px);
        margin-bottom: var(--rtk-space-0, 0px);
        padding: var(--rtk-space-0, 0px);
        list-style-type: none;
    }

    :host rtk-avatar {
      height: var(--rtk-space-8, 32px);
      width: var(--rtk-space-8, 32px);
      margin-right: var(--rtk-space-2, 8px);
    }

    .participant-details {
      display: flex;
      height: var(--rtk-space-14, 56px);
      align-items: center;
      justify-content: space-between;
    }

    .left {
      display: flex;
      align-items: center;
    }

    .right {
      display: flex;
      align-items: center;
    }
    .no-raised-hands {
        display: flex;
        justify-content: center;
    }
`;

const removeIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m4.397 4.554.073-.084a.75.75 0 0 1 .976-.073l.084.073L12 10.939l6.47-6.47a.75.75 0 1 1 1.06 1.061L13.061 12l6.47 6.47a.75.75 0 0 1 .072.976l-.073.084a.75.75 0 0 1-.976.073l-.084-.073L12 13.061l-6.47 6.47a.75.75 0 0 1-1.06-1.061L10.939 12l-6.47-6.47a.75.75 0 0 1-.072-.976l.073-.084-.073.084Z" fill="currentColor"/></svg>';


export class HandRaisedList extends HTMLElement {
    shadow;

    _meeting = undefined;

    _onRemove = undefined;

    handRaisedStore: RTKStore = undefined;

    constructor() {
        super();
        // Create a shadow root
        this.shadow = this.attachShadow({ mode: "open" });
        const style = document.createElement("style");
        style.innerHTML = STYLES;
        this.shadow.appendChild(style);
        this.updateContent = this.updateContent.bind(this);
    }

    static get observedAttributes() {
        return ["meeting", "raised", "onRemove"];
    }

    set meeting(meeting) {
        this._meeting = meeting;
        this.handRaisedStore = meeting.stores.stores.get('handRaise');
        this.updateContent();
    }

    get meeting() {
        return this._meeting;
    }

    set onRemove(onRemove) {
        this._onRemove = onRemove;
    }

    get onRemove() {
        return this._onRemove;
    }

    attributeChangedCallback() {
        this.updateContent();
    }

    createElement(name: string, className: string, id?: string) {
        const ele = document.createElement(name);
        ele.setAttribute("class", className);
        if (id) {
            ele.setAttribute("id", id);
        }
        return ele;
    }

    participantItem(participant) {
        const part = this.createElement("li", "participant");
        const participantDetails = this.createElement(
            "div",
            "participant-details"
        );

        const left = this.createElement("div", "left");
        const avatar = this.createElement("rtk-avatar", "avatar");
        avatar.setAttribute("participant", participant);
        avatar.setAttribute("size", "sm");
        left.appendChild(avatar);
        const name = this.createElement("p", "name");
        name.innerText = participant.name;
        left.appendChild(name);
        participantDetails.appendChild(left);

        const right = this.createElement("div", "right");
        const controls = this.createElement("div", "controls");
        const lowerHand = this.createElement("rtk-button", "lower-hand");
        // @ts-ignore
        lowerHand.label = 'Lower Hand';
        // @ts-ignore
        lowerHand.kind = 'icon';
        // @ts-ignore
        lowerHand.variant = 'ghost';
        // @ts-ignore
        lowerHand.onclick = () => {
            this._onRemove?.(participant.id);
        };

        const i = this.createElement('rtk-icon', 'icon');
        // @ts-ignore
        i.icon = removeIcon;
        // @ts-ignore
        i.size = 'sm';

        lowerHand.appendChild(i);
        controls.appendChild(lowerHand);
        right.appendChild(controls);
        participantDetails.appendChild(right);
        part.appendChild(participantDetails);
        return part;
    }

    updateContent() {
        const ul = this.shadow.querySelector("ul.participants");
        ul.innerHTML = "";

        const handRaiseData = this.handRaisedStore.getAll();
        // Only filter raise hand as true
        const raisedHands = Object.keys(handRaiseData).filter(key=>handRaiseData[key]?.raised);

        raisedHands.sort((participantId1, participantId2) => handRaiseData[participantId1].raisedOn - handRaiseData[participantId2].raisedOn);

        raisedHands.map((participantId) => {
            const participant =
                this.meeting.participants.joined.get(participantId);
            const self = this.meeting.self;
            if (participant) {
                ul.appendChild(this.participantItem(participant));
            } else if (self.id === participantId) {
                ul.appendChild(this.participantItem(this.meeting.self));
            }
        });

        if(!raisedHands?.length){
            ul.innerHTML = `
                <div class="no-raised-hands">
                    There are no raised hands.
              </div>
            `;
        }
    }

    createContainer() {
      const container = this.createElement(
        "div",
        "container",
        "hand-raised-list"
      );
      const heading = this.createElement("div", "heading-count");
      heading.innerText = "Raised Hands";
      container.appendChild(heading);
      const ul = this.createElement("ul", "participants");
      container.appendChild(ul);
      this.shadow.appendChild(container);
    }

    connectedCallback() {
        this.createContainer();
        this.updateContent();
        this.handRaisedStore.subscribe("*", this.updateContent);
    }

    disconnectedCallback(){
        this.handRaisedStore.unsubscribe("*", this.updateContent);
    }
}
