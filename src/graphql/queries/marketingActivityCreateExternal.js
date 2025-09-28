export const MARKETING_ACTIVITY_CREATE_EXTERNAL_MUTATION = `
mutation marketingActivityCreateExternal($createInput: MarketingActivityCreateExternalInput!) {
    marketingActivityCreateExternal(input: $createInput) {
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
