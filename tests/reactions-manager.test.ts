import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { ReactionPicker } from '../src/reactions-manager/ReactionPicker';
import ReactionOverlay from '../src/reactions-manager/ReactionOverlay';

const pickerTag = 'test-reaction-picker';
const overlayTag = 'test-reaction-overlay';

beforeAll(() => {
  if (!customElements.get(pickerTag)) customElements.define(pickerTag, ReactionPicker);
  if (!customElements.get(overlayTag)) customElements.define(overlayTag, ReactionOverlay);
});

afterEach(() => {
  document.body.replaceChildren();
});

describe('ReactionPicker', () => {
  it('renders configured reactions and broadcasts the selected reaction', () => {
    const broadcastMessage = vi.fn();
    const picker = document.createElement(pickerTag) as ReactionPicker;
    Reflect.set(picker, 'meeting', {
      self: { id: 'self-id' },
      participants: { broadcastMessage },
    });
    picker.reactions = [{ emoji: '🔥', label: 'fire' }];

    document.body.appendChild(picker);
    const button = picker.shadowRoot?.querySelector<HTMLButtonElement>('.reaction-button');

    expect(button?.textContent).toBe('🔥');
    expect(button?.title).toBe('fire');
    button?.click();
    expect(broadcastMessage).toHaveBeenCalledWith('reaction', {
      emoji: '🔥',
      peerId: 'self-id',
    });
  });

  it('updates the control bar label for compact sizes', () => {
    const picker = document.createElement(pickerTag) as ReactionPicker;
    document.body.appendChild(picker);
    const button = picker.shadowRoot?.querySelector('rtk-controlbar-button');

    picker.setAttribute('size', 'sm');
    expect(button?.getAttribute('label')).toBe('');

    picker.setAttribute('size', 'lg');
    expect(button?.getAttribute('label')).toBe('React');
  });
});

describe('ReactionOverlay', () => {
  it('shows the participant first name and removes the reaction after animation', () => {
    const on = vi.fn();
    const off = vi.fn();
    const overlay = document.createElement(overlayTag) as ReactionOverlay;
    Reflect.set(overlay, 'meeting', {
      self: { id: 'self-id', name: 'Self Person' },
      participants: {
        joined: new Map([['peer-id', { name: 'Ada Lovelace' }]]),
        on,
        off,
      },
    });

    document.body.appendChild(overlay);
    overlay.handleReactionUpdate({
      type: 'reaction',
      payload: { emoji: '👏', peerId: 'peer-id' },
    });

    const reaction = overlay.shadowRoot?.querySelector<HTMLElement>('.reaction-animation');
    expect(on).toHaveBeenCalledWith('broadcastedMessage', expect.any(Function));
    expect(reaction?.firstChild?.textContent).toBe('👏');
    expect(reaction?.querySelector('.reaction-participant-name')?.textContent).toBe('Ada');

    reaction?.dispatchEvent(new Event('animationend'));
    expect(overlay.shadowRoot?.querySelector('.reaction-animation')).toBeNull();

    overlay.remove();
    expect(off).toHaveBeenCalledWith('broadcastedMessage', expect.any(Function));
  });
});
