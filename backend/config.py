import os

# Options: "gemini", "openai", "anthropic", "openrouter"
PROVIDER = os.environ.get("AI_PROVIDER", "gemini")

MODELS = {
    "gemini": "gemini-1.5-flash",
    "openai": "gpt-4o",
    "anthropic": "claude-opus-4-6",
    # Any model slug from openrouter.ai/models works here
    "openrouter": "anthropic/claude-opus-4",
}

API_KEYS = {
    "gemini": os.environ.get("GEMINI_API_KEY"),
    "openai": os.environ.get("OPENAI_API_KEY"),
    "anthropic": os.environ.get("ANTHROPIC_API_KEY"),
    "openrouter": os.environ.get("OPENROUTER_API_KEY"),
}

# Your app name and URL — OpenRouter asks for these in headers for analytics
# on their dashboard. Can be anything, not validated.
OPENROUTER_APP_NAME = os.environ.get("OPENROUTER_APP_NAME", "CRT4M")
OPENROUTER_APP_URL = os.environ.get("OPENROUTER_APP_URL", "http://localhost:3000")

def get_model() -> str:
    return MODELS[PROVIDER]

def get_api_key() -> str:
    key = API_KEYS[PROVIDER]
    if not key:
        raise ValueError(
            f"No API key found for provider '{PROVIDER}'. "
            f"Set the {PROVIDER.upper()}_API_KEY environment variable."
        )
    return key