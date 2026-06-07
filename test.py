from database.connection import engine

try:
    conn = engine.connect()
    print("✅ PostgreSQL connected successfully!")
    conn.close()
except Exception as e:
    print("❌ Database connection failed:")
    print(e)