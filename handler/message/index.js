const { decryptMedia } = require('@open-wa/wa-decrypt')
const { color } = require('../../util')
const moment = require('moment-timezone')
const appRoot = require('app-root-path')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const db_group = new FileSync(appRoot+'/data/database.json')
const db = low(db_group)

moment.tz.setDefault('Asia/Jakarta').locale('id')
db.defaults({ data: [], admin: [] }).write()

module.exports = msgHandler = async (client, message) => {
    try {
        const { type, id, from, t, sender, isGroupMsg, chat, caption, mentionedJidList } = message
        let { body } = message
        const { name, formattedTitle } = chat
        let { pushname, verifiedName, formattedName } = sender
        pushname = pushname || verifiedName || formattedName // verifiedName is the name of someone who uses a business account
        if (pushname == undefined || pushname.trim() == '') console.log(sender)
        const botNumber = await client.getHostNumber() + '@c.us'
        const groupId = isGroupMsg ? chat.groupMetadata.id : ''
        const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId) : ''
        const pengirim = sender.id
        const isGroupAdmins = groupAdmins.includes(sender.id) || false
        const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
        const ownerNumber = '6281237270808@c.us'
        const isAdminbot = sender.id === ownerNumber

        const prefix = '/'
        body = (type === 'chat' && body.startsWith(prefix)) ? body : ((type === 'image' && caption) && caption.startsWith(prefix)) ? caption : ''
        const command = body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase()
        const commands = caption || body || ''
        const argz = commands.split(' ')
        const args = body.slice(prefix.length).trim().split(/ +/).slice(1)
        const isCmd = body.startsWith(prefix)

        //Find Data Group
        const caridata = db.get('data').find({ id: groupId }).value()
        const cariadmin = db.get('data').find({ adminid: sender.id }).value()

        //Default List
        const plPUBG = 'Maaf pricelist PUBG Mobile belum tersedia'
        const plFF = 'Maaf pricelist Free Fire belum tersedia'
        const plML = 'Maaf pricelist Mobile Legends belum tersedia'
        const lPAY = 'Maaf Payment belum di setting di grup ini'
        const lFORM = 'Maaf Format pembayaran belum di setting di group ini'
        const lMENU = `_(Ini merupakan Command default, kamu dapat menggantinya)_\nexample:\n/ff (Untuk menampilkan list FF)\n/ml (Untuk menampilkan list ML)\n/pubg (Untuk menampilkan list PUBG)\n_Note: gunakan *${prefix}update-menu* untuk menggantinya_`
        
        const fckadmin = 'Maaf, perintah ini hanya dapat digunakan Oleh Admin yang sudah terdaftar!'
        const sorry = 'Maaf Group kamu belum Terdaftar oleh Admin BOT'

        //DEFAULT CUSTOM COMMANDS
        
        if(cariadmin) {
            //ini merupakan fitur premium (silahkan contact Ahda untuk menggunakan fitur ini)
        } else if(caridata && caridata.id === groupId) {
            //DM me on instagram : https://instagram.com/yaelahda
        }
        //LOG Prefix In Terminal
        if (isCmd && !isGroupMsg) { console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname)) }
        if (isCmd && isGroupMsg) { console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle)) }
        switch (command) {
            //ALL & GROUP COMMANDS
            case 'regist':
            case 'daftar':
                if (!isGroupMsg) return client.reply(from, 'Maaf, perintah ini hanya dapat digunakan didalam grup!', id)
                if (!isGroupAdmins) return client.reply(from, 'Maaf, perintah ini hanya dapat digunakan oleh Admin Group!', id)
                if (!isAdminbot) return client.reply(from, fckadmin, id)
                if(caridata && caridata.id === groupId){
                        await client.reply(from, `Groub ini telah ditambahkan ke Database sebelumnya`, id)
                } else {
                    db.get('data').push({ id: groupId, nama: name, adminid: pengirim, ff: plFF, pubg: plPUBG, ml: plML, pay: lPAY, menu: lMENU, format: lFORM }).write()
                    await client.reply(from, `Sukses menambahkan Grub ke Database`, id)
                }
                break  
            case 'close':
                if (!isGroupMsg) return client.reply(from, 'Maaf, perintah ini hanya dapat digunakan didalam grup!', id)
                if (!isAdminbot) return client.reply(from, fckadmin, id)
                if (!isBotGroupAdmins) return client.reply(from, 'Perintah ini hanya bisa di gunakan ketika bot menjadi admin', id)
                const close = 
                'Group Berhasil diclose, _Hanya admin yang dapat mengirim pesan_'
                client.setGroupToAdminsOnly(groupId, true)
                await client.sendText(from, close, id)
                break
            case 'open':
                if (!isGroupMsg) return client.reply(from, 'Maaf, perintah ini hanya dapat digunakan didalam grup!', id)
                if (!isAdminbot) return client.reply(from, fckadmin, id)
                if (!isBotGroupAdmins) return client.reply(from, 'Perintah ini hanya bisa di gunakan ketika bot menjadi admin', id)
                const open = 
                'Group Berhasil dibuka'
                client.setGroupToAdminsOnly(groupId, false)
                await client.sendText(from, open, id)
                break
            case 'about':
                const about = 
                '*ABOUT*\n\n'+
                'Bot ini dikembangkan oleh *AHDA* menggunakan *NODEJS*\n'+
                'Jika kamu berminat menyewa BOT Admin, silahkan hubungi:\n'+
                'WA : 081237270808\nDirect: wa.me/6281237270808\n'+
                'IG : https://instagram.com/yaelahda';
                await client.reply(from, about, id)
                break    
            case 'menu':
                if (caridata && caridata.id === groupId) {
                    const listmenu = 
                    `Halo *${pushname}*, Berikut ini adalah daftar menu diGroup *${name}*:\n`+
                    `${caridata.menu}`;
                    client.reply(from, listmenu, id)
                } else if (cariadmin) {
                    const listmenuadmin = 
                    `Halo *${pushname}*, Berikut adalah menu yang dapat kamu gunakan di Group *${cariadmin.nama}*:\n\n`+
                    '_*Commands untuk mengganti isi data pada menu kamu*_\n'+
                    '/update-menu\n/update-ff\n/update-ml\n/update-pubg\n/update-format\n/update-payment\n\n'+
                    '_*Commands untuk menampilkan status command di grup kamu*_\n'+
                    '/status\n\n'+
                    '_*Note*_\n'+
                    'Default Commands tidak dapat diubah\n_list default commands_\n'+
                    '/menu\n/ff\n/ml\n/pubg\n/payment\n/format\n/announcement'
                    client.reply(from, listmenuadmin, id)
                } else if (isGroupMsg === false) {
                    const menuperson = 
                    `Halo *${pushname}*, Terimakasih telah menghubungi Admin BOT\n`+
                    'Bot ini dikembangkan oleh *AHDA* menggunakan bahasa Pemrograman *NODEJS*\n'+
                    'Bot Ini sangat cocok untuk kamu yang mempunyai Group Jualan, Jasa Topup, Reseller dll. untuk menampilkan list harga di Groupmu.\n\n'+
                    'Untuk contoh botnya silahkan join https://chat.whatsapp.com/LwiyU0cr26dCXyMOEllvov\n\n'+
                    'Jika kamu berminat menyewa BOT Admin, silahkan hubungi:\n'+
                    'WA : 081237270808\nDirect: wa.me/6281237270808\n'+
                    'IG : https://instagram.com/yaelahda\n\n'+
                    'Untuk Biaya Sewa BOT adalah *25k/bulan*';
                    client.sendText(from, menuperson)
                } else {
                    client.reply(from, 'Maaf Group ini belum Terdaftar oleh Admin BOT\n\nsilahkan ketik: /daftar', id)
                }
                break
            case 'payment':
            case 'pay':
                if(isGroupMsg){
                    if(caridata && caridata.id === groupId) {
                        await client.sendFile(from, `./data/picture/qrismu.png`, 'qris.png', caridata.pay, id)
                    } else if(caridata && caridata.id === groupId) {
                        await client.reply(from, caridata.pay, id)
                    } else {
                        await client.reply(from, sorry, id)
                    }
                } else if (cariadmin) {
                    await client.reply(from, cariadmin.pay, id)
                } else {
                    await client.sendText(from, "Hanya dapat dilakukan dalam Grup.")
                }
                break
            case 'format':
                if(isGroupMsg){
                    if(caridata && caridata.id === groupId) {
                        await client.reply(from, caridata.format, id)
                    } else {
                        await client.reply(from, sorry, id)
                    }
                } else if (cariadmin) {
                    await client.reply(from, cariadmin.format, id)
                } else {
                    await client.sendText(from, "Hanya dapat dilakukan dalam Grup.")
                }
                break
            case 'ff':
                if(isGroupMsg){
                    if(caridata && caridata.id === groupId) {
                        await client.reply(from, caridata.ff, id)
                    } else {
                        await client.reply(from, sorry, id)
                    }
                } else if (cariadmin) {
                    await client.reply(from, cariadmin.ff, id)
                } else {
                    await client.sendText(from, "Hanya dapat dilakukan dalam Grup.")
                }
                break
            case 'ml':
                if(isGroupMsg){
                    if(caridata && caridata.id === groupId) {
                        await client.reply(from, caridata.ml, id)
                    }  else {
                        await client.reply(from, sorry, id)
                    }
                } else if (cariadmin) {
                    await client.reply(from, cariadmin.ml, id)
                } else {
                    await client.sendText(from, "Hanya dapat dilakukan dalam Grup.")
                }
                break
            case 'pubg':
            case 'pubgm':
                if(isGroupMsg){
                    if(caridata && caridata.id === groupId) {
                        await client.reply(from, caridata.pubg, id)
                    } else {
                        await client.reply(from, sorry, id)
                    }
                } else if (cariadmin) {
                    await client.reply(from, cariadmin.pubg, id)
                } else {
                    await client.sendText(from, "Hanya dapat dilakukan dalam Grup.")
                }
                break
                
            //ADMIN UPDATE COMMANDS
            case 'update-menu':
                if (!isAdminbot) return client.reply(from, fckadmin, id)
                const updatemenu = body.slice(13)
                if(caridata && caridata.id === groupId){
                    if (isGroupAdmins) {
                        if (argz.length === 1) return client.reply(from, `untuk mengupdate listdata menu, kirim perintah\n*${prefix}update-menu [Text kamu]*`, id)
                        db.get('data').find({id: groupId}).unset('menu').write()
                        await db.get('data').find({id: groupId}).assign({ menu: updatemenu }).write()
                        await client.reply(from, "Sukses mengupdate Menu", id)
                    } else {
                        client.reply(from,'Maaf kamu bukan admin di group ini', id)
                    }
                } else if (cariadmin && cariadmin.adminid === sender.id){
                    if (argz.length === 1) return client.reply(from, `untuk mengupdate listdata menu, kirim perintah\n*${prefix}update-menu [Text kamu]*`, id)
                    db.get('data').find({adminid: pengirim}).unset('menu').write()
                    await db.get('data').find({adminid: pengirim}).assign({ menu: updatemenu }).write()
                    await client.reply(from, `Sukses mengupdate Menu di *${cariadmin.nama}*`, id)
                }else {
                    await client.reply(from, sorry, id)
                }
                break
            case 'update-format':
                if (!isAdminbot) return client.reply(from, fckadmin, id)
                const updateformat = body.slice(15)
                if(caridata && caridata.id === groupId){
                    if (isGroupAdmins) {
                        if (argz.length === 1) return client.reply(from, `untuk mengupdate listdata Format, kirim perintah\n*${prefix}update-format [Text kamu]*`, id)
                        db.get('data').find({id: groupId}).unset('format').write()
                        await db.get('data').find({id: groupId}).assign({ format: updateformat }).write()
                        await client.reply(from, "Sukses mengupdate data Format", id)
                    } else {
                        client.reply(from,'Maaf kamu bukan admin di group ini', id)
                    }
                } else if (cariadmin && cariadmin.adminid === sender.id){
                    if (argz.length === 1) return client.reply(from, `untuk mengupdate listdata Format, kirim perintah\n*${prefix}update-format [Text kamu]*`, id)
                    db.get('data').find({adminid: pengirim}).unset('format').write()
                    await db.get('data').find({adminid: pengirim}).assign({ format: updateformat }).write()
                    await client.reply(from, `Sukses mengupdate data Format di *${cariadmin.nama}*`, id)
                }else {
                    await client.reply(from, sorry, id)
                }
                break
            case 'update-payment':
                if (!isAdminbot) return client.reply(from, fckadmin, id)
                const updatepayment = body.slice(16)
                if(caridata && caridata.id === groupId){
                    if (isGroupAdmins) {
                        if (argz.length === 1) return client.reply(from, `untuk mengupdate listdata Payment, kirim perintah\n*${prefix}update-payment [Text kamu]*`, id)
                        db.get('data').find({id: groupId}).unset('pay').write()
                        await db.get('data').find({id: groupId}).assign({ pay: updatepayment }).write()
                        await client.reply(from, "Sukses mengupdate data Payment", id)
                    } else {
                        client.reply(from,'Maaf kamu bukan admin di group ini', id)
                    }
                } else if (cariadmin && cariadmin.adminid === sender.id){
                    if (argz.length === 1) return client.reply(from, `untuk mengupdate listdata Payment, kirim perintah\n*${prefix}update-payment [Text kamu]*`, id)
                    db.get('data').find({adminid: pengirim}).unset('pay').write()
                    await db.get('data').find({adminid: pengirim}).assign({ pay: updatepayment }).write()
                    await client.reply(from, `Sukses mengupdate data Payment di *${cariadmin.nama}*`, id)
                }else {
                    await client.reply(from, sorry, id)
                }
                break
            case 'update-ff':
                if (!isAdminbot) return client.reply(from, fckadmin, id)
                const updatedataff = body.slice(11)
                if(caridata && caridata.id === groupId){
                    if (isGroupAdmins) {
                        if (argz.length === 1) return client.reply(from, `untuk mengupdate listdata Pricelist FreeFire, kirim perintah\n*${prefix}update-ff [Text kamu]*`, id)
                        db.get('data').find({id: groupId}).unset('ff').write()
                        await db.get('data').find({id: groupId}).assign({ ff: updatedataff }).write()
                        await client.reply(from, "Sukses mengupdate listdata FreeFire", id)
                    } else {
                        client.reply(from,'Maaf kamu bukan admin di group ini', id)
                    }
                } else if (cariadmin && cariadmin.adminid === sender.id){
                    if (argz.length === 1) return client.reply(from, `untuk mengupdate listdata Pricelist FreeFire, kirim perintah\n*${prefix}update-ff [Text kamu]*`, id)
                    db.get('data').find({adminid: pengirim}).unset('ff').write()
                    await db.get('data').find({adminid: pengirim}).assign({ ff: updatedataff }).write()
                    await client.reply(from, `Sukses mengupdate listdata FreeFire di *${cariadmin.nama}*`, id)
                }else {
                    await client.reply(from, sorry, id)
                }
                break
            case 'update-ml':
                if (!isAdminbot) return client.reply(from, fckadmin, id)
                const updatedataml = body.slice(11)
                if(caridata && caridata.id === groupId){
                    if (isGroupAdmins) {
                        if (argz.length === 1) return client.reply(from, `untuk mengupdate listdata Pricelist Mobile Legends, kirim perintah\n*${prefix}update-ml [Text kamu]*`, id)
                        db.get('data').find({id: groupId}).unset('ml').write()
                        await db.get('data').find({id: groupId}).assign({ ml: updatedataml }).write()
                        await client.reply(from, "Sukses mengupdate listdata Mobile Legends", id)
                    } else {
                        client.reply(from,'Maaf kamu bukan admin di group ini', id)
                    }
                } else if (cariadmin && cariadmin.adminid === sender.id){
                    if (argz.length === 1) return client.reply(from, `untuk mengupdate listdata Pricelist Mobile Legends, kirim perintah\n*${prefix}update-ml [Text kamu]*`, id)
                    db.get('data').find({adminid: pengirim}).unset('ml').write()
                    await db.get('data').find({adminid: pengirim}).assign({ ml: updatedataml }).write()
                    await client.reply(from, `Sukses mengupdate listdata Mobile Legends di *${cariadmin.nama}*`, id)
                }else {
                    await client.reply(from, sorry, id)
                }
                break
            case 'update-pubg':
                if (!isAdminbot) return client.reply(from, fckadmin, id)
                const updatedatapubg = body.slice(13)
                if(caridata && caridata.id === groupId){
                    if (isGroupAdmins) {
                        if (argz.length === 1) return client.reply(from, `untuk mengupdate listdata Pricelist PUBG Mobile, kirim perintah\n*${prefix}update-pubg [Text kamu]*`, id)
                        db.get('data').find({id: groupId}).unset('pubg').write()
                        await db.get('data').find({id: groupId}).assign({ pubg: updatedatapubg }).write()
                        await client.reply(from, "Sukses mengupdate listdata PUBG Mobile", id)
                    } else {
                        client.reply(from,'Maaf kamu bukan admin di group ini', id)
                    }
                } else if (cariadmin && cariadmin.adminid === sender.id){
                    if (argz.length === 1) return client.reply(from, `untuk mengupdate listdata Pricelist PUBG Mobile, kirim perintah\n*${prefix}update-pubg [Text kamu]*`, id)
                    db.get('data').find({adminid: pengirim}).unset('pubg').write()
                    await db.get('data').find({adminid: pengirim}).assign({ pubg: updatedatapubg }).write()
                    await client.reply(from, `Sukses mengupdate listdata PUBG Mobile di *${cariadmin.nama}*`, id)
                }else {
                    await client.reply(from, sorry, id)
                }
                break
            default:
                break
        }
    } catch (err) {
        console.log(color('[ERROR]', 'red'), err)
    }
}
