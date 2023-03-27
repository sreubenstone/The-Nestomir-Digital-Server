# The Nestomir Digital Backend

### Overview

Let's create a timeless educational tale for the next generation of learners...earn community status and rewards–help push American (and global) STEM education forward 🤓 ☄️.

😺 _Please note, the codebase is a little messy. This was started a few years ago. We need your help to improve it._

See the [main project page here](https://www.thenestomir.com), as well as [the central story repository here](https://www.github.com/sreubenstone/thenestomir). Please see our Contributor Agreement & Additional Repository Terms at the bottom of this document.

### What is The Nestomir?

The Nestomir is a planetary quest (fantasy novel and companion app) involving a crash-landed alien warrior, a troubled 12-year-old boy, a mysterious learning force permeating the universe and 9 computer science lessons which grant students superpowers. It follows the main character, Jake Addison, through a series of quests which introduce him to computer programming and a new "learn with purpose" learning philosophy. **And now through crowd participation, we're going to improve the the story and the social reading app experience together.**

![graphic](https://res.cloudinary.com/dshxqbjrf/image/upload/v1635737226/nestomir_coderhumor_graphicdesert_x3jxy0.png)

### How it works

- The book's manuscript and the native app (The Nestomir Digital) are stored in repositories on GitHub (any accepted pull request will grant you Major Contributor status)

- All Major Contributors will be listed/profiled in new versions of the book and app

- Make sure each pull request corresponds to one contribution type (if you want to make multiple contributions, issue multiple pull requests)

[See the offical Rules & Rewards page](https://docs.google.com/document/d/12luzhhrRYnxpkwq94KIs0MvAgISujhLuVamU0S4sqbg/edit?usp=sharing) to learn more about our community participation details.

### Set up

##### Server

- clone this repository to your local machine

- toggle into the workspace directory

- run `npm i` to install all packages for project

- once database and .env file is set up, run `npm run start:dev` to start the server on port 4000

##### Local Database Setup

- set up local postgres database named `dendro`. See [this tutorial](https://www.prisma.io/dataguide/postgresql/setting-up-a-local-postgresql-database) for installing postgres on your local machine. Note, it's always great to have a tool like [TablePlus](https://tableplus.com/) to easily view the contents of your DB. See [this tutorial](https://www.tutorialspoint.com/postgresql/postgresql_create_database.htm) for creating a new postgres database on your local machine once you have postgres installed.

- run database migrations from local repository directory be running `knex migrate:latest`

##### Codebase structure

_src folder contains all server files_

- `server.ts`–application entry point, sets up express and /graphql endpoint, as well as other REST endpoints)
- `auth.ts` - authentication logic for server
- `schema.ts` - complete API schema (graphQL)
- `utilities.ts` - mash of utility functions
- `push.ts` - logic responsible for sending push notifications of expo infrastructure
- `gconvert.ts` - please ignore
- `/db` contains schema definitions (migrations)

##### Tech stack

- Node.js
- Express.js
- graphQL (Apollo Server)
- postgres

##### env file

```
PORT=4000
JWT_SECRET='place any random string here'
PGCONNECTSTRING='postgres://localhost/dendro'
SENDGRID_API_KEY='place any random string here...not needed on dev'
MIXPANEL_TOKEN='place any random string here...not needed on dev'
PROD='false'
AIRTABLE_API_KEY='place any random string here...not needed on dev'
AIRTABLE_BASE='place any random string here...not needed on dev'
SENTRY='place any random string here...not needed on dev'
MOCHAMOJO='place any random string here...for user pw reset'
```

#### Contribution Types ⚡

- Bug squash (fix a bug) **+🏆 Featured in Book/App**
- Code snippet refactor (refactor one section of a file) **+🏆 Featured in Book/App**
- File refactor (refactor an entire file) **+🏆 ..all above + Signed Paperback Copy**
- Package update (upgrade a package in our codebase) **+🏆 ..above**
- Feature tweak (tweak an existing feature's functionality) **++🏆 ..all above + Rights to private Quarterly Author Call**
- Feature build (build a new feature) **+🏆 ..all above (more to come in the near future)**

_See official Rules & Rewards page [here](https://docs.google.com/document/d/12luzhhrRYnxpkwq94KIs0MvAgISujhLuVamU0S4sqbg/edit?usp=sharing)–these are official rules, please review._

#### Ideas for Contributing

- Improve file structure, refactor code, improve server performance

- Create new features/functionality for The Nestomir Digital

- See comments in src files for further direction

**Questions to help drive development**

- How can we better build relationships between readers?

- How can we leverage the concept of a Reading Buddy to enhance literacy building?

- How can we leverage the concept of a Reading Buddy to enhance how readers engage with the story?

- How can we make the application more interactive

- Can we/should we embed quizzes or other checkpoint related material into the E-Readers

- Are there other social features that might be interesting in this setting?

- How can we optimize the experience for the classroom

- How can we optimize the reader so it can be adopted by schools and classroom educators?

Our [web platform](https://www.thenestomir.com/thenestomir) and [discord](https://discord.gg/thtjVaaq) community are buzzing with conversations and ideas about how to contribute to the book. Please check them out to get started.

![dog](https://res.cloudinary.com/dshxqbjrf/image/upload/v1635700452/happy-little-girl-holding-a-book-mockup-at-the-library-a19273-8Aw_ahttb0.png)

### Contributor Agreement & Additional Repository Terms

This repository is governed by its attached Apache 2.0 License as well as the terms in this Contributor Agreement. Any contributions you make to the codebase in this repository can be used by The Nestomir™ team (and any other third party party) in their version of the software (in a commercial or non-commercial setting). There is no obligation to compensate you in any form for your contributions. All contributions made to this repository will also be governed by the Apache 2.0 License (this means you are agreeing to put your contributions in the open source domain, which legally means you are providing the public with an irrevocable license to use your work in a commercial or non commercial capacity–see the license attached to this repository for the specific details behind the Apache 2.0 license). The Nestomir’s objective is to open up the story and social reading experience for others to participate/modify–however–The Nestomir™ will maintain full rights over our brand name, cover art and branding. This means you agree to not use The Nestomir™ or any variations of The Nestomir™ name or cover art in your distributed works in any commercial or non-commercial capacity.
