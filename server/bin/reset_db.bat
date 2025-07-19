@echo off
echo Removing d2guessr_db.sqlite3
del /f /q d2guessr_db.sqlite3
echo Removing migrations
rmdir /s /q d2guessrauth/migrations
rmdir /s /q d2guessrlib/migrations
echo Done !