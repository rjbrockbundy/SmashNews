# SmashNews

A news information and user forum to discuss information relating to the Super Smash Bros. Ultimate competitive esport.

## How to use

### Installing the necessary libraries

* Once the repo has been cloned, open terminal/cmd propmt
* cd into forumbackend and run `pip install -r requirements.txt`
* Then cd into forumfrontend and run `npm install`

### Starting the web app

* Open two seperate terminals
* Have one in the forumbackend folder and the other in the forumfrontend folder

### Starting the backend
* In the forumbackend folder run `python manage.py runserver`
* Then run `python manage.py migrate`
* Then create a django superuser using this command `python manage.py createsuperuser`

### Starting the frontend
* In the forumfrontend folder run `npm start`

The Project should open a tab on your default web browser with the web app.  Login into the website using your superuser credentials or by creating a new user on the login page.