from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Block, Report, User
from ..schemas import BlockIn, ReportCreateIn, UserOut
from ..security import get_current_user

router = APIRouter(tags=["safety"])


@router.post("/emergency", response_model=UserOut)
def save_emergency(body: dict, user: User = Depends(get_current_user),
                   db: Session = Depends(get_db)):
    user.emergency_name = (body or {}).get("emergency_name")
    user.emergency_phone = (body or {}).get("emergency_phone")
    db.commit()
    db.refresh(user)
    return user


@router.post("/reports")
def report_user(body: ReportCreateIn, user: User = Depends(get_current_user),
                db: Session = Depends(get_db)):
    if body.reported_id == user.id:
        raise HTTPException(status_code=400, detail="You cannot report yourself")
    reported = db.get(User, body.reported_id)
    if not reported:
        raise HTTPException(status_code=404, detail="User not found")
    report = Report(reporter_id=user.id, reported_id=body.reported_id,
                    reason=body.reason, details=body.details)
    db.add(report)
    db.commit()
    return {"ok": True, "report_id": report.id}


@router.post("/blocks")
def block_user(body: BlockIn, user: User = Depends(get_current_user),
               db: Session = Depends(get_db)):
    if body.blocked_id == user.id:
        raise HTTPException(status_code=400, detail="You cannot block yourself")
    existing = db.query(Block).filter(
        Block.blocker_id == user.id, Block.blocked_id == body.blocked_id
    ).first()
    if existing:
        return {"ok": True, "blocked": True}
    db.add(Block(blocker_id=user.id, blocked_id=body.blocked_id))
    db.commit()
    return {"ok": True, "blocked": True}


@router.delete("/blocks/{blocked_id}")
def unblock_user(blocked_id: int, user: User = Depends(get_current_user),
                 db: Session = Depends(get_db)):
    block = db.query(Block).filter(
        Block.blocker_id == user.id, Block.blocked_id == blocked_id
    ).first()
    if block:
        db.delete(block)
        db.commit()
    return {"ok": True, "blocked": False}


@router.get("/blocks")
def my_blocks(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    blocks = db.query(Block).filter(Block.blocker_id == user.id).all()
    return [{"id": b.blocked_id, "name": db.get(User, b.blocked_id).name} for b in blocks]