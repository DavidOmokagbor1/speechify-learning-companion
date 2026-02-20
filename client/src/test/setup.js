import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

vi.stubGlobal('speechSynthesis', {
  getVoices: () => [],
  speak: () => {},
  cancel: () => {},
  pause: () => {},
  resume: () => {},
});
