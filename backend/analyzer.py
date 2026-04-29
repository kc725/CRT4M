import json
import config

# ── Shared prompt templates ───────────────────────────────────────────────────
# Keeping prompts separate means switching providers never changes the output format

def _translate_prompt(text: str, target_language: str) -> str:
    return f"""Translate the following text into {target_language}.

Return a JSON object with exactly these fields:
- "literal": a word-for-word translation
- "idiomatic": a natural, fluent translation
- "notes": a list of strings, each explaining a grammar point or nuance (2-3 notes max)

Text: {text}"""


def _summarize_prompt(text: str) -> str:
    return f"""Summarize the following text.

Return a JSON object with exactly these fields:
- "summary": a concise 2-3 sentence summary
- "key_points": a list of the 3-5 most important points as strings
- "themes": a list of the main themes as single words or short phrases

Text: {text}"""


def _vocabulary_prompt(text: str) -> str:
    return f"""Identify notable vocabulary in the following text.

Return a JSON object with exactly this field:
- "words": a list of objects, each with:
    - "word": the word or phrase as it appears
    - "definition": a concise definition
    - "part_of_speech": e.g. noun, verb, adjective
    - "example": a short example sentence using the word

Focus on uncommon, technical, or interesting words. Limit to 8 words max.

Text: {text}"""


def _qa_prompt(question: str, context: str) -> str:
    return f"""Answer the following question using only the provided document context.

Return a JSON object with exactly these fields:
- "answer": a clear, direct answer to the question
- "confidence": one of "high", "medium", or "low"
- "relevant_quote": the most relevant short quote from the context, or null if none

Question: {question}
Context: {context}"""


# ── Provider clients ──────────────────────────────────────────────────────────

def _call_gemini(prompt: str) -> str:
    import google.generativeai as genai
    genai.configure(api_key=config.get_api_key())
    model = genai.GenerativeModel(config.get_model())
    response = model.generate_content(
        prompt,
        generation_config={"response_mime_type": "application/json"},
    )
    return response.text


def _call_openai(prompt: str) -> str:
    from openai import OpenAI
    client = OpenAI(api_key=config.get_api_key())
    response = client.chat.completions.create(
        model=config.get_model(),
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )
    return response.choices[0].message.content


def _call_anthropic(prompt: str) -> str:
    import anthropic
    client = anthropic.Anthropic(api_key=config.get_api_key())
    response = client.messages.create(
        model=config.get_model(),
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    text = response.content[0].text
    start = text.find("{")
    end = text.rfind("}") + 1
    if start == -1 or end == 0:
        raise ValueError(f"Anthropic response did not contain valid JSON:\n{text}")
    return text[start:end]


def _call_openrouter(prompt: str) -> str:
    from openai import OpenAI
    client = OpenAI(
        api_key=config.get_api_key(),
        base_url="https://openrouter.ai/api/v1",
        default_headers={
            # OpenRouter uses these for your dashboard analytics
            "HTTP-Referer": config.OPENROUTER_APP_URL,
            "X-Title": config.OPENROUTER_APP_NAME,
        },
    )
    response = client.chat.completions.create(
        model=config.get_model(),
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )
    return response.choices[0].message.content


def _call_ollama(prompt: str) -> str:
    """
    Calls a locally running Ollama server via its OpenAI-compatible /v1 endpoint.
    Requires Ollama >= 0.1.24 (ships with the /v1 compatibility layer).

    Alternative: use the `ollama` Python package directly:
        import ollama
        response = ollama.chat(
            model=config.get_model(),
            messages=[{"role": "user", "content": prompt}],
            format="json",
        )
        return response["message"]["content"]
    The openai-compatible approach below avoids an extra dependency.
    """
    from openai import OpenAI
    client = OpenAI(
        api_key="ollama",  # Ollama ignores this but the openai client requires a non-empty value
        base_url=f"{config.OLLAMA_BASE_URL}/v1",
    )
    response = client.chat.completions.create(
        model=config.get_model(),
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant. Always respond with valid JSON only, no markdown, no explanation.",
            },
            {"role": "user", "content": prompt},
        ],
        # format="json" is not part of the OpenAI spec, so we rely on the
        # system prompt above. For stricter enforcement, use the ollama package
        # with format="json" as shown in the docstring above.
    )
    text = response.choices[0].message.content
    # Extract JSON robustly in case the model adds surrounding text anyway
    start = text.find("{")
    end = text.rfind("}") + 1
    if start == -1 or end == 0:
        raise ValueError(f"Ollama response did not contain valid JSON:\n{text}")
    return text[start:end]


# ── Dispatcher ────────────────────────────────────────────────────────────────

def _call(prompt: str) -> str:
    providers = {
        "gemini": _call_gemini,
        "openai": _call_openai,
        "anthropic": _call_anthropic,
        "openrouter": _call_openrouter,
        "ollama": _call_ollama,
    }
    if config.PROVIDER not in providers:
        raise ValueError(
            f"Unknown provider '{config.PROVIDER}'. "
            f"Choose from: {list(providers.keys())}"
        )
    return providers[config.PROVIDER](prompt)


# ── Public API ────────────────────────────────────────────────────────────────

def _parse_response(raw: str) -> dict:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"error": f"AI returned invalid JSON: {raw[:200]}"}

def translate(text: str, target_language: str) -> dict:
    return _parse_response(_call(_translate_prompt(text, target_language)))

def summarize(text: str) -> dict:
    return _parse_response(_call(_summarize_prompt(text)))

def extract_vocabulary(text: str) -> dict:
    return _parse_response(_call(_vocabulary_prompt(text)))

def answer_question(question: str, context: str) -> dict:
    return _parse_response(_call(_qa_prompt(question, context)))