UPRRP Grade Entry System
========================

[![Code Climate](https://codeclimate.com/github/crzrcn/UPRRP-Grades-Entry-System.png)](https://codeclimate.com/github/crzrcn/UPRRP-Grades-Entry-System)

[Demo](http://uprrp-ges.herokuapp.com/)

# Index

* [Tech Stack](#tech-stack)
* [Development setup](#development-setup)
* [Environment variables](#environment-variables)
* [Contributing](#contributing)
* [TODO](#todo)
* [Team](#team)
* [Help](#help)

# Tech stack

* Node.js
* Sails.js
* PostgreSQL
* Bootstrap

# Development setup

0. Install [brew](http://brew.sh/).
1. Install [Node.js](http://nodejs.org/) with `brew install node`.
2. Install [nodemon](http://remy.github.io/nodemon/) with `npm install -g nodemon`.
3. Install [Heroku Toolbelt](https://toolbelt.heroku.com/).
4. Install [Sails.js](http://sailsjs.org/#!getStarted) with `sudo npm install -g sails`.
4. Download [Postgres.app](http://postgresapp.com/) ([Instructions](http://www.postgresql.org/download/linux/ubuntu/) for Ubuntu).
4. Clone repo with `git clone git@github.com:crzrcn/UPRRP-Grades-Entry-System.git`.
5. Install Node.js dependencies with `npm install`.
6. Run app with `foreman start -f Procfile_dev`.
7. Seed database with `sails.config.seed()` on the Sails console.
8. Get coding.

# Environment variables

Any sensitive data like logins, database connection settings, API keys, etc. **cannot** be hardcoded in the remote repository.

If sensitive data gets leaked to **any** remote branch, the data leaked has to be changed because it is not advisable to edit git history.

0. Create an `.env` file in your local repository.
1. Add env variables with the syntax: `VARIABLE_NAME=value`.
2. Access the variable with `process.env.VARIABLE_NAME`.

# Contributing

1. Create your new feature branch (`git checkout -b my-new-feature`).
2. Commit your changes (`git commit -p`).
3. Push to the branch (`git push origin my-new-feature`).

# Team

[Fernando Martinez](http://crzrcn.github.io)

[Carlos Barba](http://github.com/carloscheddar)

[Roxana Gonzalez](http://github.com/rogonzalez)

[Carlos Corrada](http://github.com/ccorrada)

# Help

Got a question? Just create a new issue in github.
