# API Specification for Shopify MCP Connector

This document defines the tools that our custom MCP server will expose to the AI assistant (Claude). The communication will follow the JSON-RPC 2.0 protocol.

## Tool: `get_abandoned_checkouts`

Retrieves a list of abandoned checkouts based on the defined business logic.

### Parameters

| Name      | Type    | Description                                                                 | Required |
| :-------- | :------ | :-------------------------------------------------------------------------- | :------- |
| `limit`   | Integer | The maximum number of checkouts to return. Defaults to `10`.                | No       |
| `days_ago`| Integer | The maximum number of days in the past to search. Defaults to `7`.          | No       |
| `status`  | String  | The status of the checkout to filter by. Defaults to `open`.                | No       |

### Example Request (from Claude)

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 1,
  "params": {
    "name": "get_abandoned_checkouts",
    "arguments": {
      "limit": 5
    }
  }
}
```

### Example Response (from our MCP Server)

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "status": "success",
    "data": [
      {
        "id": "gid://shopify/Checkout/12345",
        "abandonedCheckoutUrl": "https://store.myshopify.com/...",
        "createdAt": "2023-10-27T10:00:00Z",
        "totalPrice": {
          "amount": "125.50",
          "currencyCode": "USD"
        },
        "customer": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com"
        },
        "lineItems": [
          { "title": "Awesome T-Shirt", "quantity": 2 },
          { "title": "Cool Hat", "quantity": 1 }
        ]
      }
    ]
  }
}
```

---

## Future Tools (Out of Scope for MVP)

-   `create_discount_coupon(checkoutId, percentage)`
-   `send_recovery_email(checkoutId, couponCode)`
