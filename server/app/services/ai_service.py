import os
from flask import current_app
from typing import List, Dict

from openai import OpenAI


def _get_openai_client():
    api_key = current_app.config.get('OPENAI_API_KEY')
    if not api_key:
        raise ValueError('OPENAI_API_KEY not configured in the environment')
    # Create a fresh OpenAI client instance using the configured key
    return OpenAI(api_key=api_key)


def generate_chat_response(messages: List[Dict[str, str]]) -> str:
    """
    Generate a chat-style response using OpenAI's ChatCompletion API.
    `messages` should be a list of dicts with keys 'role' and 'content'.
    Roles expected: 'user' and 'model' (we map 'model' -> 'assistant').
    """
    try:
        client = _get_openai_client()
        model = current_app.config.get('OPENAI_CHAT_MODEL', 'gpt-4o-mini')

        # System prompt: the assistant persona and rules
        system_prompt = """
You are 'Fixell-Bot', an expert, patient, and safety-conscious repair assistant. Follow the 'Step, Confirm, Continue' interactive approach and always include clear safety guidance.
"""

        openai_messages = [{"role": "system", "content": system_prompt}]
        for m in messages:
            role = 'user' if m.get('role') == 'user' else 'assistant'
            openai_messages.append({"role": role, "content": m.get('content', '')})

        # Use the new OpenAI client interface
        resp = client.chat.completions.create(model=model, messages=openai_messages)
        # New client returns choices with message objects. Extract content safely.
        text = None
        if getattr(resp, 'choices', None):
            choice = resp.choices[0]
            msg = getattr(choice, 'message', None)
            if msg is not None:
                # msg may be a pydantic object with attribute 'content'
                text = getattr(msg, 'content', None)
                if text is None:
                    # try dict-like access
                    try:
                        text = msg['content']
                    except Exception:
                        text = None
        if not text:
            raise RuntimeError('OpenAI returned an empty chat completion')
        return text.strip()

    except Exception as e:
        current_app.logger.exception('An unexpected error occurred in the AI service: %s', e)
        # Return an explicit model-related error message rather than a handwritten fallback
        return f"Error: model {current_app.config.get('OPENAI_CHAT_MODEL')} error: {str(e)}"


def generate_repair_guide_content(item_description: str) -> str:
    """
    Generate a full repair guide via OpenAI chat completion. Returns an error string mentioning the model on failure.
    """
    try:
        client = _get_openai_client()
        model = current_app.config.get('OPENAI_MODEL', 'gpt-4o-mini')
        prompt = (
            "Please produce a full repair guide in Markdown for the following problem. "
            "Include these sections: ## Introduction, ## Tools & Materials, ## Step-by-Step Guide, and ## Safety Tips."
            f"\n\nProblem: {item_description}"
        )

        messages = [
            {"role": "system", "content": "You are an expert repair guide generator. Produce clear Markdown output."},
            {"role": "user", "content": prompt}
        ]

        resp = client.chat.completions.create(model=model, messages=messages)
        text = None
        if getattr(resp, 'choices', None):
            choice = resp.choices[0]
            msg = getattr(choice, 'message', None)
            if msg is not None:
                text = getattr(msg, 'content', None)
                if text is None:
                    try:
                        text = msg['content']
                    except Exception:
                        text = None

        if not text:
            return f"Error: model {model} returned no content"
        return text.strip()

    except Exception as e:
        current_app.logger.exception('Repair guide generation failed: %s', e)
        return f"Error: model {current_app.config.get('OPENAI_MODEL')} error: {str(e)}"
