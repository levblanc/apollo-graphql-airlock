import { RESTDataSource } from '@apollo/datasource-rest';

class AccountsAPI extends RESTDataSource {
  override baseURL?: string = 'http://localhost:4011/';

  async login(username) {
    return this.get(`login/${username}`);
  }

  async updateUser({ userId, userInfo }) {
    return this.patch(`user/${userId}`, { body: { ...userInfo } });
  }

  async getUser(userId) {
    return this.get(`user/${userId}`);
  }
}

export default AccountsAPI;
