# Heroku issues
1 - Connecting sql database in heroku,
Error: self signed certificate in certificate chain.
Depth 0 issue
NODE_TLS_REJECT_UNAUTHORIZED = 0
https://stackoverflow.com/questions/45088006/nodejs-error-self-signed-certificate-in-certificate-chain


# Postgres issue connecting Heroku with Typeorm

The most common case you described is to have separate entities directory which consists only of Entity declarations.
Having typeorm settings in code instead of ormconfig.json.
typeorm: [
{
    name: "default",
    synchronize: true,
    type: "postgres",
    url: process.env.DATABASE_URL || config.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? true : false,  // If env var is not set then it is dev
    "entities": [ 
    `${__dirname}/**/*.entity.js`
    ],
    "migrations": [`${__dirname}/migrations/**/*.js`],
    subscribers: [
    `${__dirname}/subscriber/*.js}`
    ]
}
]

It has to be JS not TS because it will run the transpiled version.

Another approach would be importing each entity separately:

import {User} from "./payment/entity/User";
import {Post} from "./blog/entity/Post";

{
...
"entities": [User, Post]
}

This is the most reliable.

# IMPORTANT

If you are having issues because it says that you entity is not a module, it is because the entity is not being recognize. DONT USE:
src/...
dist/...
And also dont use
.ts
Use exactly as the example above. That will place you in the directory where the file it is and from there you can find files by specifing the path as above.

# IMPORTANT
If you have both, ormconfig.json and the config inside the app it will use the config inside the app and not the json version.

# Migrations
If you use syncronize you dont have migrations, it is automatic. It is recomended to use migrations to be able to go back and forth between db changes. With syncronize it will sync the db every time you ran de app and you cannot go back, unless you switch the code again or something like that. For dev purpose syncronize it may be ok.

