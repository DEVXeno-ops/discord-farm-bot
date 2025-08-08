const fs = require('fs').promises;
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/users.json');

class DataManager {
  constructor() {
    this.users = {};
    this.load();
  }

  async load() {
    try {
      const raw = await fs.readFile(DATA_PATH, 'utf8');
      this.users = JSON.parse(raw);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // ไฟล์ยังไม่มี สร้างไฟล์เปล่าใหม่
        this.users = {};
        await this.save();
      } else {
        console.error('❌ โหลด users.json ไม่สำเร็จ:', error);
        this.users = {};
        await this.save();
      }
    }
  }

  async save() {
    try {
      await fs.writeFile(DATA_PATH, JSON.stringify(this.users, null, 2), 'utf8');
    } catch (error) {
      console.error('❌ บันทึก users.json ไม่สำเร็จ:', error);
    }
  }

  getUserData(userId) {
    if (!userId) throw new Error('userId ต้องไม่ว่าง');
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
      this.save(); // ไม่ต้อง await เพื่อไม่ให้ block
    }
    return structuredClone(this.users[userId]);
  }

  async updateUserData(userId, newData) {
    if (!userId) throw new Error('userId ต้องไม่ว่าง');
    if (typeof newData !== 'object' || newData === null) {
      throw new Error('newData ต้องเป็น object');
    }
    this.users[userId] = newData;
    await this.save();
  }

  getAllUsers() {
    return structuredClone(this.users);
  }

  addMoney(userId, amount) {
    const data = this.getUserData(userId);
    data.money = (data.money || 0) + amount;
    this.updateUserData(userId, data);
  }

  addInventory(userId, amount) {
    const data = this.getUserData(userId);
    data.inventory = (data.inventory || 0) + amount;
    this.updateUserData(userId, data);
  }

  addXP(userId, amount) {
    const data = this.getUserData(userId);
    data.xp = (data.xp || 0) + amount;

    let leveledUp = false;
    while (data.xp >= data.level * 100) {
      data.xp -= data.level * 100;
      data.level += 1;
      leveledUp = true;
    }

    this.updateUserData(userId, data);
    return leveledUp;
  }
}

module.exports = new DataManager();
