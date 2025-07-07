const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', 'data', 'users.json');

let cache = null;
let saving = false;
let saveQueued = false;

// โหลดข้อมูลจากไฟล์ หรือคืนค่า object ว่าง
function loadData() {
  if (cache) return cache;
  try {
    if (!fs.existsSync(dataFilePath)) {
      cache = {};
      return cache;
    }
    const raw = fs.readFileSync(dataFilePath, 'utf8');
    cache = JSON.parse(raw);
    return cache;
  } catch {
    cache = {};
    return cache;
  }
}

// บันทึกข้อมูลลงไฟล์ (queue เพื่อป้องกันเขียนซ้อน)
function saveData(data) {
  cache = data;
  if (saving) {
    saveQueued = true;
    return;
  }
  saving = true;
  fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), (err) => {
    saving = false;
    if (err) console.error('Failed to save data:', err);
    if (saveQueued) {
      saveQueued = false;
      saveData(cache);
    }
  });
}

// ดึงข้อมูลผู้ใช้ หรือสร้างข้อมูลเริ่มต้นถ้ายังไม่มี
function getUserData(userId) {
  const data = loadData();
  if (!data[userId]) {
    data[userId] = {
      plants: [],
      inventory: 0,
      money: 100,
      upgradeLevel: 1,
      xp: 0,
      level: 1,
      plots: 1,
      lastPlantTime: 0
    };
    saveData(data);
  }
  return data[userId];
}

// อัปเดตข้อมูลผู้ใช้และบันทึก
function updateUserData(userId, newData) {
  const data = loadData();
  data[userId] = { ...data[userId], ...newData };
  saveData(data);
}

module.exports = {
  loadData,
  saveData,
  getUserData,
  updateUserData,
};
