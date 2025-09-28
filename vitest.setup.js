import { beforeEach, afterEach } from 'vitest';
import 'dotenv/config';

// Setup global test environment
beforeEach(() => {
    // Reset environment variables before each test
    process.env.NODE_ENV = 'test';
});

afterEach(() => {
    // Clean up after each test if needed
});