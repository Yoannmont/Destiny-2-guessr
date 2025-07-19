@echo off
echo Running tests with coverage...
pytest --cov=. --cov-report=html --cov-report=term-missing
start htmlcov\index.html