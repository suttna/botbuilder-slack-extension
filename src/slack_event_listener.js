import crypto from 'crypto'

export class SlackEventListener {
  constructor (connector, lookupBot) {
    this.connector = connector
    this.lookupBot = lookupBot
  }

  start () {
    return (req, res, next) => {
      if (req.body.type === 'url_verification') {
        res.end(req.body.challenge)
        next()
      } else {
        const body = req.body
        const team = body.team_id
        const channel = body.event.channel.id || body.event.channel

        this.lookupBot(team).then((bot) => {
          const botbuilderEvent = this.buildBotbuilderEvent({ bot, team, channel, event: body.event })

          this.connector.onDispatchEvents([botbuilderEvent], (error, body, status) => {
            if (!error && status === 202) {
              res.end(req.body.challenge)
            } else {
              res.end(body)
            }

            next()
          })
        })
        .catch((error) => {
          res.send(error)
        })
      }
    }
  }

  buildBotbuilderEvent ({ bot, team, channel, event }) {
    return {
      type: 'conversationUpdate',
      text: '',
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
        channelId: 'slack',
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
        serviceUrl: 'https://slack.botframework.com'
      },
      source: 'slack',
      agent: 'suttna-slack-extension',
      user: {
        id: bot.id
      }
    }
  }
}

const random = (len) => {
  return crypto
    .randomBytes(Math.ceil(len / 2))
    .toString('hex')
    .slice(0, len).toUpperCase()
}
