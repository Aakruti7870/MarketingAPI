# 1. Install Dependencies
pip install fastapi uvicorn pytest reportlab pydantic

# 2. Run Master E2E Suite
pytest e2e/test_master_suite.py

# 3. Start Production Server
uvicorn backend.production:app --host 0.0.0.0 --port 8000 --reload
