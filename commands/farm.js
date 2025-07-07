const { sendFarmWithAutoUpdate } = require('../utils/farmUpdater');

module.exports = {
  data: {
    name: 'farm',
    description: 'แสดงฟาร์มของคุณ',
  },
  async execute(interaction, dataManager) {
    await sendFarmWithAutoUpdate(interaction, dataManager);
  },
};
