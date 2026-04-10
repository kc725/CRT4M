import os

# Options: "gemini", "openai", "anthropic", "openrouter", "ollama"
PROVIDER = os.environ.get("AI_PROVIDER", "gemini")

MODELS = {
    "gemini": "gemini-1.5-flash",
    "openai": "gpt-4o",
    "anthropic": "claude-opus-4-6",
    # Any model slug from openrouter.ai/models works here
    "openrouter": "anthropic/claude-opus-4",
    # Any model you have pulled locally via `ollama pull <model>`
    "ollama": "gemma4:e4b",
}
# Runtime-only model overrides set via the API.
# These should not mutate MODELS, which represent provider defaults.
RUNTIME_MODEL_OVERRIDES: dict[str, str] = {}

API_KEYS = {
    "gemini": os.environ.get("GEMINI_API_KEY"),
    "openai": os.environ.get("OPENAI_API_KEY"),
    "anthropic": os.environ.get("ANTHROPIC_API_KEY"),
    "openrouter": os.environ.get("OPENROUTER_API_KEY"),
    "ollama": None,  # Ollama runs locally — no API key required
}

# Your app name and URL — OpenRouter asks for these in headers for analytics
# on their dashboard. Can be anything, not validated.
OPENROUTER_APP_NAME = os.environ.get("OPENROUTER_APP_NAME", "CRT4M")
OPENROUTER_APP_URL = os.environ.get("OPENROUTER_APP_URL", "http://localhost:3000")

# Ollama server address — override if running on a different host/port
OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")

def get_model() -> str:
    return RUNTIME_MODEL_OVERRIDES.get(PROVIDER, MODELS[PROVIDER])

def get_api_key() -> str:
    key = API_KEYS[PROVIDER]
    if key is None and PROVIDER != "ollama":
        raise ValueError(
            f"No API key found for provider '{PROVIDER}'. "
            f"Set the {PROVIDER.upper()}_API_KEY environment variable."
        )
    return key or ""