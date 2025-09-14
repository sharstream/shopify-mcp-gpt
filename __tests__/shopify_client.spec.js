import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('node-fetch');
vi.mock('../db/database.js');

import fetch from 'node-fetch';
import { checkIfOfferSentRecently } from '../db/database.js';
import { getAbandonedCheckouts } from '../src/shopify_client.js';

const createCheckoutNode = (id, createdAt, amount, customer = {}, lineItems = []) => ({
  node: {
    id,
    abandonedCheckoutUrl: `https://test.myshopify.com/checkout/${id}`,
    createdAt,
    totalPriceSet: { shopMoney: { amount, currencyCode: 'USD' } },
    customer: { firstName: 'John', lastName: 'Doe', verifiedEmail: 'john.doe@example.com', ...customer },
    lineItems: { edges: lineItems.map(item => ({ node: item })) },
  },
});

const mockApiResponse = (edges) => ({
  abandonedCheckouts: { edges },
});

describe('Shopify Client', () => {
  beforeEach(() => {
    process.env.SHOPIFY_STORE_DOMAIN = 'test-store.myshopify.com';
    process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = 'test-token';
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.SHOPIFY_STORE_DOMAIN;
    delete process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  });

  describe('getAbandonedCheckouts', () => {
    it('should fetch, filter, and sort checkouts correctly', async () => {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString();

      const checkouts = [
        createCheckoutNode('checkout1', oneDayAgo, '150.00'), // recent, high value
        createCheckoutNode('checkout2', oneDayAgo, '50.00'),  // recent, low value, already contacted
        createCheckoutNode('checkout3', tenDaysAgo, '200.00'), // too old
        createCheckoutNode('checkout4', oneDayAgo, '100.00'), // recent, mid value
      ];
      
      const response = {
        json: vi.fn().mockResolvedValue({ data: mockApiResponse(checkouts) }),
      };
      fetch.mockResolvedValue(response);

      checkIfOfferSentRecently.mockImplementation(({ checkout_id }) => {
        return Promise.resolve(checkout_id === 'checkout2');
      });

      const result = await getAbandonedCheckouts(2, 7);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('checkout1'); // Highest value first
      expect(result[1].id).toBe('checkout4');
      expect(result.some(c => c.id === 'checkout2')).toBe(false); // Should be filtered out
      expect(result.some(c => c.id === 'checkout3')).toBe(false); // Should be filtered out (too old)

      expect(fetch).toHaveBeenCalledWith(
        'https://test-store.myshopify.com/admin/api/2025-07/graphql.json',
        expect.any(Object)
      );
    });

    describe('error handling', () => {
      let consoleErrorSpy;

      beforeEach(() => {
        // Suppress console.error for these specific tests
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      });

      afterEach(() => {
        // Restore console.error after each test
        consoleErrorSpy.mockRestore();
      });

      it('should throw an error if the Shopify API call fails', async () => {
        fetch.mockRejectedValue(new Error('API Failure'));
        await expect(getAbandonedCheckouts()).rejects.toThrow('API Failure');
      });

      it('should throw an error if GraphQL response contains errors', async () => {
        const errorResponse = {
            json: vi.fn().mockResolvedValue({ errors: [{ message: 'Invalid query' }] }),
        };
        fetch.mockResolvedValue(errorResponse);
        await expect(getAbandonedCheckouts()).rejects.toThrow('Failed to fetch data from Shopify API.');
      });
    });

    it('should throw an error if environment variables are not set', async () => {
      delete process.env.SHOPIFY_STORE_DOMAIN;
      await expect(getAbandonedCheckouts()).rejects.toThrow('Shopify store domain and access token are required.');
    });
  });
});
