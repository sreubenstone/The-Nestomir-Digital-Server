# The Nestomir Digital Backend

### Overview

Let's create a timeless educational tale for the next generation of learners...earn community status and rewards–help push American (and global) STEM education forward 🤓 ☄️.

See the [main project page here](https://www.incubatedd.com), as well as [the central story repository here](https://www.github.com/sreubenstone).

### What is The Nestomir?

The Nestomir is a planetary quest (fantasy novel and companion app) involving a crash-landed alien warrior, a troubled 12-year-old boy, a mysterious learning force permeating the universe and 9 computer science lessons which grant students superpowers. It follows the main character, Jake Addison, through a series of quests which introduce him to computer programming and a new "learn with purpose" learning philosophy. And now through crowd participation, we're going to improve the the story and app experience together.

_Make sure you review the [story outline](https://github.com/sreubenstone/thenestomir/blob/main/outline.md) to get a better sense of the story and lesson plan._

![graphic](https://res.cloudinary.com/dshxqbjrf/image/upload/v1633998380/chapter_symbol_sfj0ji.png)

### Set up

##### Server

- clone this repository to your local machine

- toggle into the workspace directory

- run `npm i` to install all packages for project

##### env file

- PORT=4000
- JWT_SECRET='place any random string here'
- PGCONNECTSTRING='postgres://localhost/dendro'
- SENDGRID_API_KEY='place any random string here...not needed on dev'
- MIXPANEL_TOKEN='place any random string here...not needed on dev'
- PROD='false'
- AIRTABLE_API_KEY='place any random string here...not needed on dev'
- AIRTABLE_BASE='place any random string here...not needed on dev'
- SENTRY='place any random string here...not needed on dev'
- MOCHAMOJO='place any random string here...this is to reset a user's password on dev'

##### Local Database Setup

- set up local postgres database named `dendro`. See [this tutorial](https://www.prisma.io/dataguide/postgresql/setting-up-a-local-postgresql-database) for installing postgres on your local machine. Note, it's always great to have a tool like [TablePlus](https://tableplus.com/) to easily view the contents of your DB. See [this tutorial](https://www.tutorialspoint.com/postgresql/postgresql_create_database.htm) for creating a new postgres database on your local machine once you have postgres installed.

- run database migrations from local repository directory be running `knex migrate:latest`

##### Codebase structure

_src folder contains all server files_

- server.ts (application entry point, sets up express and /graphql endpoint, as well as other REST endpoints)
- auth.ts - authentication logic for server
- schema.ts - complete API schema (graphQL)
- utilities.ts - mash of utility functions
- push.ts - logic responsible for sending push notifications of expo infrastructure
- gconvert.ts - please ignore
- /db contains schema definitions (migrations)

#### Contributing ⚡

- Bug squash (fix a bug) **+1 community point**
- Code snippet refactor (refactor one section of a file) **+3 community points**
- File refactor (refactor an entire file) **+10 community points**
- Feature build (build a new feature) **+300 community points**
- Feature tweak (tweak an existing feature's functionality) **+40 community points**
- Package update (upgrade a package in our codebase) **+40 community points**

_See official Rules & Rewards page [here](https://docs.google.com/document/d/1NKq1-DYcj6KLrF_zVx6q6SNO_ziVBNLQdH-744r1aTc/edit?usp=sharing)–these are official rules, please review._

##### Ideas for Contributing

- Improve file structure, refactor code, improve server performance
- Create new features/functionality for The Nestomir Digital
- See comments in src files for further direction

Check out our [web platform](https://www.incubatedd.com/thenestomir) and [discord](https://discord.gg/thtjVaaq) forums to get inspiration on how to participate.
