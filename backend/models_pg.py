from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
    Float,
)
from sqlalchemy.orm import relationship
from datetime import datetime

from database_pg import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(500), nullable=False)

    role = Column(String(50), default="employee", index=True)
    title = Column(String(255), default="")
    department = Column(String(255), default="")
    phone = Column(String(50), default="")
    avatar_url = Column(String(500), default="")

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(255), nullable=False)
    description = Column(Text, default="")

    sector = Column(String(100), default="arak_development", index=True)
    status = Column(String(50), default="active", index=True)
    priority = Column(String(50), default="medium", index=True)

    progress = Column(Integer, default=0)
    rag = Column(String(50), default="amber")

    budget = Column(Float, default=0)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", foreign_keys=[owner_id])
    creator = relationship("User", foreign_keys=[created_by])


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), nullable=False)
    description = Column(Text, default="")

    sector = Column(String(100), default="arak_development", index=True)
    status = Column(String(50), default="pending", index=True)
    priority = Column(String(50), default="medium", index=True)

    progress = Column(Integer, default=0)

    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project")
    assignee = relationship("User", foreign_keys=[assignee_id])
    creator = relationship("User", foreign_keys=[created_by])


class ProgressUpdate(Base):
    __tablename__ = "progress_updates"

    id = Column(Integer, primary_key=True, index=True)

    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    update_type = Column(String(50), default="note")
    title = Column(String(255), default="")
    content = Column(Text, default="")
    progress = Column(Integer, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project")
    user = relationship("User")


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    location = Column(String(255), default="")
    status = Column(String(50), default="scheduled")

    meeting_date = Column(DateTime, nullable=True)
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)

    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    creator = relationship("User")


class MeetingRequest(Base):
    __tablename__ = "meeting_requests"

    id = Column(Integer, primary_key=True, index=True)

    requester_name = Column(String(255), default="")
    requester_email = Column(String(255), default="")
    requester_phone = Column(String(50), default="")

    subject = Column(String(255), default="")
    details = Column(Text, default="")

    status = Column(String(50), default="pending", index=True)
    priority = Column(String(50), default="medium")

    requested_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    file_name = Column(String(500), default="")
    file_url = Column(String(1000), default="")
    document_type = Column(String(100), default="general")

    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project")
    uploader = relationship("User")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    title = Column(String(255), default="")
    message = Column(Text, default="")
    notification_type = Column(String(100), default="info")

    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)

    sender_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    subject = Column(String(255), default="")
    body = Column(Text, default="")

    priority = Column(String(50), default="medium")
    status = Column(String(50), default="sent")

    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])


class DailyReport(Base):
    __tablename__ = "daily_reports"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), default="")
    summary = Column(Text, default="")
    report_date = Column(DateTime, default=datetime.utcnow)

    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    creator = relationship("User")


class VoiceDirective(Base):
    __tablename__ = "voice_directives"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), default="")
    transcript = Column(Text, default="")
    status = Column(String(50), default="new")

    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    creator = relationship("User")


class PricingAnalysis(Base):
    __tablename__ = "pricing_analyses"

    id = Column(Integer, primary_key=True, index=True)

    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    axis = Column(String(255), default="")
    project_text = Column(Text, default="")
    instruction = Column(Text, default="")
    answer = Column(Text, default="")

    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project")
    creator = relationship("User")
