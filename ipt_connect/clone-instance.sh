#!/bin/bash

# Usage:
# ./clone-instance.sh IPTdev IPT2020
# IPTdev is the name of existing instance
# IPT2020 is the name of instance to be created

# Checking out to a detached HEAD to prevent branch pollution:
git checkout `git log --pretty=format:"%h" -1`


trash-put $2
cp -r $1 $2

# Commiting a command to be executed on rebase (just for convenience)
# We don't use --allow-empty anymore,
# because rebase strips empty commits out
touch "$2/.clone-instance.lock"
git add "$2/.clone-instance.lock"
git commit -m "{{  exec cd ipt_connect; ./clone-instance.sh $1 $2"


trash-put $2/migrations

git add $2
git commit -m "Copied $1 to $2 as is"

for f in `find $2 -type f` ; do
	#echo $f
	sed -i "s/$1/$2/g" $f
done;

#TODO: rename folders automatically, too!
mv $2/templates/$1 $2/templates/$2
mv $2/static/$1 $2/static/$2

git add $2
git commit -m "Replaced $1 with $2 in $2"

sed -ni "p; s/'$1'/'$2'/gp" ipt_connect/settings.py

git add ipt_connect/settings.py
git commit -m "Plugged $2 to the Django application index"

mkdir -p   $2/migrations/$2
touch      $2/migrations/$2/__init__.py
touch      $2/migrations/__init__.py

git add -f $2/migrations/$2/__init__.py
git add -f $2/migrations/__init__.py

git commit -m "Create empty migrations module for $2"

python manage.py makemigrations $2
python manage.py migrate

git add db.sqlite3
git commit -m "[DB] Generic DB migrations for $2"

# Finally, we commit the end of auto-commited block
# We don't use --allow-empty anymore,
# because rebase strips empty commits out
rm "$2/.clone-instance.lock"
git rm "$2/.clone-instance.lock"
git commit -m "}}  exec cd ipt_connect; ./clone-instance.sh $1 $2"
