import '@testing-library/jest-dom';

// Setup global expect matchers for jest-dom
import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// @ts-ignore
expect.extend(matchers); 