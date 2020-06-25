![Node.js CI](https://github.com/samgoldman/VirtualHand/workflows/Node.js%20CI/badge.svg?branch=master)
[![codecov](https://codecov.io/gh/samgoldman/VirtualHand/branch/master/graph/badge.svg)](https://codecov.io/gh/samgoldman/VirtualHand)

# VirtualHand

Warning! This branch will auto-deploy to the overland server every night at midnight!

## Environmental Variables Required to Run:
- ADMIN_INITIAL_PASSWORD : The initial password for the administrator account (currently unused)
- JWT_SECRET : the secret for jsonwebtoken (random string)
- MONGODB_URI : URI to the MongodDB
- SESSION_SECRET : the secret used for sessions (random string)
- VH_EMAIL : The email address for automated emails
- VH_EMAIL_PASSWORD : the email address password
- VH_ENV : if set to 'DEVELOPMENT', routing will compile Pug files each time so server doesn't have to be restarted when messing with views

Talk to Sam about using existing values for the database and emails.
