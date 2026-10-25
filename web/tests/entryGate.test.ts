import { shouldShowEntryGate } from '../components/modals/EntryNameGate/defaults';

describe('shouldShowEntryGate', () => {
  test('shows on every visit until the button is pressed', () => {
    expect(
      shouldShowEntryGate({
        configLoaded: true,
        enabled: true,
        enteredThisVisit: false,
      }),
    ).toBe(true);
  });

  test('hides after this visit confirms a name', () => {
    expect(
      shouldShowEntryGate({
        configLoaded: true,
        enabled: true,
        enteredThisVisit: true,
      }),
    ).toBe(false);
  });

  test('stays hidden when the switch is off or config is still loading', () => {
    expect(
      shouldShowEntryGate({
        configLoaded: true,
        enabled: false,
        enteredThisVisit: false,
      }),
    ).toBe(false);
    expect(
      shouldShowEntryGate({
        configLoaded: false,
        enabled: true,
        enteredThisVisit: false,
      }),
    ).toBe(false);
  });
});
