from datetime import date, datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterIn(BaseModel):
    role: str = Field(..., pattern="^(traveler|companion)$")
    email: EmailStr
    password: str = Field(..., min_length=8)
    name: str = Field(..., min_length=2)
    gender: Optional[str] = None
    city: Optional[str] = None
    birth_year: Optional[int] = None
    interests: Optional[list[str]] = []
    languages: Optional[list[str]] = []


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: str
    is_admin: bool
    email: EmailStr
    name: str
    gender: Optional[str] = None
    city: Optional[str] = None
    bio: Optional[str] = None
    interests: list[str] = []
    languages: list[str] = []
    avatar_url: Optional[str] = None
    is_approved: bool
    status: str
    created_at: datetime


class TokenOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut


class RefreshIn(BaseModel):
    refresh_token: str


class ProfileUpdateIn(BaseModel):
    name: Optional[str] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    bio: Optional[str] = None
    interests: Optional[list[str]] = None
    languages: Optional[list[str]] = None
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    birth_year: Optional[int] = None
    emergency_name: Optional[str] = None
    emergency_phone: Optional[str] = None


class CompanionProfileUpdateIn(BaseModel):
    tagline: Optional[str] = None
    hourly_rate_kes: Optional[int] = Field(default=None, ge=100)
    description: Optional[str] = None
    activity_types: Optional[list[str]] = None
    availability: Optional[dict[str, Any]] = None


class PhotoIn(BaseModel):
    url: str
    is_primary: bool = False


class PhotoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    is_primary: bool


class CompanionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    gender: Optional[str] = None
    city: Optional[str] = None
    avatar_url: Optional[str] = None
    is_approved: bool
    status: str
    created_at: datetime

    tagline: Optional[str] = None
    hourly_rate_kes: int
    description: Optional[str] = None
    activity_types: list[str] = []
    availability: dict[str, Any] = {}
    rating_avg: float = 0
    rating_count: int = 0
    verified_id: bool = False
    is_featured: bool = False
    interests: list[str] = []
    languages: list[str] = []
    photos: list[PhotoOut] = []


class BriefUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    role: str
    city: Optional[str] = None
    avatar_url: Optional[str] = None


class BookingCreateIn(BaseModel):
    companion_id: int
    activity: str = Field(..., min_length=2)
    booking_date: date
    hours: float = Field(..., gt=0, le=12)
    notes: Optional[str] = None


class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    activity: str
    booking_date: date
    hours: float
    rate_kes: int
    total_kes: int
    commission_kes: int
    payout_kes: int
    status: str
    notes: Optional[str] = None
    created_at: datetime
    traveler: BriefUserOut
    companion: BriefUserOut


class ConversationCreateIn(BaseModel):
    user_b_id: int
    booking_id: Optional[int] = None


class MessageCreateIn(BaseModel):
    body: str = Field(..., min_length=1, max_length=2000)


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sender_id: int
    body: str
    read_at: Optional[datetime] = None
    created_at: datetime


class ConversationOut(BaseModel):
    id: int
    other_user: BriefUserOut
    last_message: Optional[MessageOut] = None
    unread_count: int = 0
    updated_at: datetime


class ReviewCreateIn(BaseModel):
    booking_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    booking_id: int
    reviewer_id: int
    reviewee_id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    reviewer_name: Optional[str] = None


class ReportCreateIn(BaseModel):
    reported_id: int
    reason: str = Field(..., min_length=3)
    details: Optional[str] = None


class BlockIn(BaseModel):
    blocked_id: int


class AdminStatsOut(BaseModel):
    travelers: int
    companions: int
    pending_approvals: int
    open_reports: int
    bookings: int
