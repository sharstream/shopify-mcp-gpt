export const MARKETING_ACTIVITY_CREATE_EXTERNAL_MUTATION = `
mutation CreateMarketingActivity {
  marketingActivityCreateExternal(
    input: {
      title: "Test Recovery Email Campaign"
      status: ACTIVE
      budgetType: LIFETIME
      budgetAmount: {
        amount: "100.00"
        currencyCode: USD
      }
      marketingChannelType: EMAIL
      targetStatus: STATUS_ACTIVE
    }
  ) {
    marketingActivity {
      id
      title
      status
      createdAt
    }
    userErrors {
      field
      message
    }
  }
}
`;
