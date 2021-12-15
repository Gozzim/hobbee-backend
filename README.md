# <img src="https://github.com/Gozzim/hobbee-frontend/blob/master/src/assets/hobbee_white.svg" height="75" alt="logo">

# Seba Team 01 Hobb.ee-web-application-backend
[![run-test](https://github.com/Gozzim/hobbee-backend/actions/workflows/test.yml/badge.svg)](https://github.com/Gozzim/hobbee-backend/actions/workflows/test.yml)
[![CodeFactor](https://www.codefactor.io/repository/github/gozzim/hobbee-backend/badge)](https://www.codefactor.io/repository/github/gozzim/hobbee-backend)

This repository contains the backend for Hobb.ee.
The web application was built as part of the SEBA-Master course 2021 at TUM by team 01.

Hobb.ee is a social networking service that helps individuals meet new people with common interests by recommending activity-oriented groups based on their personal preferences.


The frontend can be found [here](https://github.com/Gozzim/hobbee-frontend)


Follow this readme to build and run the hobb.ee backend locally.

## Prerequisites

Both for the frontend and the backend:

* nodejs
    * [official website](https://nodejs.org/en/)
    * version 16.3
* npm js
    * [offical website](https://www.npmjs.com/) (node package manager)
    * version 7.16.0

Only for backend:
* mongodb
    * [official installation guide](https://docs.mongodb.org/manual/administration/install-community/)
    * v4.4.6
## Setup

### Clone Hobb.ee-Project-backend

Clone the [hobb.ee-backend](https://github.com/Gozzim/hobbee-backend) repository using [git](http://git-scm.com/):

Navigate to the root-folder that you want to clone your backend into.
A file structure for the project we recommend would be the following:
```
- /root-folder/
    - /root-folder/hobbee-frontend/
    - /root-folder/hobbee-backend/
    - /root-folder/database/
```

Create and navigate to your root-folder.



```bash
git clone https://github.com/Gozzim/hobbee-backend.git
```


Go to your backend folder via command line:
```bash
cd path/to/root-folder/hobbee-backend
```

**Install node dependencies**

```bash
npm install
```

**Adjust the `.env` parameters with your config** 


## Start the project

For this project we have set up a remote database to which the backend will automatically connect on backend startup. So you do not need to connect a database manually.

Simply enter

**Production environment**
```bash
npm start
```

**Imports**
Now you need to import various data into your database via the following script

```bash
npm run import
```

Happy testing!

## License
This code and content is released under the [GNU AGPL license](https://github.com/Gozzim/hobbee-backend/blob/master/LICENSE).

# <img src="https://github.com/Gozzim/hobbee-frontend/blob/master/src/assets/hobbee_white.svg" height="75" alt="logo">
