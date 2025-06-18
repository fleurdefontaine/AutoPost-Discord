const { accountModals, selectAccount } = require('../utils/menuBuilder');
const { getAllAccounts, addAccount, editAccount, getPostState, getAccount } = require('../utils/database');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { MessageFlags } = require('discord.js');

const postIntervals = new Map();

const autoPost = async (account, interaction = null) => {
    try {
        const response = await fetch(`https://discord.com/api/v10/channels/${account.channelId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `${account.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: account.message })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error(`Auto-post error for channel ${account.channelId}:`, error);
            if (interaction) {
                await interaction.followUp({ 
                    content: `Error posting to channel ${account.channelId}: ${error}`, 
                    flags: MessageFlags.Ephemeral 
                });
            }
            return false;
        }

        return true;
    } catch (error) {
        console.error(`Auto-post error for channel ${account.channelId}:`, error);
        if (interaction) {
            await interaction.followUp({ 
                content: `Error posting to channel ${account.channelId}: ${error.message}`, 
                flags: MessageFlags.Ephemeral 
            });
        }
        return false;
    }
};

const toggleAutoPost = async (token, account, interaction) => {
    const isActive = postIntervals.has(token);
    
    if (isActive) {
        clearInterval(postIntervals.get(token));
        postIntervals.delete(token);
        await getPostState(token, false);
        return interaction.reply({ content: '✅ Auto-post stopped!', flags: MessageFlags.Ephemeral });
    }

    await interaction.reply({ content: '🔄 Testing post before starting...', flags: MessageFlags.Ephemeral });
    const success = await autoPost(account, interaction);
    
    if (!success) {
        return interaction.followUp({ 
            content: '❌ Auto-post not started due to test failure. Please check the token and channel ID.', 
            flags: MessageFlags.Ephemeral 
        });
    }

    postIntervals.set(token, setInterval(() => autoPost(account), account.delay));
    await getPostState(token, true);
    return interaction.followUp({ 
        content: `✅ Auto-post started! Messages will be sent every ${account.delay / 1000} seconds.`, 
        flags: MessageFlags.Ephemeral 
    });
};

const handleModal = async (interaction) => {
    try {
        const fields = ['token', 'message', 'channelId', 'delay'].reduce((acc, field) => {
            acc[field] = field === 'delay' 
                ? parseInt(interaction.fields.getTextInputValue(field))
                : interaction.fields.getTextInputValue(field);
            return acc;
        }, {});

        const isEdit = interaction.customId === 'edit_account_modal';
        
        if (!fields.token || !fields.message || !fields.channelId || !fields.delay) {
            return interaction.reply({ 
                content: '❌ Semua field harus diisi!', 
                flags: MessageFlags.Ephemeral 
            });
        }

        if (fields.delay < 1000) {
            return interaction.reply({ 
                content: '❌ Delay minimal 1000ms (1 detik)!', 
                flags: MessageFlags.Ephemeral 
            });
        }

        let result;
        if (isEdit) {
            const existingAccount = await getAccount(fields.token);
            if (!existingAccount) {
                return interaction.reply({ 
                    content: '❌ Account tidak ditemukan!', 
                    flags: MessageFlags.Ephemeral 
                });
            }
            result = await editAccount(fields.token, {
                ...fields,
                isPosting: existingAccount.isPosting
            });
        } else {
            result = await addAccount(fields);
        }

        if (result.success) {
            return interaction.reply({ 
                content: `✅ Account berhasil ${isEdit ? 'diupdate' : 'ditambahkan'}!`,
                flags: MessageFlags.Ephemeral 
            });
        } else {
            console.error('Database operation error:', result.error);
            return interaction.reply({ 
                content: `❌ Error ${isEdit ? 'mengupdate' : 'menambahkan'} account: ${result.error}`,
                flags: MessageFlags.Ephemeral 
            });
        }
    } catch (error) {
        console.error('Modal handling error:', error);
        return interaction.reply({ 
            content: '❌ Terjadi error saat memproses data!', 
            flags: MessageFlags.Ephemeral 
        });
    }
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