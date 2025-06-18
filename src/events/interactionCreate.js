const { accountModals, selectAccount } = require('../utils/menuBuilder');
const { getAllAccounts, addAccount, editAccount, getPostState, getAccount } = require('../utils/database');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { MessageFlags } = require('discord.js');

const postIntervals = new Map();

const autoPost = async (account) => {
    try {
        await fetch(`https://discord.com/api/v10/channels/${account.channelId}/messages`, {
            method: 'POST',
            headers: { 'Authorization': account.token, 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: account.message })
        });
    } catch (error) {
        console.error('Auto-post error:', error);
    }
};

const toggleAutoPost = async (token, account, interaction) => {
    const isActive = postIntervals.has(token);
    
    if (isActive) {
        clearInterval(postIntervals.get(token));
        postIntervals.delete(token);
        await getPostState(token, false);
        return interaction.reply({ content: 'Auto-post stopped!', flags: MessageFlags.Ephemeral });
    }
    
    postIntervals.set(token, setInterval(() => autoPost(account), account.delay));
    await getPostState(token, true);
    return interaction.reply({ content: 'Auto-post started!', flags: MessageFlags.Ephemeral });
};

const handleModal = async (interaction) => {
    const fields = ['token', 'message', 'channelId', 'delay'].reduce((acc, field) => {
        acc[field] = field === 'delay' 
            ? parseInt(interaction.fields.getTextInputValue(field))
            : interaction.fields.getTextInputValue(field);
        return acc;
    }, {});

    const isEdit = interaction.customId === 'edit_account_modal';
    const result = isEdit 
        ? await editAccount(fields.token, fields)
        : await addAccount(fields);

    const message = result.success 
        ? `Account ${isEdit ? 'updated' : 'added'} successfully!`
        : `Error ${isEdit ? 'updating' : 'adding'} account: ${result.error}`;

    return interaction.reply({ content: message, flags: MessageFlags.Ephemeral });
};

const menuHandlers = {
    add_account: (interaction) => interaction.showModal(accountModals(false)),
    
    edit_account: async (interaction) => {
        const accounts = await getAllAccounts();
        return accounts.length === 0
            ? interaction.reply({ content: 'No accounts found!', flags: MessageFlags.Ephemeral })
            : interaction.reply({ components: [selectAccount(accounts, 'edit')], flags: MessageFlags.Ephemeral });
    },
    
    toggle_post: async (interaction) => {
        const accounts = await getAllAccounts();
        return interaction.reply({
            content: 'Select an account to toggle auto-post:',
            components: [selectAccount(accounts, 'toggle')],
            flags: MessageFlags.Ephemeral
        });
    }
};

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'main_menu') {
                return menuHandlers[interaction.values[0]]?.(interaction);
            }
            
            if (interaction.customId === 'account_select_edit') {
                const account = await getAccount(interaction.values[0]);
                if (!account) {
                    return interaction.reply({ content: 'Account not found!', flags: MessageFlags.Ephemeral });
                }
                const modal = accountModals(true);
                modal.components.forEach(row => {
                    const component = row.components[0];
                    component.setValue(account[component.data.custom_id].toString());
                });
                return interaction.showModal(modal);
            }
            
            if (interaction.customId === 'account_select_toggle') {
                const account = await getAccount(interaction.values[0]);
                return account 
                    ? toggleAutoPost(interaction.values[0], account, interaction)
                    : interaction.reply({ content: 'Account not found!', flags: MessageFlags.Ephemeral });
            }
        }
        
        if (interaction.isModalSubmit()) {
            return handleModal(interaction);
        }
    }
};