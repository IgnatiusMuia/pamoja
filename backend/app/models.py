from datetime import datetime

from sqlalchemy import (JSON, Boolean, Column, Date, DateTime, Float, ForeignKey,
                        Integer, String, Text, UniqueConstraint)
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    role = Column(String, nullable=False, default="traveler")  # traveler | companion
    is_admin = Column(Boolean, default=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    gender = Column(String, nullable=True)  # male | female | other
    birth_year = Column(Integer, nullable=True)
    phone = Column(String, nullable=True)
    city = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    interests = Column(JSON, default=list)
    languages = Column(JSON, default=list)
    avatar_url = Column(String, nullable=True)
    is_approved = Column(Boolean, default=True)  # companions need admin approval
    status = Column(String, default="active")    # active | suspended | rejected
    emergency_name = Column(String, nullable=True)
    emergency_phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    companion_profile = relationship(
        "CompanionProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    photos = relationship("Photo", back_populates="user", cascade="all, delete-orphan")


class CompanionProfile(Base):
    __tablename__ = "companion_profiles"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    tagline = Column(String, nullable=True)
    hourly_rate_kes = Column(Integer, default=1000)
    description = Column(Text, nullable=True)
    activity_types = Column(JSON, default=list)
    availability = Column(JSON, default=dict)  # {"mon": "09:00-18:00", ...}
    rating_avg = Column(Float, default=0)
    rating_count = Column(Integer, default=0)
    is_featured = Column(Boolean, default=False)
    verified_id = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="companion_profile")


class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    url = Column(String, nullable=False)
    is_primary = Column(Boolean, default=False)
    position = Column(Integer, default=0)

    user = relationship("User", back_populates="photos")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True)
    traveler_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    companion_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    activity = Column(String, nullable=False)
    booking_date = Column(Date, nullable=False)
    start_time = Column(String, nullable=True)  # "HH:MM"
    hours = Column(Float, nullable=False)
    rate_kes = Column(Integer, nullable=False)
    total_kes = Column(Integer, nullable=False)
    commission_kes = Column(Integer, nullable=False)
    payout_kes = Column(Integer, nullable=False)
    status = Column(String, default="pending")  # pending | accepted | declined | cancelled | completed
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    traveler = relationship("User", foreign_keys=[traveler_id])
    companion = relationship("User", foreign_keys=[companion_id])


class Conversation(Base):
    __tablename__ = "conversations"
    __table_args__ = (UniqueConstraint("user_a_id", "user_b_id", name="uq_conversation_pair"),)

    id = Column(Integer, primary_key=True)
    user_a_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_b_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    user_a = relationship("User", foreign_keys=[user_a_id])
    user_b = relationship("User", foreign_keys=[user_b_id])


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    body = Column(Text, nullable=False)
    flagged = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")


class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (UniqueConstraint("booking_id", "reviewer_id", name="uq_review_per_booking"),)

    id = Column(Integer, primary_key=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reviewee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reported_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reason = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    status = Column(String, default="open")  # open | resolved | dismissed
    created_at = Column(DateTime, default=datetime.utcnow)


class Block(Base):
    __tablename__ = "blocks"
    __table_args__ = (UniqueConstraint("blocker_id", "blocked_id", name="uq_block_pair"),)

    id = Column(Integer, primary_key=True)
    blocker_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    blocked_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Favorite(Base):
    __tablename__ = "favorites"
    __table_args__ = (UniqueConstraint("user_id", "companion_id", name="uq_favorite_pair"),)

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    companion_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id])
    companion = relationship("User", foreign_keys=[companion_id])


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    type = Column(String, nullable=False)  # booking | message | review | system
    title = Column(String, nullable=False)
    body = Column(Text, nullable=True)
    link = Column(String, nullable=True)
    read_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id])