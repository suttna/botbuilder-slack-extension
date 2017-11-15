import crypto from "crypto";

const CONVERSATION_UPDATE_EVENTS = [
  "channel_archive",
  "channel_created",
  "channel_deleted",
  "channel_rename",
  "channel_unarchive",
  "group_archive",
  "group_rename",
  "group_unarchive"
];

const INSTALLATION_UPDATE_EVENTS = [
  "app_uninstalled"
];

export class SlackEventListener {
  public connector: any;
  public lookupBot: any;

  constructor(connector, lookupBot) {
    this.connector = connector;
    this.lookupBot = lookupBot;
  }

  public webhooksHandler() {
    return (req, res, next) => {
      if (req.body.type === "url_verification") {
        res.end(req.body.challenge);
        next();
      } else {
        const body = req.body;
        const team = body.team_id;

        this.lookupBot(team).then((bot) => {
          const botbuilderEvent = this.buildBotbuilderEvent({ bot, team, event: body.event });

          this.connector.onDispatchEvents([botbuilderEvent], (error, body, status) => {
            if (!error && status === 202) {
              res.end(req.body.challenge);
            } else {
              res.end(body);
            }

            next();
          });
        }).catch((error) => {
          res.send(error);
        });
      }
    };
  }

  public commandsHandler() {
    return (req, res, next) => {
      const body = req.params;
      const team = body.team_id;

      this.lookupBot(team).then((bot) => {
        const botbuilderEvent = this.buildCommandEvent({ bot, team, commandEvent: body });

        this.connector.onDispatchEvents([botbuilderEvent], (error, body, status) => {
          if (!error && status === 202) {
            res.end(req.body.challenge);
          } else {
            res.end(body);
          }

          next();
        });
      }).catch((error) => {
        res.send(error);
      });
    };
  }

  public buildCommandEvent({ bot, team, commandEvent }) {
    return {
      type: "slackCommand",
      text: "",
      attachments: [],
      entities: [],
      sourceEvent: {
        SlackMessage: {
          team,
          ...commandEvent
        }
      },
      address: {
        id: random(32),
        channelId: "slack",
        user: {
          id: `${commandEvent.user_id}:${team}`,
          name: commandEvent.user_name
        },
        conversation: {
          isGroup: false,
          id: `${bot.id}:${commandEvent.channel_id}`
        },
        bot: {
          id: bot.id
        },
        serviceUrl: "https://slack.botframework.com"
      },
      source: "slack",
      agent: "suttna-slack-extension",
      user: {
        id: bot.id
      }
    };
  }

  public buildBotbuilderEvent({ bot, team, event }) {
    if (CONVERSATION_UPDATE_EVENTS.includes(event.type)) {
      return this.buildConversationUpdateEvent({ bot, team, event });
    } else if (INSTALLATION_UPDATE_EVENTS.includes(event.type)) {
      return this.buildInstallationUpdateEvent({ bot, team, event });
    } else {
      throw new Error(`Unknown slack event type ${event.type}`);
    }
  }

  public buildInstallationUpdateEvent({ bot, team, event }) {
    return {
      type: "installationUpdate",
      text: "",
      attachments: [],
      entities: [],
      sourceEvent: {
        SlackMessage: {
          team,
          ...event
        }
      },
      address: {
        id: random(32),
        channelId: "slack",
        user: {
          id: bot.id
        },
        conversation: {
          isGroup: false,
          id: bot.id
        },
        bot: {
          id: bot.id
        },
        serviceUrl: "https://slack.botframework.com"
      },
      source: "slack",
      agent: "suttna-slack-extension",
      user: {
        id: bot.id
      }
    };
  }

  public buildConversationUpdateEvent({ bot, team, event }) {
    const channel = event.channel.id || event.channel;

    return {
      type: "conversationUpdate",
      text: "",
      attachments: [],
      entities: [],
      sourceEvent: {
        SlackMessage: {
          team,
          ...event
        }
      },
      address: {
        id: random(32),
        channelId: "slack",
        user: {
          id: bot.id
        },
        conversation: {
          isGroup: true,
          id: `${bot.id}:${channel}`
        },
        bot: {
          id: bot.id
        },
        serviceUrl: "https://slack.botframework.com"
      },
      source: "slack",
      agent: "suttna-slack-extension",
      user: {
        id: bot.id
      }
    };
  }
}

const random = (len) => {
  return crypto
    .randomBytes(Math.ceil(len / 2))
    .toString("hex")
    .slice(0, len).toUpperCase();
};