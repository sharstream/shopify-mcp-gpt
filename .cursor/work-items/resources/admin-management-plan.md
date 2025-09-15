# Phase 3 Plan: Admin Management Features

This document outlines potential features for a future phase of the project, focusing on providing administrative and management capabilities through the AI assistant.

## Overview

Once the MVP (Phase 2) is stable and proves the core concept of fetching data via the MCP connector, Phase 3 will focus on adding "write" capabilities and management tools. This will transform the assistant from a read-only tool into a proactive administrative partner.

## 1. Coupon Management Tools

-   **Tool:** `create_discount_coupon`
    -   **Description:** Allows the AI assistant to create new discount codes directly in Shopify.
    -   **Parameters:**
        -   `checkout_id` (String, Required): The target checkout to associate the offer with.
        -   `value` (Number, Required): The value of the discount.
        -   `type` (String, Required): The type of discount ('PERCENTAGE' or 'FIXED_AMOUNT').
        -   `usage_limit` (Integer, Optional): How many times the coupon can be used. Defaults to `1`.
    -   **Workflow:** The assistant would first fetch abandoned checkouts, and then the user could instruct it to create a specific offer for one of them.

-   **Tool:** `invalidate_coupon`
    -   **Description:** Deactivates a previously generated coupon code.
    -   **Parameters:**
        -   `coupon_code` (String, Required): The code to invalidate.
    -   **Workflow:** Useful if a coupon is being abused or was created in error.

## 2. Campaign Management

-   **Functionality:** This would be a higher-level concept built on top of the basic tools. The assistant could manage a "recovery campaign".
-   **Example Prompts:**
    -   *"Inicia una campaña de recuperación para los carritos de las últimas 48 horas con un 15% de descuento."*
    -   *"Pausa la campaña de recuperación."*
    -   *"Resume el estado de la campaña actual."*
-   **Technical Requirement:** This would require more complex logic in the MCP server to manage state (e.g., is a campaign "running" or "paused"?).

## 3. Reporting and Analytics

-   **Tool:** `get_recovery_report`
    -   **Description:** Provides a summary of the abandoned cart recovery efforts.
    -   **Parameters:**
        -   `start_date` (String, Required): The start date for the report (e.g., 'YYYY-MM-DD').
        -   `end_date` (String, Required): The end date for the report.
    -   **Workflow:** The user could ask, *"Muéstrame el reporte de recuperación de carritos de esta semana."*
    -   **Response Data:** The tool would return structured data that the AI would synthesize into a summary, including:
        -   Number of emails sent.
        -   Number of coupons used.
        -   Total value of sales recovered.
        -   Conversion rate ( (sales recovered / emails sent) * 100 ).

## 4. Configuration Management

-   **Tool:** `update_tool_settings`
    -   **Description:** Allows the user to change the default behavior of the tools.
    -   **Parameters:**
        -   `tool_name` (String, Required): The name of the tool to configure (e.g., `get_abandoned_checkouts`).
        -   `settings` (Object, Required): An object with the new default values (e.g., `{ "limit": 15, "days_ago": 3 }`).
    -   **Workflow:** The user could say, *"A partir de ahora, cuando busque carritos abandonados, muéstrame los últimos 15 de los últimos 3 días por defecto."*

---

## 5. Authentication and API Access

For any of these administrative tools to work, the MCP server must authenticate with the Shopify Admin API. For a custom app like this, the process involves creating a private app and using a generated Admin API access token.

### How to Obtain the Admin API Access Token

1.  **Navigate to Apps in Shopify Admin:**
    -   Log in to your Shopify admin panel.
    -   Go to **Apps and sales channels** > **Develop apps for your store**.
    -   You may need to click "Allow custom app development" if it's your first time.

2.  **Create a Custom App:**
    -   Click **Create an app**.
    -   Provide a name (e.g., "MCP Admin Connector") and select an app developer.
    -   Click **Create app**.

3.  **Configure Admin API Scopes (Permissions):**
    -   Go to the **Configuration** tab of your new app.
    -   In the "Admin API integration" section, click **Configure**.
    -   Grant the necessary permissions. For the features in this plan, you will eventually need:
        -   `read_orders` (to get abandoned checkouts)
        -   `write_discounts` (to create/manage coupons)
    -   Click **Save**.

4.  **Install the App and Reveal the Token:**
    -   Switch to the **API credentials** tab.
    -   Click the **Install app** button and confirm the installation.
    -   After installation, the page will display your **Admin API access token**. It will start with `shpat_`.

5.  **Securely Store the Token:**
    -   **This token is a secret!** Treat it like a password.
    -   Copy the token and place it in the `.env` file of the MCP server project under the key `SHOPIFY_ADMIN_ACCESS_TOKEN`. Do not commit this file to version control.
