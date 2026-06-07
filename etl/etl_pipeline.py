import pandas as pd
import numpy as np
import re
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'database'))

from connection import Session
from models import Company, Job, Skill, JobSkill

TECH_SKILLS = [
    "python", "sql", "r", "java", "javascript", "typescript",
    "machine learning", "deep learning", "nlp", "computer vision",
    "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch",
    "docker", "kubernetes", "aws", "azure", "gcp",
    "postgresql", "mysql", "mongodb", "redis",
    "spark", "airflow", "kafka", "dbt",
    "react", "node.js", "fastapi", "flask", "django",
    "git", "linux", "tableau", "power bi"
]

def clean_text(text):
    if pd.isna(text):
        return ""
    text = re.sub(r"<[^>]+>", " ", str(text))
    text = re.sub(r"[^\w\s,.\-]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip().lower()

def extract_skills(text, tags=""):
    combined = (str(text) + " " + str(tags)).lower()
    return [skill for skill in TECH_SKILLS if skill in combined]

def normalize_location(location):
    if pd.isna(location) or location.strip() == "":
        return "Remote"
    loc = location.strip()
    if any(word in loc.lower() for word in ["remote", "anywhere", "worldwide"]):
        return "Remote"
    return loc.title()

def normalize_salary(val):
    try:
        val = float(val)
        # If looks like hourly rate, convert to annual
        if val < 500:
            return val * 2080
        return val
    except:
        return None

def transform(df):
    print("🔄 Transforming data...")

    df = df.drop_duplicates(subset=["title", "company"])
    df = df[df["title"].notna() & (df["title"] != "")]

    df["description"] = df["description"].apply(clean_text)
    df["title"]       = df["title"].str.strip().str.title()
    df["company"]     = df["company"].str.strip().str.title()
    df["location"]    = df["location"].apply(normalize_location)
    df["salary_min"]  = df["salary_min"].apply(normalize_salary)
    df["salary_max"]  = df["salary_max"].apply(normalize_salary)
    df["skills"]      = df.apply(lambda row: extract_skills(row["description"], row.get("tags", "")), axis=1)

    print(f"✅ Transformed {len(df)} clean records")
    return df

def load(df):
    print("📥 Loading into PostgreSQL...")
    session = Session()

    loaded = 0
    for _, row in df.iterrows():
        try:
            # Get or create company
            company = session.query(Company).filter_by(company_name=row["company"]).first()
            if not company:
                company = Company(company_name=row["company"])
                session.add(company)
                session.flush()

            # Skip duplicate jobs
            exists = session.query(Job).filter_by(
                title=row["title"],
                company_id=company.company_id
            ).first()
            if exists:
                continue

            # Create job
            job = Job(
                title=row["title"],
                description=row["description"],
                salary_min=row["salary_min"],
                salary_max=row["salary_max"],
                location=row["location"],
                source_url=row.get("source_url", ""),
                company_id=company.company_id
            )
            session.add(job)
            session.flush()

            # Link skills
            for skill_name in row["skills"]:
                skill = session.query(Skill).filter_by(skill_name=skill_name).first()
                if not skill:
                    skill = Skill(skill_name=skill_name)
                    session.add(skill)
                    session.flush()
                session.add(JobSkill(job_id=job.job_id, skill_id=skill.skill_id))

            loaded += 1

        except Exception as e:
            print(f"⚠️  Skipped row due to error: {e}")
            session.rollback()
            continue

    session.commit()
    session.close()
    print(f"✅ Loaded {loaded} new jobs into the database")

def run_pipeline(csv_path="../data/raw_jobs.csv"):
    print("🚀 Starting ETL pipeline...")
    df = pd.read_csv(csv_path)
    print(f"📂 Loaded {len(df)} raw records")
    df = transform(df)
    load(df)
    print("✅ ETL pipeline complete!")

if __name__ == "__main__":
    run_pipeline()