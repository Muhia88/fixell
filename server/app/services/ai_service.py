import os
from flask import current_app

# Try to import the optional Google Generative AI SDK. If it's not available
# (for local/dev testing), fall back to a lightweight placeholder generator.
try:
    import google.generativeai as genai  # type: ignore
    _HAS_GENAI = True
except Exception:
    genai = None
    _HAS_GENAI = False


def generate_repair_guide_content(item_description: str) -> str:
    """
    Generates a step-by-step repair guide using the Gemini API.

    Args:
        item_description: A string describing the broken item.

    Returns:
        A formatted string containing the repair guide, or an error message.
    """
    try:
        # If the SDK is available and configured, attempt to generate text via SDK
        if _HAS_GENAI:
            api_key = current_app.config.get('GEMINI_API_KEY')
            if api_key:
                genai.configure(api_key=api_key)
                model_name = current_app.config.get('GEMINI_MODEL') or 'models/text-bison-001'

                prompt = (
                    "As an expert DIY repair assistant, create a clear, beginner-friendly, "
                    "step-by-step repair guide. The guide must be formatted in Markdown and "
                    "include: an Introduction, Tools & Materials, Numbered Steps, and Safety Tips.\n\n"
                    f"Item: {item_description}"
                )

                # Try generate_text (available in current SDK)
                if hasattr(genai, 'generate_text'):
                    try:
                        response = genai.generate_text(model=model_name, prompt=prompt, max_output_tokens=512)
                        # Try multiple possible response shapes
                        if hasattr(response, 'text') and response.text:
                            return response.text.strip()
                        if hasattr(response, 'candidates') and response.candidates:
                            first = response.candidates[0]
                            for attr in ('content', 'output', 'text'):
                                if hasattr(first, attr) and getattr(first, attr):
                                    return getattr(first, attr).strip()
                            return str(first)
                    except Exception:
                        # Fall through to other attempts or fallback
                        pass

                # Try chat.create if available
                if hasattr(genai, 'chat'):
                    try:
                        resp = genai.chat.create(model=model_name, messages=[{"role": "user", "content": prompt}])
                        # Extract candidate/message content
                        if hasattr(resp, 'candidates') and resp.candidates:
                            c = resp.candidates[0]
                            for attr in ('content', 'output', 'text'):
                                if hasattr(c, attr) and getattr(c, attr):
                                    return getattr(c, attr).strip()
                        if hasattr(resp, 'message') and resp.message:
                            m = resp.message
                            for attr in ('content', 'text'):
                                if hasattr(m, attr) and getattr(m, attr):
                                    return getattr(m, attr).strip()
                    except Exception:
                        pass

        # Fallback placeholder guide
        guide_lines = [
            '## Introduction',
            f"Here's a simple repair guide for: {item_description}",
            '',
            '## Tools & Materials',
            '- Screwdriver set',
            '- Replacement parts (as needed)',
            '- Clean cloth',
            '',
            '## Steps',
            '1. Diagnose the problem by inspecting the item.',
            '2. Power off and unplug the device.',
            '3. Open the enclosure using the appropriate screwdriver.',
            '4. Locate the damaged component and remove it carefully.',
            '5. Replace the damaged component with the new part.',
            '6. Reassemble the device and test functionality.',
            '',
            '## Safety Tips',
            '- Wear eye protection when working with small parts.',
            '- Work on a grounded surface to avoid static damage.',
        ]
        return "\n".join(guide_lines)

    except ValueError as ve:
        print(f"Configuration Error: {ve}")
        return "Error: The AI service is not configured correctly. Please contact support."
    except Exception as e:
        print(f"An unexpected error occurred in the AI service: {e}")
        return "Error: Could not generate the repair guide at this time. Please try again later."
