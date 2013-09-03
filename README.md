Darklight Nova Web
==================
Score tracking tools for Darklight Nova Core

This is a Node.js app with two purposes:

1. API for [ScoreBoard](https://github.com/darklight-studios/ScoreBoard)
2. Web frontend to display the scores reported with the API

To see the API spec just go to the ScoreBoard repo, it's in the readme.

## Admin Instructions
**In DBTools.js change username and password in the URI to your credentials (username:password@blahblahrestofURI)**

Unfourtunately there is no admin panel, so creating sessions must be done manually. The easiest way to do this is
with a utility function I wrote, in RandUtils.js.

To do anything of the things below, follow these steps **first**:

1. Clone the repo `git clone https://github.com/darklight-studios/darklight-nova-web.git`
2. Navigate to the root of the repo
3. Make sure you have all the npm dependencies `npm install`
4. Make sure you set your credentials in DBTools.js
5. Open a node console with `node`

### Create A Session

Now you have two options, you can either create a session, or you can create a session and "initialize" it with
some teams. This is not necessary, however, because teams are created when they hit the auth API endpoint.

To create a session with no teams:
```javascript
require('./RandUtils').createSession('session_name', 'session_description', new Date())
```
With teams:
```javascript
require('./RandUtils').createSession('session_name', 'session_description', new Date(), ['team one', 'team two', 'etc'])
```

### Delete A Session
**Note** that deleting a session also deletes **all** subsequent teams and issues

```javascript
require('./RandUtils').removeSession('session_name')
````