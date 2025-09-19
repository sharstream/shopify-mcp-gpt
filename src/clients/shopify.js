import fetch from 'node-fetch';
import { checkIfOfferSentRecently } from '../../db/database.js';
import { loadQuery } from '../graphql/loader.js';

/**
 * Fetches data from the Shopify Admin API using a GraphQL query.
 *
 * @param {string} query The GraphQL query string.
 * @param {object} variables The variables for the GraphQL query.
 * @returns {Promise<object>} The JSON response from the Shopify API.
 * @throws {Error} If the API call fails.
 */
export async function fetchFromShopify(query, variables) {
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
  const variables = {
    first: limit * 2,
  };

  const GET_ABANDONED_CHECKOUTS_QUERY = await loadQuery('getAbandonedCheckouts');
  const data = await fetchFromShopify(GET_ABANDONED_CHECKOUTS_QUERY, variables);
  
  let allCheckouts = data.abandonedCheckouts.edges.map(edge => ({
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

  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - daysAgo);
  
  let recentCheckouts = allCheckouts.filter(checkout => {
    const checkoutDate = new Date(checkout.createdAt);
    return checkoutDate >= sinceDate;
  });

  const uncontactedCheckouts = [];
  for (const checkout of recentCheckouts) {
    const alreadySent = await checkIfOfferSentRecently({ checkout_id: checkout.id });
    if (!alreadySent) {
      uncontactedCheckouts.push(checkout);
    }
  }

  uncontactedCheckouts.sort((a, b) => {
    const totalA = parseFloat(a.totalPrice.amount || '0');
    const totalB = parseFloat(b.totalPrice.amount || '0');
    return totalB - totalA;
  });

  return uncontactedCheckouts.slice(0, limit);
}

/**
 * Retrieves the total number of products in the Shopify store.
 * @returns {Promise<number>} The total count of products.
 */
export async function getProductCount() {
  const query = `
    query {
      productsCount {
        count
      }
    }
  `;

  const data = await fetchFromShopify(query);
  return data.productsCount.count;
}

/**
 * Updates the delivery status of a marketing activity for a specific abandonment.
 * @param {object} args The arguments for the mutation.
 * @param {string} args.abandonmentId The ID of the abandonment.
 * @param {string} args.marketingActivityId The ID of the marketing activity.
 * @param {string} args.deliveryStatus The delivery status (e.g., 'SENT', 'NOT_SENT').
 * @param {string} [args.deliveredAt] The ISO 8601 timestamp when the delivery was executed.
 * @param {string} [args.deliveryStatusChangeReason] The reason for the status change.
 * @returns {Promise<object>} The result of the mutation.
 */
export async function updateAbandonmentDeliveryStatus(args) {
  const {
    abandonmentId,
    marketingActivityId,
    deliveryStatus,
    deliveredAt,
    deliveryStatusChangeReason,
  } = args;

  const UPDATE_STATUS_MUTATION = await loadQuery('abandonmentUpdateActivitiesDeliveryStatuses');
  
  const variables = {
    abandonmentId,
    marketingActivityId,
    deliveryStatus,
    deliveredAt,
    deliveryStatusChangeReason,
  };

  const data = await fetchFromShopify(UPDATE_STATUS_MUTATION, variables);

  if (data.abandonmentUpdateActivitiesDeliveryStatuses.userErrors.length > 0) {
    throw new Error(`Failed to update delivery status: ${JSON.stringify(data.abandonmentUpdateActivitiesDeliveryStatuses.userErrors)}`);
  }

  return data.abandonmentUpdateActivitiesDeliveryStatuses.abandonment;
}

/**
 * Sends a complete abandonment recovery offer by creating a marketing activity
 * and updating its delivery status. This combines the full workflow.
 * @param {object} args The arguments for the complete recovery flow.
 * @param {string} args.abandonmentId The ID of the abandonment.
 * @param {string} args.customerId The ID of the customer.
 * @param {string} args.customerEmail The customer's email address.
 * @param {string} args.offerType The type of offer being sent (e.g., 'discount', 'reminder').
 * @param {string} [args.discountPercent] The discount percentage if applicable.
 * @returns {Promise<object>} The result of the complete recovery process.
 */
export async function sendAbandonmentRecoveryOffer(args) {
  const {
    abandonmentId,
    customerId,
    customerEmail,
    offerType = 'discount',
    discountPercent = '10',
  } = args;

  try {
    // Step 1: Create the marketing activity
    const MARKETING_ACTIVITY_MUTATION = await loadQuery('marketingActivityCreateExternal');
    
    const marketingActivityInput = {
      createInput: {
        title: `Abandoned Cart Recovery - ${offerType} offer`,
        remoteUrl: `https://example.com/recovery-${abandonmentId.split('/').pop()}`,
        utm: {
          source: 'mcp-admin-connector',
          medium: 'email',
          campaign: `abandoned-cart-recovery-${offerType}`
        },
        tactic: 'ABANDONED_CART',
        marketingChannelType: 'EMAIL',
        status: 'ACTIVE'
      }
    };

    const marketingData = await fetchFromShopify(MARKETING_ACTIVITY_MUTATION, marketingActivityInput);
    
    if (marketingData.marketingActivityCreateExternal.userErrors.length > 0) {
      throw new Error(`Failed to create marketing activity: ${JSON.stringify(marketingData.marketingActivityCreateExternal.userErrors)}`);
    }

    const marketingActivityId = marketingData.marketingActivityCreateExternal.marketingActivity.id;

    // Step 2: Update the delivery status to indicate the offer was sent
    const UPDATE_STATUS_MUTATION = await loadQuery('abandonmentUpdateActivitiesDeliveryStatuses');
    
    const deliveryVariables = {
      abandonmentId,
      marketingActivityId,
      deliveryStatus: 'SENT',
      deliveredAt: new Date().toISOString(),
      deliveryStatusChangeReason: `Recovery ${offerType} sent via MCP Admin Connector to ${customerEmail}`
    };

    const deliveryData = await fetchFromShopify(UPDATE_STATUS_MUTATION, deliveryVariables);

    if (deliveryData.abandonmentUpdateActivitiesDeliveryStatuses.userErrors.length > 0) {
      throw new Error(`Failed to update delivery status: ${JSON.stringify(deliveryData.abandonmentUpdateActivitiesDeliveryStatuses.userErrors)}`);
    }

    // Return comprehensive result
    return {
      success: true,
      marketingActivity: {
        id: marketingActivityId,
        title: marketingData.marketingActivityCreateExternal.marketingActivity.title
      },
      abandonment: deliveryData.abandonmentUpdateActivitiesDeliveryStatuses.abandonment,
      deliveryInfo: {
        status: 'SENT',
        deliveredAt: deliveryVariables.deliveredAt,
        recipient: customerEmail,
        offerType,
        discountPercent: discountPercent
      }
    };

  } catch (error) {
    console.error('Error in sendAbandonmentRecoveryOffer:', error);
    return {
      success: false,
      error: error.message,
      abandonmentId,
      customerId
    };
  }
}

/**
 * Automatically processes an abandoned checkout recovery by fetching customer data
 * and sending a recovery offer. This is the fully automated version.
 * @param {object} args The arguments for the automated recovery.
 * @param {string} args.abandonmentId The ID of the abandonment.
 * @param {string} [args.offerType] The type of offer (default: 'discount').
 * @param {string} [args.discountPercent] Discount percentage (default: '10').
 * @returns {Promise<object>} The result of the automated recovery process.
 */
export async function autoProcessAbandonmentRecovery(args) {
  const { abandonmentId, offerType = 'discount', discountPercent = '10' } = args;
  
  try {
    // First, get the abandoned checkouts to find this specific one
    const abandonedCheckouts = await getAbandonedCheckouts(50, 30); // Get more checkouts to find the right one
    
    const targetCheckout = abandonedCheckouts.find(checkout => 
      checkout.id === abandonmentId
    );

    if (!targetCheckout) {
      throw new Error(`Abandoned checkout ${abandonmentId} not found or not eligible for recovery`);
    }

    // Extract customer information
    const customerId = targetCheckout.customer?.id;
    const customerEmail = targetCheckout.customer?.email;

    if (!customerId || !customerEmail) {
      throw new Error(`Customer information incomplete for abandonment ${abandonmentId}`);
    }

    // Now use the complete recovery function
    const result = await sendAbandonmentRecoveryOffer({
      abandonmentId,
      customerId,
      customerEmail,
      offerType,
      discountPercent
    });

    // Add checkout details to the result
    return {
      ...result,
      checkoutDetails: {
        totalPrice: targetCheckout.totalPrice,
        lineItems: targetCheckout.lineItems,
        createdAt: targetCheckout.createdAt
      }
    };

  } catch (error) {
    console.error('Error in autoProcessAbandonmentRecovery:', error);
    return {
      success: false,
      error: error.message,
      abandonmentId
    };
  }
}
