from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from connection import Base

class User(Base):
    __tablename__ = 'users'
    user_id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    role = Column(String(20), default='student')
    created_at = Column(DateTime, default=datetime.utcnow)
    saved_jobs = relationship('SavedJob', back_populates='user')

class Company(Base):
    __tablename__ = 'companies'
    company_id = Column(Integer, primary_key=True)
    company_name = Column(String(200), unique=True, nullable=False)
    jobs = relationship('Job', back_populates='company')

class Job(Base):
    __tablename__ = 'jobs'
    job_id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    salary_min = Column(Float)
    salary_max = Column(Float)
    location = Column(String(150))
    experience_level = Column(String(50))
    posting_date = Column(DateTime)
    source_url = Column(Text)
    company_id = Column(Integer, ForeignKey('companies.company_id'))
    company = relationship('Company', back_populates='jobs')
    skills = relationship('JobSkill', back_populates='job')
    saved_by = relationship('SavedJob', back_populates='job')
    predictions = relationship('Prediction', back_populates='job')

class Skill(Base):
    __tablename__ = 'skills'
    skill_id = Column(Integer, primary_key=True)
    skill_name = Column(String(100), unique=True, nullable=False)
    jobs = relationship('JobSkill', back_populates='skill')

class JobSkill(Base):
    __tablename__ = 'job_skills'
    id = Column(Integer, primary_key=True)
    job_id = Column(Integer, ForeignKey('jobs.job_id'))
    skill_id = Column(Integer, ForeignKey('skills.skill_id'))
    job = relationship('Job', back_populates='skills')
    skill = relationship('Skill', back_populates='jobs')

class Prediction(Base):
    __tablename__ = 'predictions'
    prediction_id = Column(Integer, primary_key=True)
    job_id = Column(Integer, ForeignKey('jobs.job_id'))
    salary_prediction = Column(Float)
    category_prediction = Column(String(100))
    predicted_at = Column(DateTime, default=datetime.utcnow)
    job = relationship('Job', back_populates='predictions')

class SavedJob(Base):
    __tablename__ = 'saved_jobs'
    save_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.user_id'))
    job_id = Column(Integer, ForeignKey('jobs.job_id'))
    saved_at = Column(DateTime, default=datetime.utcnow)
    user = relationship('User', back_populates='saved_jobs')
    job = relationship('Job', back_populates='saved_by')