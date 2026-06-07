import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'database'))
from connection import engine
import pandas as pd

TECH_SKILLS = [
    "python", "sql", "r", "java", "javascript", "typescript",
    "machine learning", "deep learning", "nlp", "computer vision",
    "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch",
    "docker", "kubernetes", "aws", "azure", "gcp",
    "postgresql", "mysql", "mongodb", "spark", "airflow",
    "react", "node.js", "fastapi", "flask", "django",
    "git", "linux", "tableau", "power bi", "dbt", "kafka"
]

def extract_skills_from_text(text):
    text = text.lower()
    return [skill for skill in TECH_SKILLS if skill in text]

def match_resume(resume_text, top_n=5):
    print("🔍 Matching resume against job database...")

    resume_skills = extract_skills_from_text(resume_text)
    if not resume_skills:
        print("⚠️  No recognizable tech skills found in resume text.")
        return []

    resume_skill_str = " ".join(resume_skills)
    print(f"📋 Skills detected: {resume_skills}")

    df = pd.read_sql("""
        SELECT j.job_id, j.title, c.company_name,
               STRING_AGG(s.skill_name, ' ') AS required_skills
        FROM jobs j
        LEFT JOIN companies c   ON j.company_id = c.company_id
        LEFT JOIN job_skills js ON j.job_id = js.job_id
        LEFT JOIN skills s      ON js.skill_id = s.skill_id
        GROUP BY j.job_id, j.title, c.company_name
    """, engine)

    df["required_skills"] = df["required_skills"].fillna("")
    df = df[df["required_skills"] != ""]

    if df.empty:
        print("❌ No jobs with skills found in database.")
        return []

    all_texts = [resume_skill_str] + df["required_skills"].tolist()
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(all_texts)

    similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
    df["match_score"] = (similarities * 100).round(1)

    top_jobs = df.nlargest(top_n, "match_score")

    results = []
    for _, row in top_jobs.iterrows():
        job_skills     = set(row["required_skills"].split())
        missing_skills = job_skills - set(resume_skills)
        results.append({
            "title":          row["title"],
            "company":        row["company_name"],
            "match_score":    row["match_score"],
            "missing_skills": list(missing_skills)[:5]
        })

    return results

if __name__ == "__main__":
    sample_resume = """
    Experienced data professional with skills in Python, SQL, pandas, numpy,
    machine learning, scikit-learn. Worked with PostgreSQL and AWS.
    Built ETL pipelines and data visualizations.
    """
    results = match_resume(sample_resume)
    print("\n🎯 Top Matching Jobs:")
    for r in results:
        print(f"\n  {r['title']} @ {r['company']}")
        print(f"  Match Score : {r['match_score']}%")
        print(f"  Missing     : {r['missing_skills']}")