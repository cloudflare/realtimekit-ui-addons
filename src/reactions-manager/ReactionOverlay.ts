const OVERLAY_STYLES = `
    :host {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        overflow: hidden;
        z-index: 10;
    }

    .reaction-animation {
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 32px;
        animation: float-up 3s ease-out forwards;
        pointer-events: none;
    }

    .reaction-participant-name {
        margin-top: 4px;
        color: rgb(var(--rtk-colors-text-1000, 255 255 255));
        font-size: 12px;
        font-weight: 500;
        line-height: 1;
        text-shadow: 0 1px 2px rgba(var(--rtk-colors-background-1000, 0 0 0) / 0.8);
    }

    @keyframes float-up {
        0% {
            transform: translateY(0) translateX(0) scale(0.5);
            opacity: 0;
        }
        20% {
            transform: translateY(-60px) translateX(calc(var(--drift-x, 20px) * 0.2)) scale(1);
            opacity: 1;
        }
        90% {
            transform: translateY(-270px) translateX(calc(var(--drift-x, 20px) * 0.9)) scale(1);
            opacity: 1;
        }
        100% {
            transform: translateY(-300px) translateX(var(--drift-x, 20px)) scale(0.5);
            opacity: 0;
        }
    }
`;

export default class ReactionOverlay extends HTMLElement {
    _shadowRoot = undefined;
    _meeting = undefined;
    messageHandler = undefined;

    static get observedAttributes() {
        return ["meeting"];
    }

    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ mode: "open" });
        this.handleReactionUpdate = this.handleReactionUpdate.bind(this);
    }

    set meeting(meeting) {
        this._meeting = meeting;
    }

    get meeting() {
        return this._meeting;
    }

    handleReactionUpdate({ type, payload }) {
        if (type !== 'reaction') return;

        const participant = payload.peerId === this.meeting.self.id
            ? this.meeting.self
            : this.meeting.participants.joined.get(payload.peerId);
        const firstName = participant?.name?.trim().split(/\s+/)[0];

        // Show a floating reaction for any participant's reaction
        this.showReaction(payload.emoji, firstName);
    }

    showReaction(emoji: string, firstName?: string) {
        const reactionEl = document.createElement('div');
        reactionEl.className = 'reaction-animation';
        reactionEl.textContent = emoji;

        if (firstName) {
            const nameEl = document.createElement('span');
            nameEl.className = 'reaction-participant-name';
            nameEl.textContent = firstName;
            reactionEl.appendChild(nameEl);
        }
        
        // Start near the bottom-left of the overall meeting area with slight
        // horizontal variation so multiple reactions can be seen together.
        const startX = 2 + (Math.random() * 12); // 2-14% from left
        reactionEl.style.left = `${startX}%`;
        reactionEl.style.bottom = `5%`;
        
        // Random drift direction
        const driftX = (Math.random() - 0.5) * 50; // -25px to +25px
        reactionEl.style.setProperty('--drift-x', `${driftX}px`);
        this._shadowRoot.appendChild(reactionEl);

        // Clean up the element once its animation finishes
        reactionEl.addEventListener('animationend', () => {
            if (reactionEl.parentNode) {
                reactionEl.parentNode.removeChild(reactionEl);
            }
        });
    }

    connectedCallback() {
        // Add styles
        const style = document.createElement('style');
        style.textContent = OVERLAY_STYLES;
        this._shadowRoot.appendChild(style);

        // Listen to broadcasted messages
        this.messageHandler = this.handleReactionUpdate.bind(this);
        this.meeting.participants.on('broadcastedMessage', this.messageHandler);
    }

    disconnectedCallback() {
        if (this.messageHandler) {
            this.meeting.participants.off('broadcastedMessage', this.messageHandler);
        }
    }

    attributeChangedCallback() {
        // Handle attribute changes if needed
    }
}
