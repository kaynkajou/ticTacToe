import '@testing-library/jest-dom/vitest';
import matchers from '@chialab/vitest-axe';
import { expect } from 'vitest';

expect.extend(matchers);
