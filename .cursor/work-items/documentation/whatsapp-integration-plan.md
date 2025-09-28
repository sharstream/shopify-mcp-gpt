# Phase 3: WhatsApp Marketing Integration Requirements

This document outlines the requirements and acceptance criteria for integrating the `Ctx: WhatsApp Chat + Marketing` app functionality into the `MCP Admin Connector` project. The primary goal is to enable the MCP system to programmatically trigger WhatsApp marketing campaigns, such as abandoned checkout recovery.

## 3.1 Prerequisite: External App Configuration

Before integration can begin, the external `Ctx: WhatsApp Chat + Marketing` application must be fully configured and operational.

*   **Requirement 3.1.1: Active Premium Subscription**
    *   **Description:** Automated WhatsApp messaging is a premium feature. A paid subscription must be active for the `Ctx` application.
    *   **Acceptance Criteria:** The "Premium plan is required..." warning is no longer visible in the `Ctx` app's admin panel.

*   **Requirement 3.1.2: Store Theme Integration**
    *   **Description:** The app's storefront features, specifically for cart recovery, must be enabled within the Shopify theme settings.
    *   **Acceptance Criteria:** The "WhatsApp Cart Recovery is still disabled..." error is resolved by enabling the app embed in `Online Store > Themes > Customize > App embeds`.

*   **Requirement 3.1.3: API Availability**
    *   **Description:** The integration is dependent on the `Ctx` app providing an external API or webhook system for sending messages programmatically.
    *   **Acceptance Criteria:** The API documentation for the `Ctx` app has been located and confirms the existence of an endpoint to send templated WhatsApp messages to a specific phone number.

## 3.2 MCP Integration Strategy

This section defines how the external WhatsApp functionality will be connected to the MCP project.

*   **Requirement 3.2.1: New MCP Tool Definition**
    *   **Description:** A new tool must be designed within the MCP framework to handle the action of sending a WhatsApp recovery message.
    *   **Acceptance Criteria:** A new tool, `send_whatsapp_recovery_message`, is formally defined with the following input arguments:
        *   `abandonmentId` (string, required)
        *   `customerPhoneNumber` (string, required)
        *   `templateName` (string, required)
        *   `templateVariables` (object, optional)

## 3.3 Implementation and Validation

This phase covers the development of the integration and the final validation.

*   **Requirement 3.3.1: Client Logic Implementation**
    *   **Description:** A client function must be developed to handle the HTTP request to the `Ctx` app's API. This includes handling authentication (e.g., API keys) and request body formatting.
    *   **Acceptance Criteria:** A new function is implemented, likely within `src/shopify_client.js` or a new dedicated client file, that can successfully authenticate and trigger a message via the `Ctx` API.

*   **Requirement 3.3.2: Tool Registration**
    *   **Description:** The newly created client function must be registered within the MCP tool handler to make it accessible to the AI.
    *   **Acceptance Criteria:** The `send_whatsapp_recovery_message` tool is added to the `TOOLS` map in `tools/mcp_handler.js` and is callable via the `/api/mcp` endpoint.

*   **Requirement 3.3.3: End-to-End Test and Validation**
    *   **Description:** The entire workflow must be tested to confirm that the integration works as expected.
    *   **Acceptance Criteria:** The following sequence is executed successfully:
        1. A new abandoned checkout is created in the development store.
        2. The `get_abandoned_checkouts` tool is used to retrieve the `abandonmentId` and customer phone number.
        3. The `send_whatsapp_recovery_message` tool is called with the retrieved data.
        4. A correctly formatted WhatsApp message is successfully received on a test phone number.
