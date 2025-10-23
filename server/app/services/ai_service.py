import os
from flask import current_app
from typing import List, Dict
import json 


def _import_openai_client():
    try:
        from openai import OpenAI as OpenAIClient
        return OpenAIClient
    except Exception:
        return None


def _get_openai_client():
    api_key = current_app.config.get('OPENAI_API_KEY')
    if not api_key:
        raise ValueError('OPENAI_API_KEY not configured in the environment')
    OpenAIClient = _import_openai_client()
    if OpenAIClient is None:
        raise ImportError('openai package is not installed. Install it or set up a stub for migrations.')
    return OpenAIClient(api_key=api_key)


def estimate_item_weight(title: str, description: str, category: str) -> float:
    """
    Uses OpenAI to estimate the weight of an item based on its details.
    Returns a float (weight in kg).
    """
    try:
        client = _get_openai_client()
        model = current_app.config.get('OPENAI_CHAT_MODEL', 'gpt-4o-mini')

        system_prompt = """
        You are an expert logistics and recycling estimator. Your task is to
        estimate the weight (in kilograms) of a household item based on its
        title, description, and category.
        
        You must respond in ONLY a valid JSON format.
        The JSON object must have one key: "weight_kg".
        
        Example:
        {"weight_kg": 2.5}
        """

        user_prompt = f"""
        Estimate the weight for the following item:
        Title: {title}
        Description: {description}
        Category: {category}
        """

        resp = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"} 
        )

        response_content = resp.choices[0].message.content
        data = json.loads(response_content)
        
        weight = data.get('weight_kg')
        
        if isinstance(weight, (int, float)):
            return float(weight)
        
        current_app.logger.warning(f"AI weight estimation returned unexpected data: {response_content}")
        return 1.0 
        
    except Exception as e:
        current_app.logger.error(f"AI weight estimation failed: {e}")
        return 1.0 


def generate_chat_response(messages: List[Dict[str, str]]) -> str:
    """
    Generate a chat-style response using OpenAI's ChatCompletion API.
    `messages` should be a list of dicts with keys 'role' and 'content'.
    Roles expected: 'user' and 'model' (we map 'model' -> 'assistant').
    """
    try:
        client = _get_openai_client()
        model = current_app.config.get('OPENAI_CHAT_MODEL', 'gpt-4o-mini')

        system_prompt = """
        You are 'Fixell-Bot', an expert, patient, and safety-conscious repair assistant. Follow the 'Step, Confirm, Continue' interactive approach and always include clear safety guidance.
        """

        openai_messages = [{"role": "system", "content": system_prompt}]
        for m in messages:
            role = 'user' if m.get('role') == 'user' else 'assistant'
            openai_messages.append({"role": role, "content": m.get('content', '')})

        resp = client.chat.completions.create(model=model, messages=openai_messages)
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
            raise RuntimeError('OpenAI returned an empty chat completion')
        return text.strip()

    except Exception as e:
        current_app.logger.exception('An unexpected error occurred in the AI service: %s', e)
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