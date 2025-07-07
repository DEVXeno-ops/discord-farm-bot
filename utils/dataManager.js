const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/users.json');

class DataManager {
  constructor() {
    this.users = {};
    this.load();
  }

  load() {
    if (fs.existsSync(DATA_PATH)) {
      const raw = fs.readFileSync(DATA_PATH, 'utf8');
      this.users = JSON.parse(raw);
    }
  }

  save() {
    fs.writeFileSync(DATA_PATH, JSON.stringify(this.users, null, 2));
  }

  getUserData(userId) {
    if (!this.users[userId]) {
      this.users[userId] = {
        money: 100,
        inventory: 0,
        plots: 3,
        plants: [],
      };
      this.save();
    }
    return this.users[userId];
  }

  updateUserData(userId, newData) {
    this.users[userId] = newData;
    this.save();
  }

  getAllUsers() {
    return this.users;
  }
}

module.exports = new DataManager();
