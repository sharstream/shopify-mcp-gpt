# Database Design for Shopify MCP Connector

For the MVP, we need a simple local database to track which abandoned checkouts have already been contacted. This prevents sending multiple offers to the same user in a short period.

## Technology

-   **Database System:** SQLite
-   **Reasoning:** It's serverless, file-based, and requires no complex setup, making it perfect for a local-first MVP. The Node.js `sqlite3` package will be used for access.

## Schema

We will have one primary table: `sent_offers`.

### Table: `sent_offers`

This table logs every recovery email that has been sent.

| Column Name      | Data Type | Description                                                     | Constraints      |
| :--------------- | :-------- | :-------------------------------------------------------------- | :--------------- |
| `id`             | INTEGER   | A unique auto-incrementing identifier for the log entry.        | PRIMARY KEY      |
| `checkout_id`    | TEXT      | The Shopify GID of the abandoned checkout (e.g., `gid://...`).  | NOT NULL, UNIQUE |
| `customer_email` | TEXT      | The email of the customer who was contacted.                    | NOT NULL         |
| `sent_at`        | TIMESTAMP | The date and time when the offer was sent.                      | NOT NULL         |
| `coupon_code`    | TEXT      | The specific coupon code that was sent in the email.            | NOT NULL         |
| `status`         | TEXT      | The status of the attempt (e.g., `SUCCESS`, `FAILED`).          | NOT NULL         |

### Usage Flow

1.  Before sending an email, the `get_abandoned_checkouts` tool will query this table.
2.  It will check if a `checkout_id` has a `sent_at` timestamp within the last 24 hours.
3.  If a recent entry exists, that checkout will be filtered out from the list returned to the AI assistant.
4.  If an email is successfully sent (in a future phase), a new record will be inserted into this table.
