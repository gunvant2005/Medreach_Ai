import sys
import os

# Ensure api directory is in sys.path for Vercel Serverless Function runtime
api_dir = os.path.dirname(os.path.abspath(__file__))
if api_dir not in sys.path:
    sys.path.insert(0, api_dir)

from app.main import app
