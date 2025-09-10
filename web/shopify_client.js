import fetch from 'node-fetch';

/**
 * The GraphQL query for fetching abandoned checkouts.
 * We are requesting the last 10, sorted by creation date.
 */
const GET_ABANDONED_CHECKOUTS_QUERY = `
  query GetAbandonedCheckouts($first: Int!) {
    abandonedCheckouts(first: $first) {
      edges {
        node {
          id
          abandonedCheckoutUrl
          createdAt
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          customer {
            firstName
            lastName
            verifiedEmail
          }
          lineItems(first: 5) {
            edges {
              node {
                title
                quantity
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Fetches data from the Shopify Admin API using a GraphQL query.
 *
 * @param {string} query The GraphQL query string.
 * @param {object} variables The variables for the GraphQL query.
 * @returns {Promise<object>} The JSON response from the Shopify API.
 * @throws {Error} If the API call fails.
 */
async function fetchFromShopify(query, variables) {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  if (!storeDomain || !accessToken) {
    throw new Error('Shopify store domain and access token are required. Please check your .env file.');
  }

  const endpoint = `https://${storeDomain}/admin/api/2025-07/graphql.json`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    const jsonResponse = await response.json();

    if (jsonResponse.errors) {
      console.error('GraphQL Errors:', jsonResponse.errors);
      throw new Error('Failed to fetch data from Shopify API.');
    }

    return jsonResponse.data;
  } catch (error) {
    console.error('Error fetching from Shopify:', error);
    throw error;
  }
}

/**
 * Debug function to check environment variables
 */
export function debugEnvVars() {
  return {
    storeDomain: process.env.SHOPIFY_STORE_DOMAIN || 'NOT_SET',
    hasAccessToken: !!process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
    accessTokenLength: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ? process.env.SHOPIFY_ADMIN_ACCESS_TOKEN.length : 0,
    nodeEnv: process.env.NODE_ENV || 'NOT_SET'
  };
}

/**
 * A specific function to get abandoned checkouts.
 * This wraps the generic fetch function with the specific query and logic.
 *
 * @param {number} limit The number of checkouts to retrieve.
 * @param {number} daysAgo How many days back to search (Note: GraphQL abandonedCheckouts doesn't support date filtering).
 * @returns {Promise<Array<object>>} A formatted list of abandoned checkouts.
 */
export async function getAbandonedCheckouts(limit = 10, daysAgo = 7) {
  // Note: The GraphQL abandonedCheckouts field doesn't support date filtering or sorting
  // We'll get the most recent ones and filter client-side if needed
  const variables = {
    first: limit
  };

  const data = await fetchFromShopify(GET_ABANDONED_CHECKOUTS_QUERY, variables);
  
  // Get all checkouts
  let checkouts = data.abandonedCheckouts.edges.map(edge => ({
    id: edge.node.id,
    abandonedCheckoutUrl: edge.node.abandonedCheckoutUrl,
    createdAt: edge.node.createdAt,
    totalPrice: {
      amount: edge.node.totalPriceSet.shopMoney.amount,
      currencyCode: edge.node.totalPriceSet.shopMoney.currencyCode
    },
    customer: edge.node.customer,
    lineItems: edge.node.lineItems.edges.map(itemEdge => itemEdge.node)
  }));

  // Filter by date (client-side since GraphQL doesn't support it)
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - daysAgo);
  
  checkouts = checkouts.filter(checkout => {
    const checkoutDate = new Date(checkout.createdAt);
    return checkoutDate >= sinceDate;
  });

  // Sort by total price (highest first) as per requirements
  checkouts.sort((a, b) => {
    const totalA = parseFloat(a.totalPrice.amount || '0');
    const totalB = parseFloat(b.totalPrice.amount || '0');
    return totalB - totalA;
  });

  return checkouts;
}
