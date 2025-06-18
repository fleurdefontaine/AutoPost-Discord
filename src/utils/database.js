const mongoose = require('mongoose');
const Account = require('../schema/acccount');
require('dotenv').config();

async function connectToDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
}

async function addAccount(data) {
    try {
        const account = new Account(data);
        await account.save();
        return { success: true, account };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function editAccount(token, newData) {
    try {
        const account = await Account.findOneAndUpdate(
            { token },
            newData,
            { new: true }
        );
        return { success: true, account };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function getAllAccounts() {
    try {
        return await Account.find();
    } catch (error) {
        console.error('Error fetching accounts:', error);
        return [];
    }
}

async function getPostState(token, isPost) {
    try {
        await Account.findOneAndUpdate(
            { token },
            { isPost }
        );
        return true;
    } catch (error) {
        console.error('Error updating Auto Post state:', error);
        return false;
    }
}

async function getAccount(token) {
    try {
        return await Account.findOne({ token });
    } catch (error) {
        console.error('Error fetching account:', error);
        return null;
    }
}

module.exports = { connectToDatabase, addAccount, editAccount, getAllAccounts, getPostState, getAccount };