````markdown
# Discord Farm Bot

Discord Farm Bot เป็นบอทสำหรับเล่นเกมฟาร์มใน Discord ให้ผู้เล่นปลูกพืช เก็บเกี่ยว และจัดการฟาร์มของตัวเองผ่านคำสั่ง Slash Command

---

## คุณสมบัติหลัก

- ปลูกพืชหลายชนิด พร้อมระยะเวลาเติบโตแตกต่างกัน  
- เก็บเกี่ยวพืชที่โตแล้ว รับรางวัลเป็นเงินและไอเท็ม  
- ระบบคลังเก็บของและเงินในเกม  
- ฟีเจอร์อัปเดตสถานะฟาร์มอัตโนมัติและแจ้งเตือนผู้เล่นเมื่อพืชโตเต็มที่  
- ร้านค้าอัปเกรดพื้นที่ปลูกและฟาร์ม  
- รองรับการแจ้งเตือนผ่าน Direct Message  

---

## วิธีติดตั้งและใช้งาน

### 1. เตรียมเครื่องมือและสิ่งที่ต้องมี

- [Node.js](https://nodejs.org/) เวอร์ชัน 16 ขึ้นไป  
- บัญชี Discord และสร้าง Discord Application พร้อม Bot Token  
- สร้างไฟล์ `.env` ในโฟลเดอร์โปรเจกต์  

### 2. ตั้งค่า `.env`

```env
TOKEN=YOUR_BOT_TOKEN
CLIENT_ID=YOUR_APPLICATION_CLIENT_ID
GUILD_ID=YOUR_TEST_GUILD_ID  # (ถ้าลงทะเบียนคำสั่งแบบ Guild commands)
READY_CHANNEL_ID=YOUR_CHANNEL_ID  # (ถ้าต้องการให้บอทแจ้งเตือนตอนพร้อมใช้งาน)
````

### 3. ติดตั้ง dependencies

```bash
npm install
```

### 4. ลงทะเบียนคำสั่ง Slash Command

```bash
node deploy-commands.js
```

> **หมายเหตุ:**
>
> * หากใช้แบบ Global commands อาจใช้เวลารออัปเดตนาน (สูงสุด 1 ชั่วโมง)
> * แนะนำใช้ Guild commands เพื่อทดสอบรวดเร็ว (ต้องตั้งค่า `GUILD_ID` ใน `.env`)

### 5. รันบอท

```bash
node index.js
```

---

## โครงสร้างไฟล์สำคัญ

```
.
├── commands/           # โฟลเดอร์คำสั่ง Slash commands (plant.js, harvest.js, profile.js ฯลฯ)
├── data/               # ข้อมูลพืชและข้อมูลผู้เล่น (plants.js, users.json)
├── utils/              # ฟังก์ชันช่วยเหลือ (dataManager.js, notifyWhenGrown.js, farmUpdater.js)
├── deploy-commands.js  # สคริปต์ลงทะเบียนคำสั่ง
├── index.js            # ไฟล์เริ่มต้นบอทหลัก
├── .env                # ไฟล์เก็บ Token และ Config ส่วนตัว
└── README.md           # ไฟล์นี้
```

---

## การพัฒนาและแก้ไข

* เพิ่มพืชชนิดใหม่ได้โดยแก้ไขไฟล์ `data/plants.js`
* ปรับแต่งระบบเงิน และค่าต่าง ๆ ใน `utils/dataManager.js`
* เพิ่มคำสั่งใหม่โดยสร้างไฟล์ในโฟลเดอร์ `commands/` ตามรูปแบบ Slash Command

---

## ติดต่อและขอความช่วยเหลือ

หากพบปัญหาหรือมีคำถาม สามารถเปิด Issue หรือ Pull Request ใน GitHub ได้ทันที

---

## สัญญาอนุญาต (License)

MIT License © 2025 Xeno

---

> *ขอบคุณที่ใช้ Discord Farm Bot! ขอให้สนุกกับการปลูกพืชและเก็บเกี่ยวในฟาร์มของคุณ :)*

```

---