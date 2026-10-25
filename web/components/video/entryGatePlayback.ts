export const ENTRY_PLAY_EVENT = 'oc-entry-play';

let pendingEntryPlayback = false;

const startPlayer = (player: {
  muted?: (value?: boolean) => boolean;
  play?: () => Promise<void> | undefined;
}) => {
  try {
    player.muted?.(false);
  } catch {
    // A player that is still constructing can reject mute changes.
  }
  const pending = player.play?.();
  if (pending && typeof pending.catch === 'function') {
    pending.catch(() => {
      try {
        player.muted?.(true);
        player.play?.();
      } catch {
        // Playback can start on the next ready event.
      }
    });
  }
};

// requestEntryPlayback starts the live player from the entry-card click.
// The click is the user gesture browsers require before sound can play.
export const requestEntryPlayback = () => {
  pendingEntryPlayback = true;
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(new Event(ENTRY_PLAY_EVENT));
};

export const playEntryGateNow = (
  player: {
    muted?: (value?: boolean) => boolean;
    play?: () => Promise<void> | undefined;
  } | null,
) => {
  if (!player || typeof player.play !== 'function') {
    return;
  }
  pendingEntryPlayback = false;
  startPlayer(player);
};

export const playEntryGateIfRequested = (
  player: {
    muted?: (value?: boolean) => boolean;
    play?: () => Promise<void> | undefined;
  } | null,
) => {
  if (!pendingEntryPlayback) {
    return;
  }
  playEntryGateNow(player);
};
