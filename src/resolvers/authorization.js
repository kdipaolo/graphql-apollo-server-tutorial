import { ForbiddenError } from 'apollo-server'
import { skip, combineResolvers } from 'graphql-resolvers'

const message = 'Not authenticated as user.'

export const isAuthenticated = (parent, args, context) =>
  context.me ? skip : new ForbiddenError(message)

export const isMessageOwner = async (parent, args, context) => {
  const message = await context.models.Message.findById(
    { id: args.id },
    { raw: true }
  )
  if (message.userId !== context.me.id) {
    throw new ForbiddenError('Not authenticated as owner.')
  }

  return skip
}

export const isAdmin = combineResolvers(
  isAuthenticated,
  (parent, args, context) =>
    context.me.role === 'ADMIN'
      ? skip
      : new ForbiddenError('Not authorized as admin')
)
