import pandas as pd
import numpy as np
import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'database'))

from connection import engine
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

def train_salary_predictor():
    print("📊 Loading jobs with salary data...")
    df = pd.read_sql("""
        SELECT j.title, j.location, j.salary_min, j.salary_max,
               STRING_AGG(s.skill_name, ' ') AS skills
        FROM jobs j
        LEFT JOIN job_skills js ON j.job_id = js.job_id
        LEFT JOIN skills s      ON js.skill_id = s.skill_id
        WHERE j.salary_min IS NOT NULL AND j.salary_max IS NOT NULL
        GROUP BY j.job_id, j.title, j.location, j.salary_min, j.salary_max
    """, engine)

    if len(df) < 10:
        print("⚠️  Not enough salary data. Generating synthetic training data...")
        df = generate_synthetic_data()

    df["salary_avg"]  = (df["salary_min"] + df["salary_max"]) / 2
    df["skills"]      = df["skills"].fillna("")
    df["text_input"]  = df["title"].fillna("") + " " + df["location"].fillna("") + " " + df["skills"]

    from sklearn.feature_extraction.text import TfidfVectorizer
    vectorizer = TfidfVectorizer(max_features=500, stop_words="english")
    X = vectorizer.fit_transform(df["text_input"])
    y = df["salary_avg"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    print(f"\n📈 MAE:  ${mean_absolute_error(y_test, y_pred):,.0f}")
    print(f"📈 R²:   {r2_score(y_test, y_pred):.2f}")

    os.makedirs("models", exist_ok=True)
    joblib.dump(model,      "models/salary_predictor.pkl")
    joblib.dump(vectorizer, "models/salary_predictor_vectorizer.pkl")
    print("✅ Salary predictor saved to ml/models/")

def generate_synthetic_data():
    """Fallback synthetic dataset when real salary data is sparse."""
    records = [
        ("Data Engineer",        "Remote",   70000, 100000, "python sql spark airflow"),
        ("ML Engineer",          "New York",  90000, 130000, "python machine learning tensorflow"),
        ("Data Scientist",       "San Francisco", 95000, 140000, "python r statistics machine learning"),
        ("Software Engineer",    "Remote",   80000, 120000, "javascript react node.js"),
        ("DevOps Engineer",      "Austin",   85000, 115000, "docker kubernetes aws ci/cd"),
        ("Cloud Engineer",       "Seattle",  90000, 125000, "aws azure gcp terraform"),
        ("AI Engineer",          "Remote",   100000, 145000, "python deep learning nlp pytorch"),
        ("Backend Engineer",     "Chicago",  75000, 110000, "python django postgresql"),
        ("Data Analyst",         "Remote",   55000, 80000,  "sql tableau power bi excel"),
        ("Frontend Engineer",    "Remote",   70000, 105000, "javascript react typescript css"),
    ] * 15  # repeat to give enough training rows
    return pd.DataFrame(records, columns=["title","location","salary_min","salary_max","skills"])

def predict_salary(title, location, skills):
    model      = joblib.load("models/salary_predictor.pkl")
    vectorizer = joblib.load("models/salary_predictor_vectorizer.pkl")
    text = f"{title} {location} {skills}"
    vec  = vectorizer.transform([text])
    predicted = model.predict(vec)[0]
    return {
        "estimated_salary": round(predicted, 2),
        "range_min": round(predicted * 0.85, 2),
        "range_max": round(predicted * 1.15, 2)
    }

if __name__ == "__main__":
    train_salary_predictor()