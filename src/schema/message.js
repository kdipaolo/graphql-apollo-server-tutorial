import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    messages(cursor: String, limit: Int): [Message!]!
    message(id: ID!): Message!
  }

  extend type Mutation {
    createMessage(text: String!): Message!
    deleteMessage(id: ID!): Boolean!
  }

  type Message {
    id: ID!
    text: String!
    user: User!
    createdAt: String!
  }

  extend type Subscription {
    messageCreated: MessageCreated!
  }

  type MessageCreated {
    message: Message!
  }
`
