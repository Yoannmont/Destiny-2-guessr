echo installing dependencies
pip install -r ../requirements.lock


echo collecting staticfiles
python3.12 ../manage.py collectstatic --no-input --clear
