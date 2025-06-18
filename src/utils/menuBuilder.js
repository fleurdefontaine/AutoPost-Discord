const {  StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');

function initMessage(client, totalAccounts = 0) {
    const startTime = Math.floor(Date.now() / 1000 - client.uptime / 1000);
    return new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Auto Post Discord by Rvnaa')
        .setDescription(`🕒 **Uptime:** <t:${startTime}:R>\n👥 **Total Accounts:** ${totalAccounts}`)
        .setTimestamp();
}

function createMain() {
    const select = new StringSelectMenuBuilder()
        .setCustomId('main_menu')
        .setPlaceholder('Select an option')
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('Edit Account')
                .setValue('edit_account')
                .setDescription('Edit existing account settings'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Add Account')
                .setValue('add_account')
                .setDescription('Add a new account'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Start / Stop Auto Post')
                .setValue('toggle_post')
                .setDescription('Start or stop auto posting')
        );

    return new ActionRowBuilder().addComponents(select);
}

function selectAccount(accounts, purpose = 'edit') {
    const select = new StringSelectMenuBuilder()
        .setCustomId(`account_select_${purpose}`)
        .setPlaceholder('Select an account to edit');

    accounts.forEach(account => {
        select.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel(`Account: ${account.channelId}`)
                .setValue(account.token)
                .setDescription(`Message: ${account.message.substring(0, 50)}...`)
        );
    });

    return new ActionRowBuilder().addComponents(select);
}

function accountModals(isEdit = false) {
    const modal = new ModalBuilder()
        .setCustomId(isEdit ? 'edit_account_modal' : 'add_account_modal')
        .setTitle(isEdit ? 'Edit Account' : 'Add New Account');

    const tokenInput = new TextInputBuilder()
        .setCustomId('token')
        .setLabel('Token')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const messageInput = new TextInputBuilder()
        .setCustomId('message')
        .setLabel('Message')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    const channelInput = new TextInputBuilder()
        .setCustomId('channelId')
        .setLabel('Channel ID')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const delayInput = new TextInputBuilder()
        .setCustomId('delay')
        .setLabel('Delay (ms)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const rows = [
        new ActionRowBuilder().addComponents(tokenInput),
        new ActionRowBuilder().addComponents(messageInput),
        new ActionRowBuilder().addComponents(channelInput),
        new ActionRowBuilder().addComponents(delayInput)
    ];

    modal.addComponents(rows);
    return modal;
}

module.exports = { initMessage, createMain, selectAccount, accountModals };