import type { Ref } from 'react';
import { STATUS_REGION_ID } from './StatusRegion';

interface NewRoundButtonProps {
  onClick: () => void;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * Always-visible, always-enabled New round control (D-06). Never sets
 * disabled or aria-disabled. aria-describedby points at the status region
 * (D-09), so focusing this button reads the current result too.
 *
 * React 19 ref-as-prop: `ref` is an ordinary prop, no forwardRef wrapper.
 */
export function NewRoundButton({ onClick, ref }: NewRoundButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      aria-describedby={STATUS_REGION_ID}
      onClick={onClick}
    >
      New round
    </button>
  );
}
