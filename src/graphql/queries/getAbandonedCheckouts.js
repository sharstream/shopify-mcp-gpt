export const GET_ABANDONED_CHECKOUTS_QUERY = `
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
