import { expect } from 'chai'
import * as userApi from './api'

describe('users', () => {
  describe('user(id: String!): User', () => {
    it('returns a user when user can be found', async () => {
      const expected = {
        data: {
          user: {
            id: '2',
            username: 'user: ddavids',
            email: 'hello@david.com',
            role: null
          }
        }
      }
      const result = await userApi.user({ id: '2' })

      expect(result.data).to.eql(expected)
    })
    it('returns null when user cannot be found', async () => {
      const expected = {
        data: {
          user: null
        }
      }
      const result = await userApi.user({ id: '42' })
      expect(result.data).to.eql(expected)
    })
    it('User gets a token when they sign in', async () => {
      const result = await userApi.signIn({
        login: 'ddavids',
        password: 'ddavids'
      })
      expect(result.data.data.signIn.token).to.be.an('string')
    })
    it('Tries to delete a user but shows not authenticated error', async () => {
      const result = await userApi.deleteUser(
        {
          id: '2'
        },
        ''
      )

      expect(result.data.errors[0].message).to.eql('Not authenticated as user.')
    })
    it('returns an error because only admins can delete a user', async () => {
      const signIn = await userApi.signIn({
        login: 'ddavids',
        password: 'ddavids'
      })
      const token = signIn.data.data.signIn.token
      const deleteUser = await userApi.deleteUser({ id: '1' }, token)

      expect(deleteUser.data.errors[0].message).to.eql(
        'Not authorized as admin'
      )
    })
  })
})
