![Logo](logo.png)

# botbuilder-slack-extension [![npm version](https://badge.fury.io/js/botbuilder-slack-extension.svg)](https://badge.fury.io/js/botbuilder-slack-extension) [![CircleCI](https://circleci.com/gh/suttna/botbuilder-slack-extension.svg?style=svg)](https://circleci.com/gh/suttna/botbuilder-slack-extension)

Slack extension for Microsoft BotBuilder.

This extension will listen for missing (in BotBuilder slack connector) events.

The following events are allowed and need to be configured in slack:

> Note: You need to manually add the events in this page: https://api.slack.com/apps/:APP_ID/event-subscriptions

## conversationUpdate

- channel_archive
- channel_created
- channel_deleted
- channel_rename
- channel_unarchive
- group_archive
- group_rename
- group_unarchive

## installationUpdate

- app_uninstalled

## slackCommand

You can listen for slack commands. Commands will be sent as custom events with type `slackCommand`. Event
information will be sent under `sourceEvent => SlackMessage`.

## Install

```
yarn add botbuilder-slack-extension
```

After that change events subscription url on slack: https://api.slack.com/apps/_APP_ID_/event-subscriptions.

## Usage

The extension will listen for the previously listed slack events and forward them as `conversationUpdate` events.

This means you can use:

```javascript
 bot.on('event', function(event) {
  // Handle event here
 })

 bot.on('slackCommand', function(event) {
  // If you want to use slack commands
 })
```

To configure the extension you simply need to create a listener and hook it in your restify server.

```javascript
let restify = require('restify');
let builder = require('botbuilder');
let SlackEventListener = require('botbuilder-slack-extension');

let connector = new builder.ChatConnector();
let bot = new builder.UniversalBot(connector);

// SlackEventListener take two arguments, the chat connector and a lookup function for your bot.
// The lookup function must return a promise with an object that conforms to IIdentity
let slackEventListener = new SlackEventListener(connector, (teamId) => {
  return new Promise((resolve, reject) => {
    // This is you custom get function, which you need to implement yourself
    const bot = getBot(teamId);

    return { id: bot.id, name: bot.name };
  })
})

let server = restify.createServer();
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log("%s listening to %s", server.name, server.url);
});

// Start listenting for botbuilder events
server.post("/", connector.listen());

// Start listenting for direct slack events
server.post('/your-slack-path-for-events', slackEventListener.webhooksHandler());

bot.on('channel_created', (event) => {
  console.log('channel was created');
});

// Start listenting for slack commands
server.post('/your-slack-path-for-commands', slackEventListener.commandsHandler());

bot.on('slackCommand', (event) => {
  // If you want to use slack commands
})
```

## Contribution
1. Install globally `typescript`, `@types/node`, `ts-lint`
2. Use ts-lint to remove warnings
3. Write proper pull request descriptions