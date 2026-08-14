from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import CompanionProfile, Favorite, User
from ..security import get_current_user
from .companions import _companion_out

router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.get("/ids")
def favorite_ids(db: Session = Depends(get_db), user=Depends(get_current_user)):
    rows = db.query(Favorite.companion_id).filter(Favorite.user_id == user.id).all()
    return [r[0] for r in rows]


@router.get("")
def list_favorites(db: Session = Depends(get_db), user=Depends(get_current_user)):
    favs = (
        db.query(Favorite)
        .options(joinedload(Favorite.companion).joinedload(User.companion_profile))
        .filter(Favorite.user_id == user.id)
        .order_by(Favorite.created_at.desc())
        .all()
    )
    profiles = [f.companion.companion_profile for f in favs if f.companion.companion_profile]
    return [_companion_out(p) for p in profiles]


def _get_favorite(db: Session, user_id: int, companion_id: int) -> Favorite | None:
    return (
        db.query(Favorite)
        .filter(Favorite.user_id == user_id, Favorite.companion_id == companion_id)
        .first()
    )


@router.post("/{companion_id}")
def add_favorite(companion_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if companion_id == user.id:
        raise HTTPException(400, "You cannot favourite yourself")
    profile = db.get(CompanionProfile, companion_id)
    if not profile or not profile.user.is_approved or profile.user.status != "active":
        raise HTTPException(404, "Companion not found")
    if not _get_favorite(db, user.id, companion_id):
        db.add(Favorite(user_id=user.id, companion_id=companion_id))
        db.commit()
    return {"favorited": True}


@router.delete("/{companion_id}")
def remove_favorite(companion_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    fav = _get_favorite(db, user.id, companion_id)
    if fav:
        db.delete(fav)
        db.commit()
    return {"favorited": False}