from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models.saved_guide import SavedGuide
from app.services.ai_service import generate_chat_response
from app.services.ai_service import generate_repair_guide_content
from app.utils.auth import login_required
from openai import OpenAI
from app.models.conversation import Conversation
from app.models.conversation_message import ConversationMessage
from flask import g

guide_bp = Blueprint('guide_bp', __name__)


@guide_bp.route('/chat', methods=['POST'])
@login_required
def handle_chat():
    """
    Handles conversational guide generation.
    Expects a JSON body with a 'messages' array, where each object has 'role' and 'content'.
    """
    data = request.get_json() or {}
    messages = data.get('messages')

    if not messages or not isinstance(messages, list):
        return jsonify({"msg": "A valid 'messages' array is required"}), 400

    try:
        # Save incoming user messages to the conversation if conversation_id provided
        conv_id = data.get('conversation_id')
        user_id = getattr(g, 'current_user_id', None)
        if conv_id:
            # Persist only user messages from the incoming batch
            for m in messages:
                if m.get('role') == 'user':
                    cm = ConversationMessage(conversation_id=conv_id, role='user', content=m.get('content'))
                    db.session.add(cm)
            db.session.commit()

        # Pass the entire message history to the AI service
        ai_response_content = generate_chat_response(messages)

        # Persist the AI response if a conversation is active
        if conv_id:
            cm = ConversationMessage(conversation_id=conv_id, role='model', content=ai_response_content)
            db.session.add(cm)
            db.session.commit()

        # The AI service returns the content string. We wrap it in the standard message object format.
        ai_message = {"role": "model", "content": ai_response_content}

        return jsonify({"message": ai_message}), 200

    except Exception as e:
        current_app.logger.error(f"Chat generation failed: {e}")
        # Return a generic server error message
        return jsonify({'msg': 'An error occurred while generating the chat response.'}), 500




@guide_bp.route('/save', methods=['POST'])
def save_guide():
    data = request.get_json() or {}
    title = data.get('title') or data.get('description', 'Saved Guide')[:100]
    description = data.get('description')
    guide_content = data.get('guide_content')

    if not guide_content:
        return jsonify({'msg': 'guide_content is required'}), 400

    saved = SavedGuide(title=title, description=description, guide_content=guide_content)
    db.session.add(saved)
    db.session.commit()

    return jsonify(saved.to_dict()), 201


@guide_bp.route('/', methods=['GET'])
def list_saved_guides():
    guides = SavedGuide.query.order_by(SavedGuide.created_at.desc()).all()
    return jsonify([g.to_dict() for g in guides]), 200


@guide_bp.route('/<int:guide_id>', methods=['DELETE'])
def delete_saved_guide(guide_id):
    """Delete a saved guide by id."""
    try:
        guide = SavedGuide.query.get(guide_id)
        if not guide:
            return jsonify({'msg': 'Guide not found'}), 404
        db.session.delete(guide)
        db.session.commit()
        return '', 204 # No content response on successful delete
    except Exception as e:
        current_app.logger.error(f"Failed to delete saved guide {guide_id}: {e}")
        db.session.rollback()
        return jsonify({'msg': 'Failed to delete guide'}), 500



@guide_bp.route('/generate', methods=['POST'])
def generate_guide():
    """Generate a full repair guide (Markdown) for a provided description."""
    data = request.get_json() or {}
    description = data.get('description')
    if not description:
        return jsonify({'msg': 'description required'}), 400

    try:
        content = generate_repair_guide_content(description)
        # If the service returned an error-string we prefix with 'Error:' per ai_service
        if isinstance(content, str) and content.startswith('Error:'):
            return jsonify({'msg': content}), 500

        return jsonify({'guide_content': content}), 200
    except Exception as e:
        current_app.logger.exception('Guide generation endpoint failed: %s', e)
        return jsonify({'msg': 'Failed to generate guide'}), 500



@guide_bp.route('/models', methods=['GET'])
def list_models():
    """Diagnostic: list available OpenAI models for the configured API key.

    This route is gated behind the ENABLE_AI_MODEL_LISTING config to avoid accidental exposure.
    """
    if not current_app.config.get('ENABLE_AI_MODEL_LISTING', False):
        return jsonify({'msg': 'Model listing is disabled in this environment.'}), 403

    try:
        api_key = current_app.config.get('OPENAI_API_KEY')
        if not api_key:
            return jsonify({'msg': 'OPENAI_API_KEY not configured'}), 400

        client = OpenAI(api_key=api_key)
        # call models.list (may vary by SDK version)
        models_resp = client.models.list()
        # Convert to simple list of model ids/names for the client
        models = []
        for m in getattr(models_resp, 'data', []) or []:
            # m may be a pydantic object
            model_id = getattr(m, 'id', None) or (m.get('id') if isinstance(m, dict) else None)
            if model_id:
                models.append(model_id)

        return jsonify({'models': models}), 200
    except Exception as e:
        current_app.logger.exception('Failed to list models: %s', e)
        return jsonify({'msg': f'Failed to list models: {str(e)}'}), 500









@guide_bp.route('/conversations', methods=['GET'])
@login_required
def list_conversations():
    user_id = getattr(g, 'current_user_id', None)
    convs = Conversation.query.filter_by(user_id=user_id).order_by(Conversation.created_at.desc()).all()
    return jsonify([c.to_dict() for c in convs]), 200


@guide_bp.route('/conversations', methods=['POST'])
@login_required
def create_conversation():
    data = request.get_json() or {}
    title = data.get('title') or 'New Conversation'
    user_id = getattr(g, 'current_user_id', None)
    conv = Conversation(user_id=user_id, title=title)
    db.session.add(conv)
    db.session.commit()
    return jsonify(conv.to_dict()), 201


@guide_bp.route('/conversations/<int:conv_id>/messages', methods=['GET'])
@login_required
def get_conversation_messages(conv_id):
    user_id = getattr(g, 'current_user_id', None)
    conv = Conversation.query.get(conv_id)
    if not conv or conv.user_id != user_id:
        return jsonify({'msg': 'Conversation not found'}), 404
    msgs = ConversationMessage.query.filter_by(conversation_id=conv_id).order_by(ConversationMessage.created_at.asc()).all()
    return jsonify([m.to_dict() for m in msgs]), 200



@guide_bp.route('/conversations/<int:conv_id>/messages', methods=['POST'])
@login_required
def append_conversation_messages(conv_id):
    user_id = getattr(g, 'current_user_id', None)
    conv = Conversation.query.get(conv_id)
    if not conv or conv.user_id != user_id:
        return jsonify({'msg': 'Conversation not found'}), 404
    data = request.get_json() or {}
    messages = data.get('messages') or []
    added = []
    try:
        for m in messages:
            role = m.get('role')
            content = m.get('content')
            cm = ConversationMessage(conversation_id=conv_id, role=role, content=content)
            db.session.add(cm)
            added.append(cm)
        db.session.commit()
        return jsonify({'added': [a.to_dict() for a in added]}), 201
    except Exception as e:
        current_app.logger.exception('Failed to append messages: %s', e)
        db.session.rollback()
        return jsonify({'msg': 'Failed to append messages'}), 500



@guide_bp.route('/conversations/<int:conv_id>', methods=['PUT'])
@login_required
def rename_conversation(conv_id):
    """Rename a user's conversation (title update)."""
    user_id = getattr(g, 'current_user_id', None)
    conv = Conversation.query.get(conv_id)
    if not conv or conv.user_id != user_id:
        return jsonify({'msg': 'Conversation not found'}), 404
    data = request.get_json() or {}
    title = data.get('title')
    if not title:
        return jsonify({'msg': 'title is required'}), 400
    try:
        conv.title = title[:255]
        db.session.add(conv)
        db.session.commit()
        return jsonify(conv.to_dict()), 200
    except Exception as e:
        current_app.logger.exception('Failed to rename conversation %s: %s', conv_id, e)
        db.session.rollback()
        return jsonify({'msg': 'Failed to rename conversation'}), 500


@guide_bp.route('/conversations/<int:conv_id>', methods=['DELETE'])
@login_required
def delete_conversation(conv_id):
    """Delete a conversation and its messages for the current user."""
    user_id = getattr(g, 'current_user_id', None)
    conv = Conversation.query.get(conv_id)
    if not conv or conv.user_id != user_id:
        return jsonify({'msg': 'Conversation not found'}), 404
    try:
        # Delete messages first
        ConversationMessage.query.filter_by(conversation_id=conv_id).delete()
        db.session.delete(conv)
        db.session.commit()
        return '', 204
    except Exception as e:
        current_app.logger.exception('Failed to delete conversation %s: %s', conv_id, e)
        db.session.rollback()
        return jsonify({'msg': 'Failed to delete conversation'}), 500
