---
title: Azure Claude 4.5 + OpenAI Agents SDK Compatibility Patch
category: GenAI & AI Agents
date: 2025-12-08
readTime: 10 min read
description: A monkey-patch solution to run the OpenAI Agents SDK with Azure AI Foundry's Claude Sonnet 4.5 endpoint.
---

# Azure Claude 4.5 + OpenAI Agents SDK Compatibility Patch

This blog post contains a monkey-patch solution to run the OpenAI Agents SDK with Azure AI Foundry's Claude Sonnet 4.5 endpoint.

## 🚨 The Problem

When using `LiteLLMModel` to connect the OpenAI Agents SDK to Azure's Claude 4.5 endpoint, you will encounter the following error:

```text
litellm.exceptions.BadRequestError: litellm.BadRequestError: Azure_aiException - 
{"type":"error","error":{"type":"invalid_request_error","message":"tools.0: Input tag 'function' found using 'type' does not match any of the expected tags: 'bash_20250124', 'custom', 'text_editor_20250124'..."}}
```

### Root Cause

1. **OpenAI Agents SDK** automatically generates tool definitions with `type: "function"`.
2. **Azure AI Foundry's Claude Endpoint** runs in a specific "Computer Use" beta mode. In this mode, it rejects `type: "function"` and strictly requires user-defined tools to be `type: "custom"`.
3. **LiteLLM** forwards the SDK's payload as-is, causing the rejection.

## 🛠️ The Solution

We cannot easily modify the OpenAI Agents SDK internals, and we cannot change Azure's validation logic. The solution is to monkey-patch `LiteLLM` to intercept the request immediately before transmission.

This patch:
1. Wraps `litellm.completion` and `litellm.acompletion`.
2. Inspects the `tools` list.
3. Converts any `type="function"` tool into the `type="custom"` format required by Azure.
4. Passes the modified payload to the original function.

## 📋 Prerequisites

Before running the code, ensure you have the following environment variables set. These are required for `LiteLLM` to authenticate with Azure AI Foundry.

```bash
# Azure AI Foundry Endpoint & Credentials
export AZURE_API_KEY="your-azure-api-key"
export AZURE_API_BASE="https://your-resource-name.openai.azure.com/"
export AZURE_API_VERSION="2024-10-01-preview" # or your specific version

# LiteLLM Model Identity
# Format: azure_ai/<deployment-name>
export LITELLM_MODEL="azure_ai/claude-sonnet-4-5"
```

## 📦 Usage

Add the following code to the very top of your application entry point (e.g., `main.py`).

> **Crucial:** This must run **before** you import `Agent` or `LitellmModel` to ensure the patch is registered correctly.

```python
import asyncio
import os
import litellm
from dotenv import load_dotenv

# ==========================================
# 🩹 START PATCH: Azure Claude 4.5 Compatibility
# ==========================================
_original_completion = litellm.completion
_original_acompletion = litellm.acompletion

def _fix_azure_tools(kwargs):
    """
    Transforms OpenAI 'function' tools into Anthropic 'custom' tools.
    Required for Azure AI Foundry Claude 4.5 endpoints.
    """
    if "tools" in kwargs and kwargs["tools"]:
        new_tools = []
        for tool in kwargs["tools"]:
            # Detect OpenAI format
            if tool.get("type") == "function" and "function" in tool:
                fn = tool["function"]
                # Convert to Anthropic Beta "custom" format
                new_tool = {
                    "type": "custom", 
                    "name": fn.get("name"),
                    "description": fn.get("description", ""),
                    "input_schema": fn.get("parameters", {})
                }
                new_tools.append(new_tool)
            else:
                # Preserve existing valid tools (e.g. bash_20250124)
                new_tools.append(tool)
        
        kwargs["tools"] = new_tools
    return kwargs

def _patched_completion(*args, **kwargs):
    kwargs = _fix_azure_tools(kwargs)
    return _original_completion(*args, **kwargs)

async def _patched_acompletion(*args, **kwargs):
    kwargs = _fix_azure_tools(kwargs)
    return await _original_acompletion(*args, **kwargs)

# Apply the patches
litellm.completion = _patched_completion
litellm.acompletion = _patched_acompletion
print("✅ LiteLLM patched for Azure Claude 4.5")
# ==========================================
# 🩹 END PATCH
# ==========================================

# NOW import your agents
from agents import Agent, Runner, function_tool
from agents.extensions.models.litellm_model import LitellmModel

load_dotenv()
os.environ["AZURE_API_BASE"] = "https://######.services.ai.azure.com/anthropic"

@function_tool
def get_weather(city: str):
    return f"The weather in {city} is awesome, obviously."
    
async def main():
    # 1. Initialize the Model
    # It reads LITELLM_MODEL from os.environ
    model = LitellmModel(
        model="azure_ai/claude-sonnet-4-5",
        api_key=os.environ["AZURE_API_KEY"],
        base_url=os.environ["AZURE_API_BASE"],
    )

    # 2. Define a simple agent
    agent = Agent(
        name="AzureClaudeAgent",
        model=model,
        instructions="You are a helpful assistant provided by Azure Claude 4.5.",
        tools=[get_weather]
    )

    # 3. Run the agent
    print("🤖 Agent starting...")
    result = await Runner.run(agent, "Use the weather tool for Bangalore, then explain in 2 sentences what you did.")
    print("\n--- FINAL OUTPUT ---")
    print(result.final_output)

if __name__ == "__main__":
    asyncio.run(main())
```