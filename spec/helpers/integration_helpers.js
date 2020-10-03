const mongoose = require('mongoose');

module.exports = {
    nukeDatabase: async () => {
        const collections = await mongoose.connection.db.collections();
        collections.forEach(async collection => {
            await collection.deleteMany();
        })
    }
}