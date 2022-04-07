const { MessageEmbed } = require('discord.js');
const channelManager = require('./channelManager');
const { generate } = require('./log');

module.exports = {
    msg: null,
    thread: null,
    newThread: false,
    init(msg) {
        this.msg = msg;
    },
    async handle() {
        global.db.serialize(async () => {
            this.newThread = false;
            let threadChannel = null;
            
            let date = new Date();
            
            await global.db.get("SELECT * FROM threads WHERE user_id = ? AND status = 1", [this.msg.author.id], async (err, row) => {
                if (err) {
                    console.log('Query failed: dm.js: ' + err);
                }

                console.log(row);

                if (typeof row === 'undefined') {
                    threadChannel = await channelManager.createThread(this.msg);

                    await global.db.get("INSERT INTO threads(user, user_id, date, channel_id) VALUES(?, ?, ?, ?)", [this.msg.author.tag, this.msg.author.id, date.toISOString(), threadChannel.id], err => {
                        if (err) {
                            console.log('Query failed: dm.js: ' + err);
                        }

                        this.newThread = true;
                    });
                }

                await global.db.get("SELECT * FROM threads ORDER BY id DESC LIMIT 0, 1", (err, row) => {
                    if (err) {
                        console.log('Query failed: dm.js: ' + err);
                    }
    
                    this.thread = row;
                });
            });

            var tm = setInterval(() => {
                if (this.thread != null) {
                    clearInterval(tm);
                    global.db.get("INSERT INTO replies(content, user, user_id, date, thread_id, msg_id) VALUES(?, ?, ?, ?, ?, ?)", [this.msg.content, this.msg.author.tag, this.msg.author.id, date.toISOString(), this.thread.id, this.msg.id], err => {
                        global.db.get("SELECT * FROM replies ORDER BY id DESC LIMIT 0, 1", async (err, data2) => {
                            if (err) {
                                console.log('Query failed: dm.js');
                            }
                            else {
                                this.msg.reply({
                                    embeds: [
                                        (new MessageEmbed())
                                        .setColor('#007bff')
                                        .setTitle(this.newThread ? "New thread created" : "Message sent")
                                        .setDescription((this.newThread ? "A new thread was created with your message!" : "Your message was sent successfully!") + " One of the staff group members will get you in touch soon!")
                                        .setTimestamp()
                                        .setFooter({
                                            text: this.newThread ? 'Created' : 'Sent',
                                        })
                                    ]
                                });
    
                                if (global.config.props.logging_channel !== '-' || global.config.props.channel_category !== '-') {
                                    global.db.get('SELECT * FROM threads ORDER BY id DESC LIMIT 0, 1', async (err, data) => {
                                        const channel = global.client.channels.cache.find(ch => ch.id === global.config.props.logging_channel.trim());
        
                                        if (typeof channel !== 'undefined') {
                                            let e = (new MessageEmbed())
                                                    .setColor('#007bff')
                                                    .setTitle(this.newThread ? "New thread" : "Incoming message")
                                                    .setDescription((this.newThread ? "A new thread was created." : "") + "\n\n" + this.msg.content)
                                                    .addField("User", this.msg.author.tag)
                                                    .addField("Thread ID", data.id + "")
                                                    .addField("Message ID", data2.id + "")
                                                    .setTimestamp()
                                                    .setFooter({
                                                        text: this.newThread ? 'Created' : 'Sent',
                                                    });
        
                                            let obj = {
                                                embeds: [
                                                    e
                                                ]
                                            };

                                            generate(obj);

                                            await channel.send(obj);
                                        }

                                        if (this.newThread) {
                                            await threadChannel.send({
                                                embeds: [
                                                    (new MessageEmbed())
                                                    .setColor('#007bff')
                                                    .setTitle("New Thread")
                                                    .setDescription('This is the start of the thread conversation. Use `-rt <message>` to send a message.')
                                                    .setAuthor({name: this.msg.author.tag})
                                                    .addField("Thread ID", data.id + "")
                                                    .setFooter({text: 'Created'})
                                                    .setTimestamp()
                                                ]
                                            });

                                            await threadChannel.send({
                                                embeds: [
                                                    (new MessageEmbed())
                                                    .setColor('#007bff')
                                                    .setTitle("Message Recieved")
                                                    .setDescription(data2.content)
                                                    .setAuthor({name: this.msg.author.tag})
                                                    .setFooter({text: 'Received'})
                                                    .addField("Thread ID", data.id + "")
                                                    .addField("Message ID", data2.id + "")
                                                    .setTimestamp()
                                                ]
                                            });
                                        }
                                        else {
                                            threadChannel = await channelManager.findThreadChannelCategoryInDM(data.channel_id);

                                            await threadChannel.send({
                                                embeds: [
                                                    (new MessageEmbed())
                                                    .setColor('#007bff')
                                                    .setTitle("Message Recieved")
                                                    .setDescription(data2.content)
                                                    .setAuthor({name: this.msg.author.tag})
                                                    .setFooter({text: 'Received'})
                                                    .addField("Thread ID", data.id + "")
                                                    .addField("Message ID", data2.id + "")
                                                    .setTimestamp()
                                                ]
                                            });
                                        }
                                    });
                                }
                            }
    
                            this.thread = null;
                        });
                    });
                }
            }, 700);
        });
    }
};

/*
 * client.users.fetch('487904509670337509', false).then((user) => {
 user.send('hello world');
});
 */