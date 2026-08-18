from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..models import CompanionProfile, Payment, User
from ..schemas import BillingOut, PaymentOut
from ..security import get_current_user

router = APIRouter(prefix="/billing", tags=["billing"])


def _listing_active(profile: CompanionProfile | None, now: datetime | None = None) -> bool:
    if not profile or not profile.paid_until:
        return False
    return profile.paid_until >= (now or datetime.utcnow())


@router.get("/me", response_model=BillingOut)
def my_billing(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = user.companion_profile
    last = (
        db.query(Payment)
        .filter(Payment.user_id == user.id)
        .order_by(Payment.created_at.desc())
        .first()
    )
    recent = (
        db.query(Payment)
        .filter(Payment.user_id == user.id)
        .order_by(Payment.created_at.desc())
        .limit(10)
        .all()
    )
    return BillingOut(
        listing_fee_kes=settings.LISTING_FEE_KES,
        paid_until=profile.paid_until if profile else None,
        listing_active=_listing_active(profile),
        last_payment=last,
        payments=[PaymentOut.model_validate(p) for p in recent],
    )


@router.post("/mpesa/stk-push", response_model=PaymentOut)
def mpesa_stk_push(phone: str = "", user: User = Depends(get_current_user),
                   db: Session = Depends(get_db)):
    """Mock M-Pesa STK push. In production this calls the Daraja API, waits for a
    confirmation callback, then marks the payment as paid. Test mode: paid instantly."""
    if user.role != "companion":
        raise HTTPException(status_code=403, detail="Only companions pay a listing fee")

    profile = user.companion_profile
    if not profile:
        raise HTTPException(status_code=400, detail="Complete your companion profile first")

    reference = "MP-" + datetime.utcnow().strftime("%Y%m%d%H%M%S") + str(user.id)
    payment = Payment(
        user_id=user.id,
        amount_kes=settings.LISTING_FEE_KES,
        method="mpesa",
        status="paid",
        reference=reference,
    )
    db.add(payment)

    now = datetime.utcnow()
    base = profile.paid_until if profile.paid_until and profile.paid_until > now else now
    profile.paid_until = base + timedelta(days=30 * settings.LISTING_MONTHS)
    db.commit()
    db.refresh(payment)
    return payment