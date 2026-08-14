from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Notification, User
from ..schemas import NotificationOut
from ..security import get_current_user

router = APIRouter(prefix="/notifications", tags=["notifications"])


def notify(db: Session, user_id: int, type_: str, title: str,
           body: str | None = None, link: str | None = None) -> None:
    db.add(Notification(user_id=user_id, type=type_, title=title, body=body, link=link))


@router.get("", response_model=list[NotificationOut])
def my_notifications(limit: int = 30, db: Session = Depends(get_db),
                     user: User = Depends(get_current_user)):
    rows = (
        db.query(Notification)
        .filter(Notification.user_id == user.id)
        .order_by(Notification.created_at.desc())
        .limit(limit)
        .all()
    )
    return rows


@router.post("/read-all")
def mark_all_read(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    db.query(Notification).filter(
        Notification.user_id == user.id, Notification.read_at.is_(None)
    ).update({"read_at": datetime.utcnow()})
    db.commit()
    return {"ok": True}