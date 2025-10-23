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

        In addition to repair instructions, proactively suggest ways to renew or repurpose the item when appropriate. "Renewing" means altering, upcycling, or adapting the item so it gains new value or a new use (for example: turning a worn jacket into a tote bag, turning a broken lamp into a planter, or replacing a single broken component to extend life).

        When providing renewal/repurpose suggestions:
        - Offer 1-3 concrete, low-risk ideas that match the user's stated constraints (tools, materials, skill level, and desired outcome).
        - Explain tradeoffs (time, cost, durability) and environmental benefits (e.g., waste avoided, materials reused).
        - When a suggestion involves sewing, woodworking, or electrical work, include safety cautions and recommend professional help if risks are non-trivial.

        Keep responses conversational, stepwise when showing repair steps, and clearly separate 'Repair' vs 'Renew / Repurpose' recommendations in the reply.
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
            "Please produce a full repair and renewal guide in Markdown for the following problem. "
            "Include these sections: ## Introduction, ## Tools & Materials, ## Step-by-Step Repair Guide, ## Renewal / Repurpose Options, and ## Safety Tips."
            "Within 'Renewal / Repurpose Options' give 2 practical ideas (one low-effort, one that requires more craft) and note environmental tradeoffs."
            f"\n\nProblem: {item_description}"
        )

        messages = [
            {"role": "system", "content": "You are an expert repair and renewal guide generator. Produce clear Markdown output with distinct sections for Repair and Renewal/Repurpose options."},
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