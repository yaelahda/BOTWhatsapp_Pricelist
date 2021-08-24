const { create, Client } = require('@open-wa/wa-automate')
const { color } = require('./util')
const msgHandler = require('./handler/message')
const options = require('./util/options')


const start = (client = new Client()) => {
            console.log('[DEV]', color('Yaelahda', 'yellow'))
            console.log('[CLIENT] CLIENT Started!')

            // Force it to keep the current session
            client.onStateChanged((state) => {
                console.log('[Client State]', state)
                if (state === 'CONFLICT' || state === 'UNLAUNCHED') client.forceRefocus()
            })

            // listening on message
            client.onMessage((message) => {
                // Message Handler
                msgHandler(client, message)
            })

            // listen group invitation
            client.onAddedToGroup(({ groupMetadata: { id }, contact: { name } }) =>
                client.getGroupMembersId(id)
                    .then((ids) => {
                        console.log('[CLIENT]', color(`Invited to Group. [ ${name} : ${ids.length}]`, 'yellow'))
                    }))
                    
            client.onGlobalParticipantsChanged(async (event) => {
        const host = await client.getHostNumber() + '@c.us'
        const gChat = await client.getChatById(event.chat)
        const { name } = gChat
        // kondisi ketika seseorang diinvite/join group lewat link
        if (event.action === 'add' && event.who !== host) {
            await client.sendTextWithMentions(event.chat, `Hello @${event.who.replace('@c.us', '')} 👋, Selamat datang di group *${name}*\n\nUntuk Menampilkan Menu di Grup ini silahkan ketik /menu`)
        }
        // kondisi ketika seseorang dikick/keluar dari group
        if (event.action === 'remove' && event.who !== host) {
            await client.sendTextWithMentions(event.chat, `Selamat tinggal @${event.who.replace('@c.us', '')}, Semoga harimu menyenangkan✨`)
        }
    })
}

create(options(true, start))
    .then((client) => start(client))
    .catch((err) => new Error(err))
