import jwt from 'jsonwebtoken'
import { AuthenticationError, UserInputError } from 'apollo-server'
import { combineResolvers } from 'graphql-resolvers/lib/combineResolvers'
import { isAdmin } from './authorization'

const createToken = async (user, secret, expiresIn) => {
  const { id, email, username, role } = user

  return await jwt.sign({ id, email, username, role }, secret, { expiresIn })
}

export default {
  Query: {
    me: async (parent, args, context) => {
      if (!context.me) {
        return null
      }
      return await models.User.findById(context.me.id)
    },
    user: async (parent, args, context) => {
      return await context.models.User.findById(args.id)
    },
    users: async (parent, args, context) => {
      return await context.models.User.findAll()
    }
  },
  Mutation: {
    signUp: async (parent, args, context) => {
      const user = await context.models.User.create({
        username: args.username,
        email: args.email,
        password: args.password
      })

      return { token: createToken(user, context.secret, '30m') }
    },
    signIn: async (parent, args, context) => {
      const user = await context.models.User.findByLogin(args.login)
      if (!user) {
        throw new UserInputError('No user found with this login credentials.')
      }
      const isValid = await user.validatePassword(args.password)
      return { token: createToken(user, context.secret, '30m') }
    },
    deleteUser: combineResolvers(isAdmin, async (parent, args, context) => {
      return await confirm.models.User.destroy({
        where: { id: args.id }
      })
    })
  },
  User: {
    username: parent => {
      return `user: ${parent.username}`
    },
    messages: async (parent, args, context) => {
      return await context.models.Message.findAll({
        where: {
          userId: parent.id
        }
      })
    }
  }
}
