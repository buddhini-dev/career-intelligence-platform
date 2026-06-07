from connection import engine, Session, Base
from models import User, Company, Job, Skill, JobSkill, Prediction, SavedJob
from datetime import datetime

Base.metadata.create_all(engine)
print("✅ All tables created.")

session = Session()

# Dummy companies
c1 = Company(company_name="Google")
c2 = Company(company_name="Meta")
session.add_all([c1, c2])
session.flush()

# Dummy skills
s1 = Skill(skill_name="Python")
s2 = Skill(skill_name="Machine Learning")
s3 = Skill(skill_name="SQL")
session.add_all([s1, s2, s3])
session.flush()

# Dummy jobs
j1 = Job(
    title="Data Engineer",
    description="Build ETL pipelines using Python and SQL.",
    salary_min=70000, salary_max=100000,
    location="Remote", experience_level="Mid",
    posting_date=datetime.utcnow(),
    company_id=c1.company_id
)
j2 = Job(
    title="ML Engineer",
    description="Train and deploy machine learning models.",
    salary_min=90000, salary_max=130000,
    location="New York", experience_level="Senior",
    posting_date=datetime.utcnow(),
    company_id=c2.company_id
)
session.add_all([j1, j2])
session.flush()

# Link skills to jobs
session.add_all([
    JobSkill(job_id=j1.job_id, skill_id=s1.skill_id),
    JobSkill(job_id=j1.job_id, skill_id=s3.skill_id),
    JobSkill(job_id=j2.job_id, skill_id=s1.skill_id),
    JobSkill(job_id=j2.job_id, skill_id=s2.skill_id),
])

# Dummy user
u1 = User(name="Test User", email="test@example.com", role="student")
session.add(u1)
session.flush()

# Dummy saved job
session.add(SavedJob(user_id=u1.user_id, job_id=j1.job_id))

# Dummy prediction
session.add(Prediction(job_id=j1.job_id, salary_prediction=85000.0, category_prediction="Data Engineering"))

session.commit()
print("✅ Dummy data inserted successfully.")
session.close()