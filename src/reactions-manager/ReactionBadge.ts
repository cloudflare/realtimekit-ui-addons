export default class ReactionBadge extends HTMLElement {
    _shadowRoot = undefined;
    _participant = undefined;
    _meeting = undefined;
    _currentReaction = null;
    _timeout = null;
    messageHandler = undefined;

    static get observedAttributes() {
        return ["participant", "meeting"];
    }

    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ mode: "open" });
        this.handleReactionUpdate = this.handleReactionUpdate.bind(this);
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

    handleReactionUpdate({ type, payload }) {
        // Only handle reaction messages for this participant
        if (type === 'reaction' && payload.peerId === this.participant.id) {
            this.showReaction(payload.emoji);
        }
    }

    showReaction(emoji: string) {
        // Only update content if reaction changed or was hidden
        const shouldUpdate = this._currentReaction !== emoji;
        this._currentReaction = emoji;
        
        if (shouldUpdate) {
            this.updateContent();
        }

        // Clear any existing timeout
        if (this._timeout) {
            clearTimeout(this._timeout);
        }

        // Hide the reaction after 3 seconds
        this._timeout = setTimeout(() => {
            this._currentReaction = null;
            this.updateContent();
        }, 3000);
    }

    updateContent() {
        // Update PIP source so per-participant badges can still reflect
        // the last reaction for that participant
        const pip = this.meeting.participants.pip;
        pip.updateSource?.(this._participant.id, {
            reaction: this._currentReaction
        });
        this._shadowRoot.innerHTML = `
            <style>
                :host {
                    display: ${this._currentReaction ? 'flex' : 'none'};
                    position: absolute;
                    top: 5px;
                    left: 5px;
                    z-index: 10;
                }
                .reaction-badge {
                    background: rgba(0, 0, 0, 0.6);
                    border-radius: 50%;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    animation: pop-in 0.3s ease-out;
                }
                @keyframes pop-in {
                    0% {
                        transform: scale(0);
                    }
                    50% {
                        transform: scale(1.2);
                    }
                    100% {
                        transform: scale(1);
                    }
                }
            </style>
            <div class="reaction-badge">
                ${this._currentReaction || ''}
            </div>
        `;
    }

    connectedCallback() {
        this.updateContent();

        // Listen to broadcasted messages
        this.messageHandler = this.handleReactionUpdate.bind(this);
        this.meeting.participants.on('broadcastedMessage', this.messageHandler);
    }

    disconnectedCallback() {
        if (this.messageHandler) {
            this.meeting.participants.off('broadcastedMessage', this.messageHandler);
        }
        if (this._timeout) {
            clearTimeout(this._timeout);
        }
    }

    attributeChangedCallback() {
        this.updateContent();
    }
}
