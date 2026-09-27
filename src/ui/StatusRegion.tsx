export const STATUS_REGION_ID = 'game-status';

interface StatusRegionProps {
  message: string;
}

/**
 * The one polite live region (D-07, D-09, A11Y-03). Always mounted for the
 * lifetime of the app; only its text child ever changes.
 */
export function StatusRegion({ message }: StatusRegionProps) {
  return (
    <p id={STATUS_REGION_ID} role="status" aria-live="polite">
      {message}
    </p>
  );
}
