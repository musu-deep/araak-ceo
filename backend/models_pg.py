from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Boolean,
    ForeignKey
)

from sqlalchemy.orm import relationship
from datetime import datetime

from database_pg import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(500), nullable=False)

    role = Column(String(50), default="employee")

    created_at = Column(DateTime, default=datetime.utcnow)


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(255), nullable=False)
    description = Column(Text)

    status = Column(String(50), default="active")

    created_at = Column(DateTime, default=datetime.utcnow)


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), nullable=False)
    description = Column(Text)

    status = Column(String(50), default="pending")
    priority = Column(String(50), default="medium")

    project_id = Column(Integer, ForeignKey("projects.id"))

    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project")


class ProgressUpdate(Base):
    __tablename__ = "progress_updates"

    id = Column(Integer, primary_key=True, index=True)

    project_id = Column(Integer, ForeignKey("projects.id"))

    title = Column(String(255))
    details = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project")


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255))
    description = Column(Text)

    meeting_date = Column(DateTime)

    created_at = Column(DateTime, default=datetime.utcnow)


class MeetingRequest(Base):
    __tablename__ = "meeting_requests"

    id = Column(Integer, primary_key=True, index=True)

    requester_name = Column(String(255))
    requester_email = Column(String(255))

    subject = Column(String(255))
    details = Column(Text)

    status = Column(String(50), default="pending")

    created_at = Column(DateTime, default=datetime.utcnow)


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255))
    file_name = Column(String(500))

    created_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255))
    message = Column(Text)

    is_read = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)


class VoiceDirective(Base):
    __tablename__ = "voice_directives"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255))
    transcript = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)
