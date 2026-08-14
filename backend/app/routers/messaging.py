from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Block, Booking, Conversation, Message, User
from ..moderation import flag_message
from ..routers.notifications import notify
from ..schemas import ConversationCreateIn, ConversationOut, MessageCreateIn, MessageOut
from ..security import get_current_user

router = APIRouter(prefix="/conversations", tags=["messaging"])


def _other_user(conversation: Conversation, me: User) -> User:
    return conversation.user_b if conversation.user_a_id == me.id else conversation.user_a


@router.post("", response_model=ConversationOut)
def start_or_get_conversation(body: ConversationCreateIn, user: User = Depends(get_current_user),
                              db: Session = Depends(get_db)):
    if body.user_b_id == user.id:
        raise HTTPException(status_code=400, detail="You cannot message yourself")
    other = db.get(User, body.user_b_id)
    if not other or other.status != "active":
        raise HTTPException(status_code=400, detail="User not found")

    blocked = db.query(Block).filter(
        or_(Block.blocker_id == user.id, Block.blocked_id == user.id)
    ).filter(
        or_(Block.blocker_id == other.id, Block.blocked_id == other.id)
    ).first()
    if blocked:
        raise HTTPException(status_code=403, detail="Messaging is not possible with this user")

    conversation = (
        db.query(Conversation)
        .filter(
            or_(
                (Conversation.user_a_id == user.id) & (Conversation.user_b_id == other.id),
                (Conversation.user_a_id == other.id) & (Conversation.user_b_id == user.id),
            )
        )
        .first()
    )
    if not conversation:
        conversation = Conversation(user_a_id=user.id, user_b_id=other.id,
                                    booking_id=body.booking_id)
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    return _conversation_out(conversation, user, db)


def _conversation_out(conversation: Conversation, me: User, db: Session) -> ConversationOut:
    other = _other_user(conversation, me)
    last = (
        db.query(Message)
        .filter(Message.conversation_id == conversation.id)
        .order_by(Message.created_at.desc())
        .first()
    )
    unread = (
        db.query(Message)
        .filter(
            Message.conversation_id == conversation.id,
            Message.sender_id != me.id,
            Message.read_at.is_(None),
        )
        .count()
    )
    return ConversationOut(
        id=conversation.id,
        other_user=other,
        last_message=last,
        unread_count=unread,
        updated_at=conversation.updated_at,
    )


@router.get("", response_model=list[ConversationOut])
def my_conversations(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conversations = (
        db.query(Conversation)
        .filter(or_(Conversation.user_a_id == user.id, Conversation.user_b_id == user.id))
        .order_by(Conversation.updated_at.desc())
        .all()
    )
    return [_conversation_out(c, user, db) for c in conversations]


@router.get("/{conversation_id}/messages", response_model=list[MessageOut])
def get_messages(conversation_id: int, user: User = Depends(get_current_user),
                 db: Session = Depends(get_db)):
    conversation = db.get(Conversation, conversation_id)
    if not conversation or user.id not in (conversation.user_a_id, conversation.user_b_id):
        raise HTTPException(status_code=403, detail="Not your conversation")

    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .all()
    )
    for m in messages:
        if m.sender_id != user.id and m.read_at is None:
            m.read_at = datetime.utcnow()
    db.commit()
    return messages


@router.post("/{conversation_id}/messages", response_model=MessageOut)
def send_message(conversation_id: int, body: MessageCreateIn,
                 user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conversation = db.get(Conversation, conversation_id)
    if not conversation or user.id not in (conversation.user_a_id, conversation.user_b_id):
        raise HTTPException(status_code=403, detail="Not your conversation")

    other = _other_user(conversation, user)
    blocked = db.query(Block).filter(
        (Block.blocker_id == user.id) | (Block.blocked_id == user.id)
    ).filter(
        (Block.blocker_id == other.id) | (Block.blocked_id == other.id)
    ).first()
    if blocked:
        raise HTTPException(status_code=403, detail="Messaging is not possible with this user")

    body_text, terms = flag_message(db, user, body.body)
    message = Message(
        conversation_id=conversation_id,
        sender_id=user.id,
        body=body_text,
        flagged=bool(terms),
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    notify(
        db, other.id, "message",
        f"New message from {user.name}",
        body_text[:120] + ("…" if len(body_text) > 120 else ""),
        link=f"/dashboard/messages/{conversation_id}",
    )
    db.commit()
    return message