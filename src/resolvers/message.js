import uuidv4 from 'uuid/v4'
import { combineResolvers } from 'graphql-resolvers'
import { isAuthenticated, isMessageOwner } from './authorization'
import pubsub, { EVENTS } from '../subscription'

export default {
  Query: {
    messages: async (parent, args, context) => {
      console.log(await context.models.Message.findAll())
      return await context.models.Message.findAll({
        order: [['createdAt', 'DESC']],
        limit: args.limit || 100,
        where: args.cursor
          ? {
              createdAt: {
                [Sequelize.Op.lt]: args.cursor
              }
            }
          : null
      })
    },
    message: async (parent, { id }, context) => {
      return await context.models.Message.findById(id)
    }
  },
  Mutation: {
    createMessage: combineResolvers(
      isAuthenticated,
      async (parent, args, context) => {
        try {
          const message = await context.models.Message.create({
            text: args.text,
            userId: context.me.id
          })
          pubsub.publish(EVENTS.MESSAGE.CREATED, {
            messageCreated: { message }
          })
          return message
        } catch (error) {
          throw new Error(error)
        }
      }
    ),
    deleteMessage: combineResolvers(
      isAuthenticated,
      isMessageOwner,
      async (parent, args, context) => {
        return await context.models.Message.destroy({ where: { id: args.id } })
      }
    )
  },
  Message: {
    user: async (parent, args, context) => {
      return await context.loaders.user.load(parent.message.userId)
    }
  },
  Subscription: {
    messageCreated: {
      subscribe: () => pubsub.asyncIterator(EVENTS.MESSAGE.CREATED)
    }
  }
}
