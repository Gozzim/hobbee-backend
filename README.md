# <img src="https://hobb.ee/static/media/hobbee_white.7e5bc008.svg" height="75" alt="logo">

# Seba Team 01 Hobb.ee-web-application-backend

This repository contains the backend for Hobb.ee.
The web application was built as part of the SEBA-Master course 2021 at TUM by team 01.

Hobb.ee is a social networking service that helps individuals meet new people with common interests by recommending activity-oriented groups based on their personal preferences.


The frontend can be found [here](https://gitlab.lrz.de/seba-master-2021/team-01/frontend/)


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

Clone the [hobb.ee-backend](https://gitlab.lrz.de/seba-master-2021/team-01/backend/) repository using [git](http://git-scm.com/):

Navigate to the root-folder that you want to clone your backend into.
A file structure for the project we recommend would be the following:
```
- /root-folder/
    - /root-folder/frontend/
    - /root-folder/backend/
    - /root-folder/database/
```

Create and navigate to your root-folder.



```
git clone https://gitlab.lrz.de/seba-master-2021/team-01/frontend.git
```


Go to your backend folder via command line:
```
cd path/to/root-folder/backend
```

**Install node dependencies**

```
npm install
```



## Start the project

For this project we have set up a remote database to which the backend will automatically connect on backend startup. So you do not need to connect a database manually.

Simply enter

**Production environment**
```bash
npm start
```


## (optional) Run with Local Database


If you decide to use a local database you can do the following:

**Set up your database**

* Create a new directory where your database will be stored
    * we learned that it's a good idea to separate data and business logic - so the data directory should be in a different place than your app
* We suggest this folder structure
```
- /root-folder/
    - /root-folder/frontend/
    - /root-folder/backend/
    - /root-folder/database/
```
* Start the database server
```
mongod --dbpath "/root-folder/database"
```

In the ```.env``` file you need to change this line

```
MONGODB_URI="mongodb+srv://hobbee:6H!RgdAP-F2AHsc@cluster0.udpo6.mongodb.net/hobbee?retryWrites=true&w=majority"

```
to
```
MONGODB_URI="mongodb://localhost:27017/hobbee"
```

**Imports**
Now you need to import various data into your database via the following script


```
npm run import
```




## Testing Premium - Using Paypal sandbox for hobb.ee


For our Paypal Integration we are uing the Paypal Sandbox.
If you want to test this integration you can follow the "Buy Premium" steps after you logged in and enter the following Paypal Customer Credentials:

```
CustomerAccount:
   Login: sb-4347ask6835997@personal.example.com
   Pass: 8emswG&w
```


Happy testing!

# <img src="https://hobb.ee/static/media/hobbee_white.7e5bc008.svg" height="75" alt="logo">