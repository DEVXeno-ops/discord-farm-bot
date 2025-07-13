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
      try {
        const raw = fs.readFileSync(DATA_PATH, 'utf8');
        this.users = JSON.parse(raw);
      } catch (error) {
        console.error('Error loading users.json:', error);
        this.users = {};
        this.save(); // สร้างไฟล์ใหม่ถ้าไฟล์เดิมเสียหาย
      }
    }
  }

  save() {
    try {
      fs.writeFileSync(DATA_PATH, JSON.stringify(this.users, null, 2));
    } catch (error) {
      console.error('Error saving users.json:', error);
    }
  }

  getUserData(userId) {
    if (!this.users[userId]) {
      this.users[userId] = {
        money: 100,
        inventory: 0,
        plots: 3,
        plants: [],
        level: 1,
        xp: 0,
        upgradeLevel: 0,
      };
      this.save();
    }
    // คืนค่า deep copy ป้องกันแก้ไขข้อมูลโดยตรงนอกคลาส
    return JSON.parse(JSON.stringify(this.users[userId]));
  }

  updateUserData(userId, newData) {
    this.users[userId] = newData;
    this.save();
  }

  getAllUsers() {
    // คืนค่า deep copy เพื่อป้องกันแก้ไขข้อมูลภายนอก
    return JSON.parse(JSON.stringify(this.users));
  }
}

module.exports = new DataManager();
