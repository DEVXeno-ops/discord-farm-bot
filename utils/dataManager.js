const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/users.json');

class DataManager {
  constructor() {
    this.users = {};
    this.load();
  }

  // โหลดข้อมูลจากไฟล์ JSON
  load() {
    if (fs.existsSync(DATA_PATH)) {
      try {
        const raw = fs.readFileSync(DATA_PATH, 'utf8');
        this.users = JSON.parse(raw);
      } catch (error) {
        console.error('❌ โหลด users.json ไม่สำเร็จ:', error);
        this.users = {};
        this.save(); // สร้างใหม่ถ้าไฟล์เสีย
      }
    }
  }

  // บันทึกข้อมูลลงไฟล์
  save() {
    try {
      fs.writeFileSync(DATA_PATH, JSON.stringify(this.users, null, 2));
    } catch (error) {
      console.error('❌ บันทึก users.json ไม่สำเร็จ:', error);
    }
  }

  // คืนข้อมูลของผู้ใช้ หากยังไม่มีจะสร้างใหม่
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
    return structuredClone(this.users[userId]); // clone ปลอดภัย
  }

  // อัปเดตข้อมูลของผู้ใช้
  updateUserData(userId, newData) {
    this.users[userId] = newData;
    this.save();
  }

  // คืนข้อมูลผู้ใช้ทั้งหมด
  getAllUsers() {
    return structuredClone(this.users);
  }

  // เพิ่มเงินให้ผู้ใช้
  addMoney(userId, amount) {
    const data = this.getUserData(userId);
    data.money = (data.money || 0) + amount;
    this.updateUserData(userId, data);
  }

  // เพิ่มของในคลังให้ผู้ใช้
  addInventory(userId, amount) {
    const data = this.getUserData(userId);
    data.inventory = (data.inventory || 0) + amount;
    this.updateUserData(userId, data);
  }

  // เพิ่ม XP และจัดการเลเวลอัปอัตโนมัติ
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
