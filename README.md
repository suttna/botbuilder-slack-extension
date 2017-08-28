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
var restify = require('restify')
var builder = require('botbuilder')
var SlackEventListener = require('botbuilder-slack-extension')

var connector = new builder.ChatConnector()
var bot = new builder.UniversalBot(connector)

// SlackEventListener take two arguments, the chat connector and a lookup function for your bot.
// The lookup function must return a promise with an object that conforms to IIdentity
var slackEventListener = new SlackEventListener(connector, function (teamId) {
  return new Promise(function (resolve, reject) {
    // This is you custom get function
    const bot = getBot(teamId)

    return { id: bot.id, name: bot.name }
  })
})

// Start listenting for botbuilder events
server.post('/bot', dependencies.botConnector.listen())

// Start listenting for direct slack events
server.post('/your-slack-path-for-events', slackEventListener.webhooksHandler())

// Start listenting for slack commands
server.post('/your-slack-path-for-commands', slackEventListener.commandsHandler())
```

## Contact

- Martín Ferández <martin@suttna.com>
- Santiago Doldán <santiago@suttna.com>
