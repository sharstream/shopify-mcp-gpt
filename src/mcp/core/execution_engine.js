/**
 * Unified Execution Engine
 * Centralizes all tool execution logic in one place
 */

import { getToolConfig, hasToolConfig, getToolNames } from '../config/tools_config.js';

/**
 * Unified tool execution engine
 * Handles parameter mapping and execution for all tools
 */
export class ExecutionEngine {
    /**
     * Execute a tool with the given arguments
     * @param {string} toolName - Name of the tool to execute
     * @param {object} args - Arguments for the tool
     * @returns {Promise<any>} Tool execution result
     * @throws {Error} If tool not found or execution fails
     */
    async executeTool(toolName, args = {}) {
        if (!hasToolConfig(toolName)) {
            throw new Error(`Tool "${toolName}" not found`);
        }

        const toolConfig = getToolConfig(toolName);
        const { function: toolFunction, parameterMapping } = toolConfig;

        try {
            let result;

            // Execute based on parameter mapping strategy
            switch (parameterMapping) {
                case 'none':
                    // Tools that take no parameters
                    result = await toolFunction();
                    break;

                case 'positional':
                    // Tools that take positional parameters
                    result = await this.executePositionalTool(toolName, toolFunction, args);
                    break;

                case 'object':
                    // Tools that take a single object parameter
                    result = await toolFunction(args);
                    break;

                default:
                    throw new Error(`Unknown parameter mapping: ${parameterMapping}`);
            }

            return result;
        } catch (error) {
            throw new Error(`Error executing tool "${toolName}": ${error.message}`);
        }
    }

    /**
     * Execute tools with positional parameter mapping
     * @param {string} toolName - Name of the tool
     * @param {Function} toolFunction - Function to execute
     * @param {object} args - Named arguments to convert to positional
     * @returns {Promise<any>} Execution result
     */
    async executePositionalTool(toolName, toolFunction, args) {
        switch (toolName) {
            case 'get_abandoned_checkouts':
                return toolFunction(args?.limit, args?.days_ago);

            default:
                throw new Error(`Positional mapping not defined for tool: ${toolName}`);
        }
    }

    /**
     * Validate tool arguments against schema
     * @param {string} toolName - Name of the tool
     * @param {object} args - Arguments to validate
     * @throws {Error} If validation fails
     */
    validateToolArgs(toolName, args = {}) {
        const toolConfig = getToolConfig(toolName);
        if (!toolConfig) {
            return; // Skip validation if tool not found (will be caught later)
        }

        const { schema } = toolConfig;
        const requiredFields = schema.required || [];

        // Check required parameters
        for (const field of requiredFields) {
            if (args[field] === undefined || args[field] === null || args[field] === '') {
                throw new Error(`Missing required parameter: ${field}`);
            }
        }
    }

    /**
     * Execute tool with validation
     * @param {string} toolName - Name of the tool to execute
     * @param {object} args - Arguments for the tool
     * @returns {Promise<any>} Tool execution result
     * @throws {Error} If validation or execution fails
     */
    async executeWithValidation(toolName, args = {}) {
        // Validate arguments first
        this.validateToolArgs(toolName, args);

        // Execute the tool
        return this.executeTool(toolName, args);
    }

    /**
     * Get list of available tools
     * @returns {string[]} Array of available tool names
     */
    getAvailableTools() {
        return getToolNames();
    }
}

/**
 * Singleton instance of the execution engine
 */
export const executionEngine = new ExecutionEngine();
