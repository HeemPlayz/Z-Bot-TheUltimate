const Discord = require('discord.js');
const client = new Discord.Client();
const client3 = new Discord.Client();
const convert = require("hh-mm-ss")
const dateFormat = require('dateformat');
const fs = require('fs');
const pretty = require('pretty-ms');
const rn = require('random-number');
const userData = JSON.parse(fs.readFileSync('./userData.json', 'utf8'));
const moment = require('moment');
var Canvas = require('canvas')
const games = JSON.parse(fs.readFileSync('./games.json', "utf8"))
var jimp = require('jimp')
const dataPro = JSON.parse(fs.readFileSync('./walls.json', 'utf8'));
const prefix = "p#";
let done = {};
client.login(process.env.BOT_TOKEN)
client3.login(process.env.BOT_TOKEN)


const ytdl = require("ytdl-core");
const { Client, Util } = require('discord.js');
const getYoutubeID = require('get-youtube-id');
const fetchVideoInfo = require('youtube-info');
const YouTube = require('simple-youtube-api');
const youtube = new YouTube("AIzaSyAdORXg7UZUo7sePv97JyoDqtQVi3Ll0b8");
const queue = new Map();
/*
البكجآت
npm install discord.js
npm install ytdl-core
npm install get-youtube-id
npm install youtube-info
npm install simple-youtube-api
npm install queue
*/

client3.on('ready', () => {
    console.log(`Logged in as ${client3.user.tag}!`);
    console.log(`in ${client3.guilds.size} servers `)
    console.log(`[ ] ${client3.users.size}`)
    client3.user.setStatus("idle")
});
client3.on('ready', () => {
     client3.user.setActivity("you",{type: 'WATCHING'});

});

client3.on('message', async msg => {
  if (msg.author.bot) return undefined;
  if (!msg.content.startsWith(prefix)) return undefined;
  const args = msg.content.split(' ');
  const searchString = args.slice(1).join(' ');
  const url = args[1] ? args[1] .replace(/<(.+)>/g, '$1') : '';
  const serverQueue = queue.get(msg.guild.id);
  let command = msg.content.toLowerCase().split(" ")[0];
  command = command.slice(prefix.length)
  if (command === `play`) {
    const voiceChannel = msg.member.voiceChannel;
    if (!voiceChannel) return msg.channel.send('يجب توآجد حضرتك بروم صوتي .');
    const permissions = voiceChannel.permissionsFor(msg.client3.user);
    if (!permissions.has('CONNECT')) {
      return msg.channel.send('لا يتوآجد لدي صلاحية للتكلم بهذآ الروم');
    }
    if (!permissions.has('SPEAK')) {
      return msg.channel.send('لا يتوآجد لدي صلاحية للتكلم بهذآ الروم');
    }

    if (!permissions.has('EMBED_LINKS')) {
      return msg.channel.sendMessage("**يجب توآفر برمشن `EMBED LINKS`لدي **rl")
      }

    if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
      const playlist = await youtube.getPlaylist(url);
      const videos = await playlist.getVideos();
      for (const video of Object.values(videos)) {
        const video2 = await youtube.getVideoByID(video.id);
        await handleVideo(video2, msg, voiceChannel, true);
      }
      return msg.channel.send(` **${playlist.title}** تم الإضآفة إلى قأئمة التشغيل`);
    } else {
      try {

        var video = await youtube.getVideo(url);

      } catch (error) {
        try {
                          var fast = {};
          var videos = await youtube.searchVideos(searchString, 10);
          let index = 0;
          const embed1 = new Discord.RichEmbed()
              .setDescription(`**الرجآء من حضرتك إختيآر رقم المقطع** :
${videos.map(video2 => `[**${++index}**] **${video2.title}**`).join('\n')}`)
          .setFooter(`${msg.guild.name}`)
            .setThumbnail('https://e.top4top.net/p_1001lsv3w1.png')

          msg.channel.sendEmbed(embed1).then(message =>{

            message.delete(15000)

          });
          try {
            var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
              maxMatches: 1,
              time: 20000,
              errors: ['time']
            })

            }catch(err) {
            console.error(err);
            return msg.channel.send('لم يتم إختيآر مقطع صوتي');
            }
          const videoIndex = parseInt(response.first().content);
          var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
        } catch (err) {
          console.error(err);
          return msg.channel.send(':x: لا يتوفر نتآئج بحث ');
        }
    }

      return handleVideo(video, msg, voiceChannel);
    }
  } else if (command === `skip`) {
    if (!msg.member.voiceChannel) return msg.channel.send('أنت لست بروم صوتي .');
    if (!serverQueue) return msg.channel.send('لا يتوفر مقطع لتجآوزه');
    serverQueue.connection.dispatcher.end('تم تجآوز هذآ المقطع');
    return undefined;
  } else if (command === `stop`) {
    if (!msg.member.voiceChannel) return msg.channel.send('أنت لست بروم صوتي .');
    if (!serverQueue) return msg.channel.send('لا يتوفر مقطع لإيقآفه');
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end('تم إيقآف هذآ المقطع');
    return undefined;
  } else if (command === `vol`) {
    if (!msg.member.voiceChannel) return msg.channel.send('أنت لست بروم صوتي .');
    if (!serverQueue) return msg.channel.send('لا يوجد شيء شغآل.');
    if (!args[1]) return msg.channel.send(`:loud_sound: مستوى الصوت **${serverQueue.volume}**`);
    serverQueue.volume = args[1];
    serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 50);
    return msg.channel.send(`:speaker: تم تغير الصوت الي **${args[1]}**`);
  } else if (command === `np`) {
    if (!serverQueue) return msg.channel.send('لا يوجد شيء حالي ف العمل.');
    const embedNP = new Discord.RichEmbed()
  .setDescription(`:notes: الان يتم تشغيل : **${serverQueue.songs[0].title}**`)
    return msg.channel.sendEmbed(embedNP);
  } else if (command === `replay`) {
    if (!serverQueue) return msg.channel.send('لا يوجد شيء حالي ف العمل.');
    const embedNP = new Discord.RichEmbed()
  .setDescription(`سيتم اعاده تشغيل الفديو :**${serverQueue.songs[0].title}**`)
  msg.channel.send({embed: embedNP})
     return handleVideo(video, msg, msg.member.voiceChannel);

  } else if (command === `queue`) {
    if (!serverQueue) return msg.channel.send('لا يوجد شيء حالي ف العمل.');
    let index = 0;
    const embedqu = new Discord.RichEmbed()
.setDescription(`**Songs Queue**
${serverQueue.songs.map(song => `**${++index} -** ${song.title}`).join('\n')}
**الان يتم تشغيل** ${serverQueue.songs[0].title}`)
    return msg.channel.sendEmbed(embedqu);
  } else if (command === `pause`) {
    if (serverQueue && serverQueue.playing) {
      serverQueue.playing = false;
      serverQueue.connection.dispatcher.pause();
      return msg.channel.send('تم إيقاف الموسيقى مؤقتا!');
    }
    return msg.channel.send('لا يوجد شيء حالي ف العمل.');
  } else if (command === "resume") {
    if (serverQueue && !serverQueue.playing) {
      serverQueue.playing = true;
      serverQueue.connection.dispatcher.resume();
      return msg.channel.send('استأنفت الموسيقى بالنسبة لك !');
    }
    return msg.channel.send('لا يوجد شيء حالي في العمل.');
  }

  return undefined;
async function handleVideo(video, msg, voiceChannel, playlist = false) {
  const serverQueue = queue.get(msg.guild.id);
  const song = {
    id: video.id,
    title: Util.escapeMarkdown(video.title),
    url: `https://www.youtube.com/watch?v=${video.id}`,
    time:`${video.duration.hours}:${video.duration.minutes}:${video.duration.seconds}`,
    eyad:`${video.thumbnails.high.url}`,
    best:`${video.channel.title}`,
    bees:`${video.raw.snippet.publishedAt}`,
    shahd:`${video.raw.kind}`,
    zg:`${video.raw.snippet.channelId}`,
        views:`${video.raw.views}`,
        like:`${video.raw.likeCount}`,
        dislike:`${video.raw.dislikeCount}`,
        hi:`${video.raw.id}`
  };
  if (!serverQueue) {
    const queueConstruct = {
      textChannel: msg.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    };
    queue.set(msg.guild.id, queueConstruct);
    queueConstruct.songs.push(song);
    try {
      var connection = await voiceChannel.join();
      queueConstruct.connection = connection;
      play(msg.guild, queueConstruct.songs[0]);
    } catch (error) {
      console.error(`I could not join the voice channel: ${error}`);
      queue.delete(msg.guild.id);
      return msg.channel.send(`لا أستطيع دخول هذآ الروم ${error}`);
    }
  } else {
    serverQueue.songs.push(song);
    console.log(serverQueue.songs);
    if (playlist) return undefined;
    else return msg.channel.send(` **${song.title}** تم اضافه الاغنية الي القائمة!`);
  }
  return undefined;
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);

  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }
  console.log(serverQueue.songs);
  const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
    .on('end', reason => {
      if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
      else console.log(reason);
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on('error', error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    fetchVideoInfo(`${song.hi}`, function (err,  idk) {
  if (err) throw new Error(err);
  console.log( idk);
      const yyyy = {}
  if(!yyyy[msg.guild.id]) yyyy[msg.guild.id] = {
    like: `${ idk.likeCount}`,
    dislike: `${ idk.dislikeCount}`
  }
  serverQueue.textChannel.send({embed : new Discord.RichEmbed()
  .setTitle(`**${ idk.title}**`)
  .setURL( idk.url)
  .addField('Time The Video :' , `${song.time}`, true)
  .addField('Channel Name :' , `${song.best}`, true)
  .addField('Channel ID :' , `${song.zg}`, true)
  .addField('Video Created at :' , `${ idk.datePublished}`, true)
  .addField('Views :' , `${ idk.views}`, true)
  .addField('Like👍 :' , `${ idk.likeCount}`, true)
  .addField('dislike👎 :' , `${ idk.dislikeCount}`, true)
  .addField('comments :' , `${ idk.commentCount}`, true)
  .setImage(`${song.eyad}`)
  .setThumbnail('http://cdn.akhbaar24.com/430e061a-f89a-43c7-86d9-82fae5f7c495.jpg')
  .setColor('#ff0000')
  .setTimestamp()
  }).then(love => {
    love.react('👍').then(r=>{
    love.react('👎').then(r =>{
    love.react('🙌').then(r=> {
    let likee = (reaction, user) => reaction.emoji.name === '👍' && user.id === msg.author.id;
    let dislikee = (reaction, user) => reaction.emoji.name === '👎' && user.id === msg.author.id;
    let cnn = (reaction, user) => reaction.emoji.name === '🙌' && user.id === msg.author.id;

    let ll = love.createReactionCollector(likee , {max:5});
    let dd = love.createReactionCollector(dislikee , {max:5});
    let cn = love.createReactionCollector(cnn , {max:5});

        ll.on("collect", r => {
          yyyy[msg.guild.id].like++;
  love.edit({embed : new Discord.RichEmbed()
  .setTitle(`**${ idk.title}**`)
  .setURL( idk.url)
  .addField('Time The Video :' , `${song.time}`, true)
  .addField('Channel Name :' , `${song.best}`, true)
  .addField('Channel ID :' , `${song.zg}`, true)
  .addField('Video Created at :' , `${ idk.datePublished}`, true)
  .addField('Views :' , `${ idk.views}`, true)
  .addField('Like👍 :' , `${yyyy[msg.guild.id].like}`, true)
  .addField('dislike👎 :' , `${ idk.dislikeCount}`, true)
  .addField('comments :' , `${ idk.commentCount}`, true)
  .setImage(`${song.eyad}`)
  .setThumbnail('http://cdn.akhbaar24.com/430e061a-f89a-43c7-86d9-82fae5f7c495.jpg')
  .setColor('#ff0000')
  .setTimestamp()
});
    })

    dd.on("collect", r => {
      yyyy[msg.guild.id].dislike++;
  love.edit({embed : new Discord.RichEmbed()
  .setTitle(`**${ idk.title}**`)
  .setURL( idk.url)
  .addField('Time The Video :' , `${song.time}`, true)
  .addField('Channel Name :' , `${song.best}`, true)
  .addField('Channel ID :' , `${song.zg}`, true)
  .addField('Video Created at :' , `${ idk.datePublished}`, true)
  .addField('Views :' , `${ idk.views}`, true)
  .addField('Like👍 :' , `${ idk.likeCount}`, true)
  .addField('dislike👎 :' , `${yyyy[msg.guild.id].dislike}`, true)
  .addField('comments :' , `${ idk.commentCount}`, true)
  .setImage(`${song.eyad}`)
  .setThumbnail('http://cdn.akhbaar24.com/430e061a-f89a-43c7-86d9-82fae5f7c495.jpg')
  .setColor('#ff0000')
  .setTimestamp()
});
})
    cn.on("collect", r => {
  love.edit({embed : new Discord.RichEmbed()
  .setTitle(`**${ idk.title}**`)
  .setURL( idk.url)
  .addField('Time The Video :' , `${song.time}`, true)
  .addField('Channel Name :' , `${song.best}`, true)
  .addField('Channel ID :' , `${song.zg}`, true)
  .addField('Video Created at :' , `${ idk.datePublished}`, true)
  .addField('Views :' , `${ idk.views}`, true)
  .addField('Like👍 :' , `${ idk.likeCount}`, true)
  .addField('dislike👎 :' , `${ idk.dislikeCount}`, true)
  .addField('comments :' , `${ idk.commentCount}`, true)
  .setImage(`${song.eyad}`)
  .setThumbnail('http://cdn.akhbaar24.com/430e061a-f89a-43c7-86d9-82fae5f7c495.jpg')
  .setColor('#ff0000')
  .setTimestamp()
});
})
})
})
})
})
})
}
});
client.on('message', message => {
  if(message.content === prefix + 'colors') {
  if(!message.channel.guild) return message.channel.send('**This Commnad only For Servers !**'); 
let menu = new Discord.RichEmbed()
.setImage('https://b.top4top.net/p_1002p20mv1.png')
.setFooter('Colors Menu')
message.channel.sendEmbed(menu)


client.on('message', message => {
  if(message.content === prefix + 'createcolors') {
                       if(!message.channel.guild) return message.channel.send('**This Commnad only For Servers !**'); 
       if(!message.member.hasPermission('ADMINISTRATOR')) return    message.channel.send('**You Dont Have** `ADMINISTRATOR` **premission**').then(msg => msg.delete(6000))
    message.guild.createRole({
                name: "1",
                  color: "#FFB6C1",
                  permissions: []
   })
         message.guild.createRole({
                name: "2",
                  color: "#FFC0CB",
                  permissions: []
   })
              message.guild.createRole({
                name: "3",
                  color: "#FF69B4",
                  permissions: []
   })
                   message.guild.createRole({
                name: "4",
                  color: "#FF1493",
                  permissions: []
   })
                   message.guild.createRole({
                name: "5",
                  color: "#DB7093",
                  permissions: []
   })
                   message.guild.createRole({
                name: "6",
                  color: "#C71585",
                  permissions: []
   })
                   message.guild.createRole({
                name: "7",
                  color: "#E6E6FA",
                  permissions: []
   })
                   message.guild.createRole({
                name: "8",
                  color: "#D8BFD8",
                  permissions: []
   })
                   message.guild.createRole({
                name: "8",
                  color: "#DDA0DD",
                  permissions: []
   })
                   message.guild.createRole({
                name: "9",
                  color: "#DA70D6",
                  permissions: []
   })
                   message.guild.createRole({
                name: "10",
                  color: "#EE82EE",
                  permissions: []
   })
                   message.guild.createRole({
                name: "11",
                  color: "#FF00FF",
                  permissions: []
   })
                   message.guild.createRole({
                name: "12",
                  color: "#BA55D3",
                  permissions: []
   })
                   message.guild.createRole({
                name: "13",
                  color: "#9932CC",
                  permissions: []
   })
                        message.guild.createRole({
                name: "14",
                  color: "#9400D3",
                  permissions: []
   })
                        message.guild.createRole({
                name: "15",
                  color: "#8A2BE2",
                  permissions: []
   })
                             message.guild.createRole({
                name: "16",
                  color: "#8B008B",
                  permissions: []
   })
                                  message.guild.createRole({
                name: "17",
                  color: "#800080",
                  permissions: []
   })
                                  message.guild.createRole({
                name: "18",
                  color: "#9370DB",
                  permissions: []
   })
                                  message.guild.createRole({
                name: "19",
                  color: "#7B68EE",
                  permissions: []
   })
                                  message.guild.createRole({
                name: "20",
                  color: "#6A5ACD",
                  permissions: []
   })
                                  message.guild.createRole({
                name: "21",
                  color: "#483D8B",
                  permissions: []
   })
                                  message.guild.createRole({
                name: "22",
                  color: "#663399",
                  permissions: []
   })
                                  message.guild.createRole({
                name: "23",
                  color: "#4B0082",
                  permissions: []
   })
                                  message.guild.createRole({
                name: "24",
                  color: "#FFA07A",
                  permissions: []
   })
                                  message.guild.createRole({
                name: "25",
                  color: "#FA8072",
                  permissions: []
   })
                                  message.guild.createRole({
                name: "26",
                  color: "#E9967A",
                  permissions: []
   })
                                  message.guild.createRole({
                name: "27",
                  color: "#F08080",
                  permissions: []
   })
                                  message.guild.createRole({
                name: "28",
                  color: "#CD5C5C",
                  permissions: []
   })
                                  message.guild.createRole({
                name: "29",
                  color: "#DC143C",
                  permissions: []
   })
                                       message.guild.createRole({
                name: "30",
                  color: "	#FF0000",
                  permissions: []
   })
                                       message.guild.createRole({
                name: "31",
                  color: "#B22222",
                  permissions: []
   })
                                       message.guild.createRole({
                name: "32",
                  color: "#8B0000",
                  permissions: []
   })
                                       message.guild.createRole({
                name: "33",
                  color: "#FFA500",
                  permissions: []
   })
                                       message.guild.createRole({
                name: "34",
                  color: "#FF8C00",
                  permissions: []
   })
                                       message.guild.createRole({
                name: "35",
                  color: "#FF7F50",
                  permissions: []
   })
                                       message.guild.createRole({
                name: "36",
                  color: "#FF6347",
                  permissions: []
   })
                                       message.guild.createRole({
                name: "37",
                  color: "#FF4500",
                  permissions: []
   })
                                       message.guild.createRole({
                name: "38",
                  color: "#FFD700",
                  permissions: []
   })
                                       message.guild.createRole({
                name: "39",
                  color: "#FFFFE0",
                  permissions: []
   })
                                       message.guild.createRole({
                name: "40",
                  color: "#FFFACD",
                  permissions: []
   })
                                       message.guild.createRole({
                name: "41",
                  color: "#FAFAD2",
                  permissions: []
   })
                                       message.guild.createRole({
                name: "42",
                  color: "	#FFEFD5",
                  permissions: []
   })
                                       message.guild.createRole({
                name: "43",
                  color: "#FFE4B5",
                  permissions: []
   })
                                       message.guild.createRole({
                name: "44",
                  color: "#FFDAB9",
                  permissions: []
   })
                                       message.guild.createRole({
                name: "45",
                  color: "#EEE8AA",
                  permissions: []
   })
                                       message.guild.createRole({
                name: "46",
                  color: "#F0E68C",
                  permissions: []
   })
                                       message.guild.createRole({
                name: "47",
                  color: "#BDB76B",
                  permissions: []
   })
                                       message.guild.createRole({
                name: "48",
                  color: "#ADFF2F",
                  permissions: []
   })
                                       message.guild.createRole({
                name: "49",
                  color: "#7FFF00",
                  permissions: []
   })
                                       message.guild.createRole({
                name: "50",
                  color: "#7CFC00",
                  permissions: []
   })
                                       message.guild.createRole({
                name: "51",
                  color: "#00FF00",
                  permissions: []
   })  
   
                                       message.guild.createRole({
                name: "52",
                  color: "#32CD32",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "53",
                  color: "#98FB98",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "54",
                  color: "#90EE90",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "55",
                  color: "#00FA9A",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "56",
                  color: "#00FF7F",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "57",
                  color: "#3CB371",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "58",
                  color: "#2E8B57",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "59",
                  color: "#2E8B57",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "60",
                  color: "#008000",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "61",
                  color: "#006400",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "62",
                  color: "#9ACD32",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "63",
                  color: "#6B8E23",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "64",
                  color: "#556B2F",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "65",
                  color: "#66CDAA",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "66",
                  color: "#8FBC8F",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "67",
                  color: "#20B2AA",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "68",
                  color: "#008B8B",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "69",
                  color: "#008080",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "70",
                  color: "#00FFFF",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "71",
                  color: "#E0FFFF",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "72",
                  color: "#AFEEEE",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "73",
                  color: "#7FFFD4",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "74",
                  color: "#40E0D0",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "75",
                  color: "#48D1CC",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "76",
                  color: "#00CED1",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "77",
                  color: "#5F9EA0",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "78",
                  color: "#4682B4",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "79",
                  color: "#B0C4DE",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "80",
                  color: "#ADD8E6",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "81",
                  color: "#B0E0E6",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "82",
                  color: "#87CEFA",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "83",
                  color: "#87CEEB",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "84",
                  color: "#6495ED",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "85",
                  color: "#00BFFF",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "86",
                  color: "#1E90FF",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "87",
                  color: "#4169E1",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "88",
                  color: "#0000FF",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "89",
                  color: "#0000CD",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "90",
                  color: "#00008B",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "91",
                  color: "#000080",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "92",
                  color: "#191970",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "93",
                  color: "#FFF8DC",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "94",
                  color: "#FFEBCD",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "95",
                  color: "#FFE4C4",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "96",
                  color: "#FFDEAD",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "97",
                  color: "#F5DEB3",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "98",
                  color: "#DEB887",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "99",
                  color: "#D2B48C",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "100",
                  color: "#BC8F8F",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "101",
                  color: "#F4A460",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "102",
                  color: "#DAA520",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "103",
                  color: "#B8860B",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "104",
                  color: "#CD853F",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "105",
                  color: "#D2691E",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "106",
                  color: "#808000",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "107",
                  color: "#8B4513",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "108",
                  color: "#A0522D",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "109",
                  color: "#A52A2A",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "110",
                  color: "#800000",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "111",
                  color: "#FFFFFF",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "112",
                  color: "#FFFAFA",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "113",
                  color: "#F0FFF0",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "114",
                  color: "#F5FFFA",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "115",
                  color: "#F0FFFF",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "116",
                  color: "#F0F8FF",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "117",
                  color: "#F8F8FF",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "118",
                  color: "#F5F5F5",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "119",
                  color: "#FFF5EE",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "120",
                  color: "#F5F5DC",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "121",
                  color: "#FDF5E6",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "122",
                  color: "#FFFAF0",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "123",
                  color: "#FFFFF0",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "124",
                  color: "#FAEBD7",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "125",
                  color: "#FAF0E6",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "126",
                  color: "#FFF0F5",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "127",
                  color: "#FFE4E1",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "128",
                  color: "#DCDCDC",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "129",
                  color: "#D3D3D3",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "130",
                  color: "#C0C0C0",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "131",
                  color: "#f7f7f7",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "132",
                  color: "#b2b2b2",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "133",
                  color: "#6f6c6c",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "134",
                  color: "#4d4646",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "135",
                  color: "#4c4c4c",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "136",
                  color: "#2F4F4F",
                  permissions: []
   })     
                                       message.guild.createRole({
                name: "137",
                  color: "#040000",
                  permissions: []
   })     

   
        message.channel.sendMessage({embed: new Discord.RichEmbed()
   .setColor('#502faf').setAuthor(`${message.author.username}'`, message.author.avatarURL).setDescription('``Colors Has Been Created``')});
  }




client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '1');
  
  role.delete()
  }

});
client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '2');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '3');
  
  role.delete()
  }

});
client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '4');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '5');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '6');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '7');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '8');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '9');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '10');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '11');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '12');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '13');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '14');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '15');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '16');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '17');
  
  role.delete()
  }

});



client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '18');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '19');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '20');
  
  role.delete()
  }

});
client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("+!deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '21');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '22');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '23');
  
  role.delete()
  }

});



client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '24');
  
  role.delete()
  }

});



client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '25');
  
  role.delete()
  }

});



client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '26');
  
  role.delete()
  }

});


client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '27');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '28');
  
  role.delete()
  }

});


client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '29');
  
  role.delete()
  }

});


client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '30');
  
  role.delete()
  }

});


client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '31');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '32');
  
  role.delete()
  }

});


client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '33');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '34');
  
  role.delete()
  }

});


client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '35');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '36');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '37');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '38');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '39');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '40');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '41');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '42');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '43');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '44');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '45');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '46');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '47');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '48');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '49');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '50');
  
  role.delete()
  }

});
client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '51');
  
  role.delete()
  }

});
client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '52');
  
  role.delete()
  }

});
client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '53');
  
  role.delete()
  }

});
client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '54');
  
  role.delete()
  }

});
client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '55');
  
  role.delete()
  }

});
client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '56');
  
  role.delete()
  }

});
client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '57');
  
  role.delete()
  }

});
client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '58');
  
  role.delete()
  }

});
client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '59');
  
  role.delete()
  }

});
client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '60');
  
  role.delete()
  }

});
client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '-61');
  
  role.delete()
  }

});
client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '62');
  
  role.delete()
  }

});
client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '63');
  
  role.delete()
  }

});
client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '64');
  
  role.delete()
  }

});
client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '65');
  
  role.delete()
  }

});
client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '66');
  
  role.delete()
  }

});
client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '67');
  
  role.delete()
  }

});
client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '68');
  
  role.delete()
  }

});
client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '69');
  
  role.delete()
  }

});
client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '70');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '71');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '72');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '73');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '74');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '75');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '76');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '77');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '78');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '79');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '80');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '81');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '82');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '83');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '84');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '85');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '86');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '87');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '88');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '89');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '90');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '91');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '92');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '93');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '94');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '95');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '96');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith ("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '97');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '98');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '99');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '100');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '101');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '102');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '103');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '104');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '105');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith ("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '106');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '107');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '108');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '109');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '110');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '111');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '112');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '113');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '114');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '115');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '116');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '117');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '118');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '119');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '121');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '122');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("!deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '123');
  
  role.delete()
  }

});
client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '124');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '125');
  
  role.delete()
  }

});
client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '126');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '127');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '128');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '129');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '130');
  
  role.delete()
  }

});
client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '131');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '132');
  
  role.delete()
  }

});
client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '133');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '134');
  
  role.delete()
  }

});
client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '135');
  
  role.delete()
  }

});

client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '136');
  
  role.delete()
  }

});



client.on('message', async message => {
  
    let args = message.content.split(' ').slice(1);
if (message.content.startsWith("p#deletecolors")) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return
  let role = message.guild.roles.find('name', '137');
  
  role.delete()
  }

});
})
}})
client.on("message", (message) => {

  if(message.content.startsWith(`${prefix}new`)){
     const reason = message.content.split(" ").slice(1).join(" ");
     if (!message.guild.roles.exists("name", "Support Team")) return message.channel.send(`This server doesn't have a \`Support Team\` role made, so the ticket won't be opened.\nIf you are an administrator, make one with that name exactly and give it to users that should be able to see tickets.`);
     if (message.guild.channels.exists("name", "ticket-" + message.author.id)) return message.channel.send(`You already have a ticket open.`);
     message.guild.createChannel(`ticket-${message.author.id}`, "text").then(c => {
         let role = message.guild.roles.find("name", "Support Team");
         let role2 = message.guild.roles.find("name", "@everyone");
         c.overwritePermissions(role, {
             SEND_MESSAGES: true,
             READ_MESSAGES: true
         });
         c.overwritePermissions(role2, {
             SEND_MESSAGES: false,
             READ_MESSAGES: false
         });
         c.overwritePermissions(message.author, {
             SEND_MESSAGES: true,
             READ_MESSAGES: true
         });
         message.channel.send(`:white_check_mark: Your ticket has been created, #${c.name}.`);
         const embed = new Discord.RichEmbed()
             .setColor(0xCF40FA)
             .addField(`Hey ${message.author.username}!`, `Please try explain why you opened this ticket with as much detail as possible. Our **Support Staff** will be here soon to help.`)
             .setTimestamp();
         c.send({
             embed: embed
         });
     }).catch(console.error);
 }


  if(message.content.startsWith(`${prefix}close`)){
     if (!message.channel.name.startsWith(`ticket-`)) return message.channel.send(`You can't use the close command outside of a ticket channel.`);

     message.channel.send(`Are you sure? Once confirmed, you cannot reverse this action!\nTo confirm, type \`/confirm\`. This will time out in 10 seconds and be cancelled.`)
         .then((m) => {
             message.channel.awaitMessages(response => response.content === '/confirm', {
                     max: 1,
                     time: 10000,
                     errors: ['time'],
                 })
                 .then((collected) => {
                     message.channel.delete();
                 })
                 .catch(() => {
                     m.edit('Ticket close timed out, the ticket was not closed.').then(m2 => {
                         m2.delete();
                     }, 3000);
                 });
         });
 }

});
client.on('message',message =>{
    if(message.content.startsWith(prefix + 'topinvites')) {
  message.guild.fetchInvites().then(i =>{
  var invites = [];
   
  i.forEach(inv =>{
    var [invs,i]=[{},null];
     
    if(inv.maxUses){
        invs[inv.code] =+ inv.uses+"/"+inv.maxUses;
    }else{
        invs[inv.code] =+ inv.uses;
    }
        invites.push(`invite: ${inv.url} inviter: ${inv.inviter} \`${invs[inv.code]}\`;`);
   
  });
  var embed = new Discord.RichEmbed()
  .setColor("#000000")
  .setDescription(`${invites.join(`\n`)+'\n\n**By:** '+message.author}`)
           message.channel.send({ embed: embed });
   
  });
   
    }
  });
client.on('message', message => {
if(!message.channel.guild) return;
if(message.content.startsWith(prefix + 'move')) {
 if (message.member.hasPermission("MOVE_MEMBERS")) {
 if (message.mentions.users.size === 0) {
 return message.channel.send("``لاستخدام الأمر اكتب هذه الأمر : " +prefix+ "move [USER]``")
}
if (message.member.voiceChannel != null) {
 if (message.mentions.members.first().voiceChannel != null) {
 var authorchannel = message.member.voiceChannelID;
     var usermentioned = message.mentions.members.first().id;
var embed = new Discord.RichEmbed()
 .setTitle("Succes!")
 .setColor("#000000")
 .setDescription(`لقد قمت بسحب <@${usermentioned}> الى الروم الصوتي الخاص بك✅ `)
var embed = new Discord.RichEmbed()
.setTitle(`You are Moved in ${message.guild.name}`)
 .setColor("RANDOM")
.setDescription(`**<@${message.author.id}> Moved You To His Channel!\nServer --> ${message.guild.name}**`)
 message.guild.members.get(usermentioned).setVoiceChannel(authorchannel).then(m => message.channel.send(embed))
message.guild.members.get(usermentioned).send(embed)
} else {
message.channel.send("``لا تستطيع سحب "+ message.mentions.members.first() +" `يجب ان يكون هذه العضو في روم صوتي`")
}
} else {
 message.channel.send("**``يجب ان تكون في روم صوتي لكي تقوم بسحب العضو أليك``**")
}
} else {
message.react(":x:")
 }}});

client3.on("roleCreate", role => {
    client3.setTimeout(() => {
      role.guild.fetchAuditLogs({
          limit: 1,
          type: 30
        })
        .then(audit => {
          let exec = audit.entries.map(a => a.executor.username)
          try {
             let log = role.guild.channels.find('name', 'log');
            if (!log) return;
            let embed = new Discord.RichEmbed()
              .setColor('RANDOM')
              .setTitle('➕ RoleCreated')
              .addField('Role Name', role.name, true)
              .addField('Role ID', role.id, true)
              .addField('By', exec, true)
              .setTimestamp()
            log.send(embed).catch(e => {
              console.log(e);
            });
          } catch (e) {
            console.log(e);
          }
        })
    }, 1000)
  })
   client3.on("roleDelete", role => {
    client3.setTimeout(() => {
      role.guild.fetchAuditLogs({
          limit: 1,
          type: 30
        })
        .then(audit => {
          let exec = audit.entries.map(a => a.executor.username)
          try {
             let log = role.guild.channels.find('name', 'log');
            if (!log) return;
            let embed = new Discord.RichEmbed()
              .setColor('RANDOM')
              .setTitle('❌ RoleDeleted')
              .addField('Role Name:', role.name, true)
              .addField('Role ID:', role.id, true)
              .addField('By:', exec, true)
              .setTimestamp()
            log.send(embed).catch(e => {
              console.log(e);
            });
          } catch (e) {
            console.log(e);
          }
        })
    }, 1000)
  })
     client3.on("roleUpdate", (re,updated) => {
      client3.setTimeout(() => {
        re.guild.fetchAuditLogs({
            limit: 1,
            type: 30
          })
          .then(audit => {
            let exec = audit.entries.map(a => a.executor.username)
            try {
 
              let log = re.guild.channels.find('name', 'log');
              if (!log) return;
              let embed = new Discord.RichEmbed()
                .setColor('BLACK')
                .setTitle("✏  Role Name Updated")
                .addField("Old",`${re.name}`,true)
                .addField("New",`${updated.name}`,true )
                .addField("Role id",`${re.id}`,true )
                .addField('By', exec, true)
                .setTimestamp()
              log.send(embed).catch(e => {
                console.log(e);
              });
            } catch (e) {
              console.log(e);
            }
          })
      }, 1000)
    })
   client3.on("channelDelete",  dc => {
    const channel = dc.guild.channels.find("name", "log")
    if(channel) {
    var embed = new Discord.RichEmbed()
    .setTitle(dc.guild.name)
    .setDescription(`***Channel Deleted Name : *** **${dc.name}** ⬅️`)
    .setColor(`RANDOM`)
    .setTimestamp();
    channel.sendEmbed(embed)
    }
    });
 
 
  client3.on('messageUpdate', (message, newMessage) => {
      if (message.content === newMessage.content) return;
      if (!message || !message.id || !message.content || !message.guild || message.author.bot) return;
      const channel = message.guild.channels.find('name', 'log');
      if (!channel) return;
       let embed = new Discord.RichEmbed()
         .setAuthor(`${message.author.tag}`, message.author.avatarURL)
         .setColor('RANDOM')
         .setDescription(`✏ **Message Edited
  Sender <@${message.author.id}>                                                                                                                         Edited In** <#${message.channel.id}>\n\nBefore Edited:\n \`${message.cleanContent}\`\n\nAfter Edited:\n \`${newMessage.cleanContent}\``)
         .setTimestamp();
       channel.send({embed:embed});
   });
   client3.on('messageDelete', message => {
      if (!message || !message.id || !message.content || !message.guild || message.author.bot) return;
      const channel = message.guild.channels.find('name', 'log');
      if (!channel) return;
 
      let embed = new Discord.RichEmbed()
         .setAuthor(`${message.author.tag}`, message.author.avatarURL)
         .setColor('RANDOM')
         .setDescription(`🗑️ **Message Deleted**
  **Sender <@${message.author.id}>                                                                                                                        Deleted In** <#${message.channel.id}>\n\n \`${message.cleanContent}\``)
         .setTimestamp();
       channel.send({embed:embed});
   });
   client3.on('guildMemberAdd', member => {
      if (!member || !member.id || !member.guild) return;
      const guild = member.guild;
 
      const channel = member.guild.channels.find('name', 'log');
      if (!channel) return;
      let memberavatar = member.user.avatarURL
      const fromNow = moment(member.user.createdTimestamp).fromNow();
      const isNew = (new Date() - member.user.createdTimestamp) < 900000 ? '🆕' : '';
 
      let embed = new Discord.RichEmbed()
         .setAuthor(`${member.user.tag}`, member.user.avatarURL)
       .setThumbnail(memberavatar)
         .setColor('RANDOM')
         .setDescription(`📥 <@${member.user.id}> **Joined To The Server**\n\n`)
         .setTimestamp();
       channel.send({embed:embed});
  });
   client3.on('guildMemberRemove', member => {
      if (!member || !member.id || !member.guild) return;
      const guild = member.guild;
 
      const channel = member.guild.channels.find('name', 'log');
      if (!channel) return;
      let memberavatar = member.user.avatarURL
      const fromNow = moment(member.joinedTimestamp).fromNow();
 
      let embed = new Discord.RichEmbed()
         .setAuthor(`${member.user.tag}`, member.user.avatarURL)
       .setThumbnail(memberavatar)
         .setColor('RAMDOM')
         .setDescription(`📤 <@${member.user.id}> **Leave From Server**\n\n`)
         .setTimestamp();
       channel.send({embed:embed});
  });
   client3.on('voiceStateUpdate', (oldM, newM) => {
    let m1 = oldM.serverMute;
    let m2 = newM.serverMute;
     let d1 = oldM.serverDeaf;
    let d2 = newM.serverDeaf;
     let ch = oldM.guild.channels.find('name', 'log')
    if(!ch) return;
       oldM.guild.fetchAuditLogs()
      .then(logs => {
         let user = logs.entries.first().executor
       if(m1 === false && m2 === true) {
         let embed = new Discord.RichEmbed()
         .setAuthor(`${newM.user.tag}`, newM.user.avatarURL)
         .setDescription(`${newM} has muted in server`)
         .setFooter(`By : ${user}`)
          ch.send(embed)
      }
      if(m1 === true && m2 === false) {
         let embed = new Discord.RichEmbed()
         .setAuthor(`${newM.user.tag}`, newM.user.avatarURL)
         .setDescription(`${newM} has unmuted in server`)
         .setFooter(`By : ${user}`)
         .setTimestamp()
          ch.send(embed)
      }
      if(d1 === false && d2 === true) {
         let embed = new Discord.RichEmbed()
         .setAuthor(`${newM.user.tag}`, newM.user.avatarURL)
         .setDescription(`${newM} has deafened in server`)
         .setFooter(`By : ${user}`)
         .setTimestamp()
          ch.send(embed)
      }
      if(d1 === true && d2 === false) {
         let embed = new Discord.RichEmbed()
         .setAuthor(`${newM.user.tag}`, newM.user.avatarURL)
         .setDescription(`${newM} has undeafened in server`)
         .setFooter(`By : ${user}`)
         .setTimestamp()
          ch.send(embed)
      }
    })
  });
     client3.on("guildBanAdd", (guild, member) => {
    client3.setTimeout(() => {
      guild.fetchAuditLogs({
          limit: 1,
          type: 22
        })
        .then(audit => {
          let exec = audit.entries.map(a => a.executor.username);
          try {
            let log = guild.channels.find('name', 'log');
            if (!log) return;
            client3.fetchUser(member.id).then(myUser => {
            let embed = new Discord.RichEmbed()
          .setAuthor(exec)
          .setThumbnail(myUser.avatarURL)
          .addField('- Banned User:',`**${myUser.username}**`,true)
          .addField('- Banned By:',`**${exec}**`,true)
          .setFooter(myUser.username,myUser.avatarURL)
              .setTimestamp();
            log.send(embed).catch(e => {
              console.log(e);
            });
            });
          } catch (e) {
            console.log(e);
          }
        });
    }, 1000);
  });
client3.on('message', async message => {
    var moment = require('moment');
    var mmss = require('ms')
    let date = moment().format('Do MMMM YYYY , hh:mm');
    let User = message.mentions.users.first();
    let Reason = message.content.split(" ").slice(3).join(" ");
    let messageArray = message.content.split(" ");
    let time = messageArray[2];
    if(message.content.startsWith(prefix + "tempban")) {
       if(!message.guild.member(message.author).hasPermission("BAN_MEMBERS")) return message.channel.send("**You dont have ban_members permission :/ **");
       if(!User) message.channel.send("**Mention Someone**");
       if(User.id === client.user.id) return message.channel.send("**Why you want to ban me ? :/**");
       if(User.id === message.guild.owner.id) return message.channel.send("**Nice try man :> you cant ban the ownership**");
       if(!time) return message.channel.send("**- اكتب الوقت**");
       if(!time.match(/[1-7][s,m,h,d,w]/g)) return message.channel.send('**- Error in this Duration**');
       if(!Reason) message.channel.send("**- اكتب Reason**");
       let banEmbed = new Discord.RichEmbed()
       .setAuthor(`New Banned User !`)
       .setThumbnail(message.guild.iconURL || message.guild.avatarURL)
       .addField('- Banned By: ',message.author.tag,true)
       .addField('- Banned User:', `${User}`)
       .addField('- Reason:',Reason,true)
       .addField('- Time & Date:', `${message.createdAt}`)
       .addField('- Duration:',time,true)
       .setFooter(message.author.tag,message.author.avatarURL);
       let incidentchannel = message.guild.channels.find(`name`, "incidents");
  if(!incidentchannel) return message.channel.send("Can't find incidents channel.");
  incidentchannel.send(banEmbed);
  message.channel.send(`**:white_check_mark: ${User} has been banned :airplane: **`).then(() => message.guild.member(User).ban({reason: Reason}))
  User.send(`**:airplane: You are has been banned in ${message.guild.name} reason: ${Reason} by: ${message.author.tag} :airplane:**`)
       .then(() => { setTimeout(() => {
           message.guild.unban(User);
       }, mmss(time));
    });
   }
  });

const mmss = require('ms');
client3.on('message', async message => {
    let muteReason = message.content.split(" ").slice(3).join(" ");
    let mutePerson = message.mentions.users.first();
    let messageArray = message.content.split(" ");
    let muteRole = message.guild.roles.find("name", "Muted");
    let time = messageArray[2];
    if(message.content.startsWith(prefix + "tempmute")) {
        if(!message.member.hasPermission('MUTE_MEMBERS')) return message.channel.send('**للأسف لا تمتلك صلاحية** `MUTE_MEMBERS`' );
        if(!mutePerson) return message.channel.send("**- منشن الشخص يلي تبي تعطيه الميوت**");
        if(mutePerson === message.author) return message.channel.send('**- ماتقدر تعطي نفسك ميوت**');
        if(mutePerson === client.user) return message.channel.send('**- ماتقدر تعطي البوت ميوت :)**');
        if(message.guild.member(mutePerson).roles.has(muteRole.id)) return message.channel.send('**- هذا الشخص ميوتد بالفعل**');
        if(!muteRole) return message.guild.createRole({ name: "Muted", permissions: [] });
        if(!time) return message.channel.send("**- اكتب الوقت**");
        if(!time.match(/[1-60][s,m,h,d,w]/g)) return message.channel.send('**- Error in this duration maybe the bot not support this duration**');
        if(!muteReason) return message.channel.send("**- اكتب السبب**");
        message.guild.member(mutePerson).addRole(muteRole);
        message.channel.send(`**:white_check_mark: ${mutePerson} has been muted ! :zipper_mouth: **`)
        message.delete()
        let muteEmbed = new Discord.RichEmbed()
        .setTitle(`New Muted User`)
        .setThumbnail(message.guild.iconURL)
        .addField('- Muted By:',message.author,true)
        .addField('- Muted User:', `${mutePerson}`)
        .addField('- Reason:',muteReason,true)
        .addField('- Duration:',`${mmss(mmss(time), {long: true})}`)
        .setFooter(message.author.username,message.author.avatarURL);
        let incidentchannel = message.guild.channels.find(`name`, "incidents");
        if(!incidentchannel) return message.channel.send("Can't find incidents channel.");
        incidentchannel.sendEmbed(muteEmbed)
        mutePerson.send(`**You Are has been muted in ${message.guild.name} reason: ${muteReason}**`)
        .then(() => { setTimeout(() => {
           message.guild.member(mutePerson).removeRole(muteRole);
       }, mmss(time));
    });
    }
});

client3.on('message',  async  message  =>  {
    let  user  =  message.mentions.users.first();
    let  reason  =  message.content.split(' ').slice(2).join(' ');
if(message.content.startsWith(prefix  +  'warn'))  {
    message.delete();
    if(!message.member.hasPermission('MUTE_MEMBERS')) return      message.channel.send('**للأسف لا تمتلك صلاحيات' );
    if(!user)  return  message.channel.send("**  -  mention  a  member  **")//by  orochix
    if(!reason)  return  message.channel.send("**  -  Type  Reason  **")//by  orochix
    let  reportembed  =  new  Discord.RichEmbed()
    .setTitle(`**New  Warned User !**`)
.addField("**-  Warned  User:**",  `[${user}  with  ID  ${user.id}]`)//by  orochix
.addField('**-  Warned  By:**',`[${message.author.tag} with id ${message.author.id}]`)//by  orochix
.addField('**-  Reason:**',  `[${reason}]`,  true)
.addField("**-  Warned  in:**",`[${message.channel.name}]`)
.addField("**-  Time & Date:**",`[${message.createdAt}]`)
.setFooter("MarsMC")
.setColor('#060c37')
message.guild.channels.find('name',  'incidents').sendEmbed(reportembed)
message.reply(`**:warning: ${user} has been warned !:warning:**`).then(msg  =>  msg.delete(3000));
  user.send(`**:warning: You are has been warned in ${message.guild.name} reason: ${reason} :warning:**`)
}

//coding  by  orochix  !

})
client3.on('message', async message =>{
  var prefix = "p#";
if (message.author.omar) return;
if (!message.content.startsWith(prefix)) return;
if(!message.channel.guild) return message.channel.send('**This Command For Servers Only ! **').then(m => m.delete(5000));
if(!message.member.hasPermission('MANAGE_ROLES'));
if(!message.guild.member(client3.user).hasPermission("MANAGE_ROLES")) return message.reply("**I Don't Have `MANAGE_ROLES` Permission**").then(msg => msg.delete(6000))
var command = message.content.split(" ")[0];
command = command.slice(prefix.length);
var args = message.content.split(" ").slice(1);
  if(command == "mute") {
    let tomute = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!tomute) return message.reply("**Mention Someone Please**:x: ") .then(m => m.delete(5000));
    if(tomute.hasPermission("MANAGE_MESSAGES"))return      message.channel.send('**I Dont Have Permission** `MANAGE_MASSAGEES`');
    let muterole = message.guild.roles.find(`name`, "muted");

    if(!muterole){
      try{
        muterole = await message.guild.createRole({
          name: "muted",
          color: "#000000",
          permissions:[]
        })
        message.guild.channels.forEach(async (channel, id) => {
          await channel.overwritePermissions(muterole, {
            SEND_MESSAGES: false,
            ADD_REACTIONS: false
          });
        });
      }catch(e){
        console.log(e.stack);
      }
    }
    let mutetime = args[1];
    if(!mutetime) return message.reply("**Please Type The Duration**:x:");

    await(tomute.addRole(muterole.id));
    message.channel.send(`**<@${tomute.id}> Has been muted ! :white_check_mark:**`);
      message.delete();
    const muteembed = new Discord.RichEmbed()
    .setTitle('**New Muted User !**')
    .setColor("RANDOM")
    .setTimestamp()
    .addField("Muted User:",  `[ + ${user.tag} + ]`)
    .addField("Muted By:", `[  + ${message.author.tag} +  ]`)
    .addField("Reason:", `[ + ${reason} +  ]`)
    .addField("Muted In :", `[${message.channel.name}]`)
    .addField("Time & Date :", `[${message.createdAt}]`)
    .setFooter("MarsMC")
    message.guild.channels.find('name',  'incidents').sendEmbed(muteembed)
    setTimeout(function(){
      tomute.removeRole(muterole.id);
      message.channel.send(`<:white_check_mark: @${tomute.id}> **Has been unnmuted due to time lapse **:white_check_mark: `);
    }, ms(mutetime));
  }
});


client3.on('message', async message =>{
var prefix = "p#";
if (message.author.omar) return;
if (!message.content.startsWith(prefix)) return;
if(!message.channel.guild) return message.channel.send('**This Command For Servers Only ! **').then(m => m.delete(5000));
if(!message.member.hasPermission('MANAGE_ROLES'));
if(!message.guild.member(client3.user).hasPermission("MANAGE_ROLES")) return message.reply("**I Don't Have `MANAGE_ROLES` Permission**").then(msg => msg.delete(6000))
var command = message.content.split(" ")[0];
command = command.slice(prefix.length);
var args = message.content.split(" ").slice(1);
if(command === `unmute`) {
if(!message.member.hasPermission("MANAGE_ROLES")) return message.channel.sendMessage("**You Dont Have MANAGE_ROLES Permssions**:x: ").then(msg => msg.delete(6000))


let toMute = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
if(!toMute) return message.channel.sendMessage("**Mention Someone Please**:x: ");

let role = message.guild.roles.find (r => r.name === "Muted");

if(!role || !toMute.roles.has(role.id)) return message.channel.sendMessage("**This Person Is Not Muted ! **:x:")

await toMute.removeRole(role)

message.channel.sendMessage(`**${toMute} Has been unmuted !**:white_check_mark:`);
message.delete();
let mutedEmbed = new Discord.RichEmbed()
.setDescription("» New UnMute User «")
.setColor("#bc0000")
.addField("Unmuted", `${Warned} with ID ${Warned.id}`)
.addField("Unmuted By", `<@${message.member.id}> with ID ${message.member.id}`)
.addField("Unmuted In", message.channel)
.addField("Time & Date", `${message.createdAt}`)
.setFooter("MarsMC")
let incidentchannel = message.guild.channels.find(`name`, "incidents");
if(!incidentchannel) return message.channel.send("Can't find incidents channel.");
return;

}
}); 

        
client.on('message', message => {
    if(!message.channel.guild) return;
let args = message.content.split(' ').slice(1).join(' ');
if (message.content.startsWith('p#ownerbc')){
if (message.author.id !== '429972030092476437') return message.reply('** هذا الأمر قفط لصاحب البوت و شكراًً **')
if(!message.author.id === '429972030092476437') return;
message.channel.sendMessage('جار ارسال |✅')
client.users.forEach(m =>{
m.sendMessage(args)
})
}
});
client.on('message', message => {
  if (message.content.startsWith(prefix + 'users1')) {
let msg =  client.guilds.map(guild => `**${guild.name}** عدد الاعضاء: ${guild.memberCount}`).join('\n');
let embed = new Discord.RichEmbed()
.setTitle(`${client.guilds.size}سيرفرات `)
.setDescription(`${msg}`)
.setColor("#00ff47");
message.channel.send(embed);
}
});
let ar = JSON.parse(fs.readFileSync(`./Data/AutoRole.json`, `utf8`))
client3.on('guildMemberAdd', member => {
if(!ar[member.guild.id]) ar[member.guild.id] = {
onoff: 'Off',
role: 'Member'
}
if(ar[member.guild.id].onoff === 'Off') return;
member.addRole(member.guild.roles.find(`name`, ar[member.guild.id].role)).catch(console.error)
})
client3.on('message', message => {
if(!message.guild) return
if(!ar[message.guild.id]) ar[message.guild.id] = {
onoff: 'Off',
role: 'Member'
}
if(message.content.startsWith(prefix + `autorole`)) {
let perms = message.member.hasPermission(`MANAGE_ROLES`)
if(!perms) return message.reply(`You don't have permissions, required permission : Manage Roles.`)
let args = message.content.split(" ").slice(1)
if(!args.join(" ")) return message.reply(`${prefix}autorle toggle/setrole [ROLE NAME]`)
let state = args[0]
if(!state.trim().toLowerCase() == 'toggle' || !state.trim().toLowerCase() == 'setrole') return message.reply(`Please type a right state, ${prefix}modlogs toggle/setrole [ROLE NAME]`)
if(state.trim().toLowerCase() == 'toggle') {
if(ar[message.guild.id].onoff === 'Off') return [message.channel.send(`**The Autorole Is __𝐎𝐍__ !**`), ar[message.guild.id].onoff = 'On']
if(ar[message.guild.id].onoff === 'On') return [message.channel.send(`**The Autorole Is __𝐎𝐅𝐅__ !**`), ar[message.guild.id].onoff = 'Off']
}
if(state.trim().toLowerCase() == 'set') {
let newRole = message.content.split(" ").slice(2).join(" ")
if(!newRole) return message.reply(`${prefix}autorole setrole [ROLE NAME]`)
if(!message.guild.roles.find(`name`,newRole)) return message.reply(`I Cant Find This Role.`)
ar[message.guild.id].role = newRole
message.channel.send(`**The AutoRole Has Been Changed to ${newRole}.**`)
}
  }
if(message.content === prefix + 'info') {
let perms = message.member.hasPermission(`MANAGE_GUILD`)
if(!perms) return message.reply(`You don't have permissions.`)
var embed = new Discord.RichEmbed()
.addField(`Autorole : :sparkles:  `, `
State : __${ar[message.guild.id].onoff}__
Role : __${ar[message.guild.id].role}__`)
.setColor(`BLUE`)
message.channel.send({embed})
}
fs.writeFile("./Data/AutoRole.json", JSON.stringify(ar), (err) => {
if (err) console.error(err)
});
})
const sWlc = {}
const premium = ['429972030092476437', '', '', '']
client3.on('message', message => {
var prefix = "p#";
if(message.channel.type === "dm") return;
if(message.author.bot) return;
  if(!sWlc[message.guild.id]) sWlc[message.guild.id] = {
    channel: "welcome"
}
const channel = sWlc[message.guild.id].channel
  if (message.content.startsWith(prefix + "setwelcomer")) {
    if(!message.member.hasPermission(`MANAGE_GUILD`)) return;
    let newChannel = message.content.split(' ').slice(1).join(" ")
    if(!newChannel) return message.reply(`**${prefix}setwelcomer <channel name>**`)
    sWlc[message.guild.id].channel = newChannel
    message.channel.send(`**${message.guild.name}'s channel has been changed to ${newChannel}**`);
  }
});
client3.on("guildMemberAdd", member => {
      if(!sWlc[member.guild.id]) sWlc[member.guild.id] = {
    channel: "welcome"
  }
  const channel = sWlc[member.guild.id].channel
    const sChannel = sWlc[member.guild.id].channel
    let welcomer = member.guild.channels.find('name', sChannel);
    let memberavatar = member.user.avatarURL
      if (!welcomer) return;
      if(welcomer) {
         moment.locale('ar-ly');
         var h = member.user;
        let heroo = new Discord.RichEmbed()
        .setColor('RANDOM')
        .setThumbnail(h.avatarURL)
        .setAuthor(h.username,h.avatarURL)
        .addField(': تاريخ دخولك الدسكورد',`${moment(member.user.createdAt).format('D/M/YYYY h:mm a')} **\n** \`${moment(member.user.createdAt).fromNow()}\``,true)
         .addField(': تاريخ دخولك السيرفر',`${moment(member.joinedAt).format('D/M/YYYY h:mm a ')} \n\`\`${moment(member.joinedAt).startOf(' ').fromNow()}\`\``, true)
         .setFooter(`${h.tag}`,"https://images-ext-2.discordapp.net/external/JpyzxW2wMRG2874gSTdNTpC_q9AHl8x8V4SMmtRtlVk/https/orcid.org/sites/default/files/files/ID_symbol_B-W_128x128.gif")
     welcomer.send({embed:heroo});

      var Canvas = require('canvas')
      var jimp = require('jimp')

      const w = ['image.png'];

              let Image = Canvas.Image,
                  canvas = new Canvas(557, 241),
                  ctx = canvas.getContext('2d');

              fs.readFile(`${w[Math.floor(Math.random() * w.length)]}`, function (err, Background) {
                  if (err) return console.log(err)
                  let BG = Canvas.Image;
                  let ground = new Image;
                  ground.src = Background;
                  ctx.drawImage(ground, 0, 0, 540, 230);

      })

                      let url = member.user.displayAvatarURL.endsWith(".webp") ? member.user.displayAvatarURL.slice(5, -20) + ".gif" : member.user.displayAvatarURL;
                      jimp.read(url, (err, ava) => {
                          if (err) return console.log(err);
                          ava.getBuffer(jimp.MIME_PNG, (err, buf) => {
                              if (err) return console.log(err);

                                    ctx.font = '21px kathen';
                              ctx.fontSize = '25px';
                              ctx.fillStyle = "#FFFFFF";
                                ctx.fillText(member.user.username, 240, 150);

                              //NAMEً
                              ctx.font = '21px kathen';
                              ctx.fontSize = '20px';
                              ctx.fillStyle = "#FFFFFF";
      ctx.fillText(`Welcome To ${member.guild.name}`, 240, 90);

                              //AVATARً
                              let Avatar = Canvas.Image;
                              let ava = new Avatar;
                              ava.src = buf;
                              ctx.beginPath();
                 ctx.arc(120.8, 120.5, 112.3, 0, Math.PI*2, true);
                   ctx.closePath();

                                 ctx.clip();

                        ctx.drawImage(ava, 7, 8, 227, 225);
                              ctx.closePath();


    welcomer.sendFile(canvas.toBuffer())



      })
      })

      }
      });



client3.on('message', message => {
let al = JSON.parse(fs.readFileSync(`./antilinks.json`, `utf8`));
    var sender = message.author
    if (!message.channel.guild) return;
    if (message.author.bot) return null;

    if (!al[message.guild.id]) al[message.guild.id] = {
        onoff: 'Off'
    }

    if (message.content === prefix + 'guildinfo') {
        let perms = message.member.hasPermission(`MANAGE_GUILD`)
        if (!perms) return message.reply(`You don't have permissions: Manage Guild.`)
        var embed = new Discord.RichEmbed()
            .setTitle(`${message.guild.name}'s Config`)


            .addField(`Antilinks : `, `Antilinks State : ${al[message.guild.id].onoff}`)

            .setColor(`BLUE`)
        message.channel.send({
            embed
        })
    }
    if (message.content === prefix + 'antilinks') {
        let perms = message.member.hasPermission(`MANAGE_GUILD`)
        if (!perms) return message.reply(`You don't have permissions, required permission : Manage Server.`)
        let args = message.content.split(" ").slice(1)
        if (!args.join(" ")) {
            if (al[message.guild.id].onoff === 'Off') return [message.channel.send(`**The Antlinks event has been toggled to On!**`), al[message.guild.id].onoff = 'On']
            if (al[message.guild.id].onoff === 'On') return [message.channel.send(`**The Antilinks event has been toggled to Off!**`), al[message.guild.id].onoff = 'Off'] //:D

        }
    }
    if (message.content.includes('discord.gg','gg')) {
        if (al[message.guild.id].onoff === 'Off') return
        if (message.member.hasPermission('ADMINISTRATOR')) return;
        message.delete()
        return message.reply(`** Advertising isn't allowed here ! **`)
    }

    fs.writeFile("./antilinks.json", JSON.stringify(al), (err) => {
        if (err) console.error(err)
    });
});
client3.on("guildMemberAdd", user => {
  user.createDM().then(function (channel) {

let embeddd = new Discord.RichEmbed()
    .setImage('https://media.giphy.com/media/xUPGGDNsLvqsBOhuU0/giphy.gif') //هنا حط الصوره الي تبيها
    .setTitle('عضو جديد!')
    .setDescription('مرحبا بك بالسيرفر')
    .addField('``ايدي العضو``:',"" +  `${user.user.id}`)
    .addField('``تاق العضو``', `${user.user.discriminator}`)
    .addField('``تم الانشاء في``', `${user.user.createdAt}`)
    .addField(' 👤  انت رقم',`${user.guild.memberCount}`,true)
    .setColor('RANDOM')
    .setFooter(user.guild.name, user.guild.iconURL, true)
user.send(embeddd)

  })
})


client.on("message", message => {
        if(!message.channel.guild) return;
 if(message.author.bot) return;
    if(message.content === prefix + "image"){
        const embed = new Discord.RichEmbed()

    .setTitle(`This is  ** ${message.guild.name} **  Photo !`)
.setAuthor(message.author.username, message.guild.iconrURL)
  .setColor(0x164fe3)
  .setImage(message.guild.iconURL)
  .setURL(message.guild.iconrURL)
                  .setTimestamp()

 message.channel.send({embed});
    }
});
client.on('message', message => {
  if (message.content.startsWith("p#avatar")) {
      var mentionned = message.mentions.users.first();
  var x5bzm;
    if(mentionned){
        var x5bzm = mentionned;
    } else {
        var x5bzm = message.author;

    }
      const embed = new Discord.RichEmbed()
      .setColor("RANDOM")
      .setImage(`${x5bzm.avatarURL}`)
    message.channel.sendEmbed(embed);
     }
});


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log('')
  console.log('')
  console.log('╔[═════════════════════════════════════════════════════════════════]╗')
  console.log(`[Start] ${new Date()}`);
  console.log('╚[═════════════════════════════════════════════════════════════════]╝')
  console.log('')
  console.log('╔[═════════════════════════════════════]╗');
  console.log(`Logged in as * [ " ${client.user.username} " ]`);
  console.log('')
  console.log('Informations :')
  console.log('')
  console.log(`servers! [ " ${client.guilds.size} " ]`);
  console.log(`Users! [ " ${client.users.size} " ]`);
  console.log(`channels! [ " ${client.channels.size} " ]`);
  console.log('╚[════════════════════════════════════]╝')
  console.log('')
  console.log('╔[════════════]╗')
  console.log(' Bot Is Online')
  console.log('╚[════════════]╝')
  console.log('')
  console.log('')
});
client3.on('message', message => {

  if(message.content.split(' ')[0] == prefix + 'id') {
  if(!message.channel.guild) return;
 
  let args = message.content.split(' ').slice(1).join(' ');
 
         let defineduser = '';
         if (!args[1]) {
             defineduser = message.author;
         } else { // Run this if they did define someone...
             let firstMentioned = message.mentions.users.first();
             defineduser = firstMentioned;
         }
 
         const w = ['./id5.png','./id6.png'];
         var Canvas = require('canvas')
  var jimp = require('jimp')
 
          const millis = new Date().getTime() - defineduser.createdAt.getTime();
  const now = new Date();
  dateFormat(now, 'dddd, mmmm dS, yyyy');
  const stats2 = ['online', 'Low', 'Medium', 'Insane'];
  const days = millis / 1000 / 60 / 60 / 24;
           dateFormat(now, 'dddd, mmmm dS, yyyy');
               let time = `${dateFormat(defineduser.createdAt)}`
               var heg;
               if(men) {
                   heg = men
               } else {
                   heg = message.author
               }
              var mentionned = message.mentions.members.first();
                var h;
               if(mentionned) {
                   h = mentionned
               } else {
                   h = message.member
               }
         let Image = Canvas.Image,
             canvas = new Canvas(300, 300),
             ctx = canvas.getContext('2d');
         ctx.patternQuality = 'bilinear';
         ctx.filter = 'bilinear';
         ctx.antialias = 'subpixel';
 
         fs.readFile(`${w[Math.floor(Math.random() * w.length)]}`, function (err, Background) {
             if (err) return console.log(err);
             let BG = Canvas.Image;
             let ground = new Image;
             ground.src = Background;
             ctx.drawImage(ground, 0, 0, 300, 300);
 
  })
    var mentionned = message.mentions.users.first();
 
     var client3;
       if(mentionned){
           var client3 = mentionned;
       } else {
           var client3 = message.author;
 
       }
 
  var men = message.mentions.users.first();
             var heg;
             if(men) {
                 heg = men
             } else {
                 heg = message.author
             }
                 let url = defineduser.displayAvatarURL.endsWith(".webp") ? defineduser.displayAvatarURL.slice(20, 20) + ".png" : defineduser.displayAvatarURL;
                 jimp.read(url, (err, ava) => {
                     if (err) return console.log(err);
                     ava.getBuffer(jimp.MIME_PNG, (err, buf) => {
                         if (err) return console.log(err);
 
                         let Avatar = Canvas.Image;
                         let ava = new Avatar;
                         ava.src = buf;
                         ctx.drawImage(ava, 112 , 40, 75, 75);

                         var status;
     if (defineduser.presence.status === 'online') {
         status = 'ONLINE';
  ctx.fillStyle = `#2ce032`;
  ctx.beginPath();
  ctx.arc(179, 107, 10, 0, Math.PI*2, true);
  ctx.closePath();
  ctx.fill();
 
     } else if (defineduser.presence.status === 'dnd') {
         status = 'DND';
         ctx.fillStyle = `#ff0000`;
  ctx.beginPath();
  ctx.arc(179, 107, 8, 0, Math.PI*2, true);
  ctx.closePath();
  ctx.fill();
     } else if (defineduser.presence.status === 'idle') {
         status = 'IDLE';
         ctx.fillStyle = `#f4d32e`;
  ctx.beginPath();
  ctx.arc(179, 107, 10, 0, Math.PI*2, true);
  ctx.closePath();
  ctx.fill();
     } else if (defineduser.presence.status === 'offline') {
         status = 'INVISIABLE';
         ctx.fillStyle = `#898988`;
  ctx.beginPath();
  ctx.arc(179, 107, 10, 0, Math.PI*2, true);
  ctx.closePath();
  ctx.fill();
     }
 
 
                                               var time2;
       if(mentionned){
           var time2 = `${dateFormat(message.mentions.users.first.joinedAt)}`;
       } else {
           var time2 = `${dateFormat(message.member.joinedAt)}`;
 
       }
 
                         ctx.font = 'Bold 15px Arial ';
                         ctx.fontSize = '15px';
                         ctx.fillStyle = "#ffffff";
                         ctx.textAlign = "center";
                         ctx.fillText(status, 70 , 108 );
 
                          ctx.font = 'Bold 13px Arial';
                         ctx.fontSize = '13px';
                         ctx.fillStyle = "#ffffff";
                         ctx.textAlign = "center";
                         ctx.fillText(`${message.author.presence.game === null ? "No Status" : message.author.presence.game.name}`, 150.00   , 180  );
 
 
                         ctx.font = 'Bold 20px Arial ';
                         ctx.fontSize = '15px';
                         ctx.fillStyle = "#ffffff";
                         ctx.textAlign = "center";
                         ctx.fillText(`${defineduser.username}`, 150.50 , 140);
 
 
                         ctx.font = 'Bold 15px Arial';
                         ctx.fontSize = '15px';
                         ctx.fillStyle = "#ffffff";
                         ctx.textAlign = "center";
                         ctx.fillText(`#${defineduser.discriminator}`, 227  , 108);
 
                         var time2;
       if(mentionned){
           var time2 = `${dateFormat(message.mentions.users.first.joinedAt)}`;
       } else {
           var time2 = `${dateFormat(message.member.joinedAt)}`;
 
       }
 
                         ctx.font = 'Bold 13px Arial ';
                         ctx.fontSize = '13px';
                         ctx.fillStyle = "#ffffff";
                         ctx.textAlign = "center";
                         ctx.fillText(`${moment(defineduser.createdTimestamp).fromNow()}`, 179 , 226 );
                         ctx.font = 'Bold 13px Arial ';
                         ctx.fontSize = '13px';
                         ctx.fillStyle = "#ffffff";
                         ctx.textAlign = "center";
                         ctx.fillText(`${moment(h.joinedAt).format('YYYY/M/D HH:mm:ss')}`, 179 , 253);
 
  message.channel.sendFile(canvas.toBuffer())
 
 
         })
     })
 
 
 
 
  }
 
  })
 
 
    client3.on("message", msg => {
             var prefix = "p#";
    if(msg.content.startsWith (prefix + "id")) {
      if(!msg.channel.guild) return msg.reply('**:x: اسف لكن هذا الامر للسيرفرات فقط **');
        const embed = new Discord.RichEmbed();
    embed.addField(":cloud_tornado:  الاسم", `**[ ${msg.author.username}#${msg.author.discriminator} ]**`, true)
            .addField(":id:  الايدي", `**[ ${msg.author.id} ]**`, true)
            .setColor("RANDOM")
            .setFooter(msg.author.username , msg.author.avatarURL)
            .setThumbnail(`${msg.author.avatarURL}`)
            .setTimestamp()
            .setURL(`${msg.author.avatarURL}`)
            .addField(':spy:  الحالة', `**[ ${msg.author.presence.status.toUpperCase()} ]**`, true)
            .addField(':satellite_orbital:   يلعب', `**[ ${msg.author.presence.game === null ? "No Game" : msg.author.presence.game.name} ]**`, true)
            .addField(':military_medal:  الرتب', `**[ ${msg.member.roles.filter(r => r.name).size} ]**`, true)
            .addField(':robot:  هل هو بوت', `**[ ${msg.author.bot.toString().toUpperCase()} ]**`, true);
        msg.channel.send({embed: embed})
        }
  });
  client3.on('message', message => {
             if (message.content.startsWith(prefix + "user")) {
       var args = message.content.split(" ").slice(1);
       let user = message.mentions.users.first();
       var men = message.mentions.users.first();
          var heg;
          if(men) {
              heg = men
          } else {
              heg = message.author
          }
        var mentionned = message.mentions.members.first();
           var h;
          if(mentionned) {
              h = mentionned
          } else {
              h = message.member
          }
                 moment.locale('ar-TN');
        var id = new  Discord.RichEmbed()
        .setAuthor(message.author.username, message.author.avatarURL)
      .setColor("#707070")
      .addField(': دخولك لديسكورد قبل', `${moment(heg.createdTimestamp).format('YYYY/M/D HH:mm:ss')} **\n** \`${moment(heg.createdTimestamp).fromNow()}\`` ,true)
      .addField(': انضمامك لسيرفر قبل', `${moment(h.joinedAt).format('YYYY/M/D HH:mm:ss')} \n \`${moment(h.joinedAt).fromNow()}\``, true)
      .setFooter(`PlexBot`, 'https://images-ext-2.discordapp.net/external/JpyzxW2wMRG2874gSTdNTpC_q9AHl8x8V4SMmtRtlVk/https/orcid.org/sites/default/files/files/ID_symbol_B-W_128x128.gif')
      .setThumbnail(heg.avatarURL);
      message.channel.send(id)
  }       });

  
const profile = JSON.parse(fs.readFileSync('./profile.json', "utf8"));
client3.on("message", message => {
  if (message.author.bot) return;
  if(!message.channel.guild)return;
  if (!profile[message.author.id]) profile[message.author.id] = {
    info: 'p#inforprofile To Set The Info',
    rep: 0,
    reps: 'NOT YET',
    lastDaily:'Not Collected',
    level: 0,
    points: 0,
  };
fs.writeFile('./profile.json', JSON.stringify(profile), (err) => {
if (err) console.error(err);
})
});
//لايك//
client3.on('message', message => {
  if (message.author.bot) return;
    var sender = message.author
    if (message.author.id === client3.user.id) return;
  if(!message.channel.guild) return;
    if(message.content.startsWith(prefix + 'لايك')) {
    let ment = message.mentions.users.first()
if (games[sender.id].lastDaily != moment().format('day')) {
    games[sender.id].lastDaily = moment().format('day')
        if(!ment) return message.channel.send(`**:mag: |  ${message.author.username}, the user could not be found.    **`);
        if(ment = message.author.id) return message.channel.send(`**${message.author.username}, you cant give yourself a reputation !**`)
    profile[ment.id].rep += 1;
    message.channel.send(`** :up:  |  ${message.author.username} has given ${ment} a reputation point!**`)
    }else {
    message.channel.send(`**:stopwatch: |  ${message.author.username}, you can award more reputation  ${moment().endOf('day').fromNow()} **`)
    }

    }
    });
//هدية//
client3.on("message", (message) => {
  var sender = message.author
if(message.content.startsWith(prefix + 'daily')) {
if (games[sender.id].lastDaily != moment().format('day')) {
    games[sender.id].lastDaily = moment().format('day')
 games[message.author.id].credits += 200;
    message.channel.send(`**${message.author.username} you collect your \`200\` :dollar: daily pounds**`)
} else {
    message.channel.send(`**:stopwatch: | ${message.author.username}, your daily :yen: credits refreshes ${moment().endOf('day').fromNow()}**`)
}
}
})
//مصاري//
client3.on("message", (message) => {
  if (message.author.bot) return;
    if (message.author.id === client3.user.id) return;
  if(!message.channel.guild) return;
if (message.content === 'p#credits') {
message.channel.send(`** ${message.author.username}, your :credit_card: balance is ${games[message.author.id].credits}.**`)
}
});
//معلوماتي
client3.on('message', message => {
  if (message.author.bot) return;
    if (message.author.id === client3.user.id) return;
  if(!message.channel.guild) return;
        if(message.content.startsWith('p#inforprofile')) {
        let args = message.content.split(' ').slice(1).join(' ')
        if(!args) return message.channel.send(`**${message.author.username}, يرجى كتابة المعلومات**`)
        if(args.length > 25) return message.channel.send(`**${message.author.username} يجب ان لا تكون المعلومات اكثر من 25 حرف**`)
        profile[message.author.id].info = args
        message.channel.send(`**${message.author.username}**| تم تغير معلوماتك الى  =${args}>`)
    }
});
//لفل
client3.on('message', message => {
  if (message.author.bot) return;
    if (message.author.id === client3.user.id) return;
  if(!message.channel.guild) return;
var sender = message.author;
const games =profile;
games[sender.id].points += 1;
if (!profile[sender.id].points) profile[sender.id].points= 0 ;
if (!profile[sender.id].level) profile[sender.id].level= 0 ;
if (profile[sender.id].points == 50) profile[sender.id].level = 1 ;

if (profile[sender.id].points == 120) profile[sender.id].level = 2;

if (profile[sender.id].points == 260) profile[sender.id].level = 3;

if (profile[sender.id].points == 400) profile[sender.id].level = 4;

if (profile[sender.id].points == 560) profile[sender.id].level = 5;

if (profile[sender.id].points == 780) profile[sender.id].level = 6;

if (profile[sender.id].points == 900) profile[sender.id].level = 7;

if (profile[sender.id].points == 1100) profile[sender.id].level = 8;

if (profile[sender.id].points == 1350) profile[sender.id].level = 9;

if (profile[sender.id].points == 1700) profile[sender.id].level = 10;

if (profile[sender.id].points == 2100) profile[sender.id].level = 11;

if (profile[sender.id].points == 2300) profile[sender.id].level = 12;

if (profile[sender.id].points == 2500) profile[sender.id].level = 13;

if (profile[sender.id].points == 2800) profile[sender.id].level = 14;

if (profile[sender.id].points == 3200) profile[sender.id].level = 15;

if (profile[sender.id].points == 3600) profile[sender.id].level = 16;

if (profile[sender.id].points == 4000) profile[sender.id].level = 17;

if (profile[sender.id].points == 4500) profile[sender.id].level = 18;

if (profile[sender.id].points == 5000) profile[sender.id].level = 19;

if (profile[sender.id].points == 5700) profile[sender.id].level = 20;

if (profile[sender.id].points == 6200) profile[sender.id].level = 21;

if (profile[sender.id].points == 6800) profile[sender.id].level = 22;

if (profile[sender.id].points == 7500) profile[sender.id].level = 23;

if (profile[sender.id].points == 8500) profile[sender.id].level = 24;

if (profile[sender.id].points == 9600) profile[sender.id].level = 25;

if (profile[sender.id].points == 11000) profile[sender.id].level = 26;

if (profile[sender.id].points == 12500) profile[sender.id].level = 27;

if (profile[sender.id].points == 14000) profile[sender.id].level = 28;

if (profile[sender.id].points == 16000) profile[sender.id].level = 29;

if (profile[sender.id].points == 18500) profile[sender.id].level = 30;

if (profile[sender.id].points == 20000) profile[sender.id].level = 31;

if (profile[sender.id].points == 22000) profile[sender.id].level = 32;

if (profile[sender.id].points == 24500) profile[sender.id].level = 33;

if (profile[sender.id].points == 27000) profile[sender.id].level = 34;

if (profile[sender.id].points == 30000) profile[sender.id].level = 35;

if (profile[sender.id].points == 33000) profile[sender.id].level = 36;

if (profile[sender.id].points == 36000) profile[sender.id].level = 37;

if (profile[sender.id].points == 40000) profile[sender.id].level = 38;

if (profile[sender.id].points == 45000) profile[sender.id].level = 39;

if (profile[sender.id].points == 50000) profile[sender.id].level = 40;

if (profile[sender.id].points == 56000) profile[sender.id].level = 41;

if (profile[sender.id].points == 61000) profile[sender.id].level = 42;

if (profile[sender.id].points == 68000) profile[sender.id].level = 43;

if (profile[sender.id].points == 75000) profile[sender.id].level = 44;

if (profile[sender.id].points == 83000) profile[sender.id].level = 45;

if (profile[sender.id].points == 90000) profile[sender.id].level = 46;

if (profile[sender.id].points == 95000) profile[sender.id].level = 47;

if (profile[sender.id].points == 100000) profile[sender.id].level = 48;

if (profile[sender.id].points == 106000) profile[sender.id].level = 49;

if (profile[sender.id].points == 111000) profile[sender.id].level = 50;
});
//**بروفايل**//
client3.on("message", message => {
  if (message.author.bot) return;
  if(!message.channel.guild) return;
if (message.content.startsWith("p#profile")) {
                               let user = message.mentions.users.first();
         var men = message.mentions.users.first();
            var heg;
            if(men) {
                heg = men
            } else {
                heg = message.author
            }
          var mentionned = message.mentions.members.first();
             var h;
            if(mentionned) {
                h = mentionned
            } else {
                h = message.member
            }
            var ment = message.mentions.users.first();
            var getvalueof;
            if(ment) {
              getvalueof = ment;
            } else {
              getvalueof = message.author;
            }//var ghost = tf 3lek xD
   var mentionned = message.mentions.users.first();

    var client3;
      if(mentionned){
          var client3 = mentionned;
      } else {
          var client3 = message.author;

      }
  const w = ['./PicsArt_08-28-06.21.07.png'];
if (!games[getvalueof.id]) games[getvalueof.id] = {wins: 0,loses: 0,points: 0,total: 0,credits: 100,level: 1,};
            let Image = Canvas.Image,
            canvas = new Canvas(300, 300),
            ctx = canvas.getContext('2d');
      fs.readFile(`${dataPro[getvalueof.id].wallSrc}`, function (err, Background) {
          fs.readFile(`${w[0]}`, function (err, Background) {
          if (err) return console.log(err);
          let BG = Canvas.Image;
          let ground = new Image;
          ground.src = Background;
          ctx.drawImage(ground, 0, 0, 297, 305);
});
          if (err) return console.log(err);
          let BG = Canvas.Image;
          let ground = new Image;
          ground.src = Background;
          ctx.drawImage(ground, 0, 0, 300, 305);
});
                let url = getvalueof.displayAvatarURL.endsWith(".webp") ? getvalueof.displayAvatarURL.slice(5, -20) + ".png" : getvalueof.displayAvatarURL;
                jimp.read(url, (err, ava) => {
                    if (err) return console.log(err);
                    ava.getBuffer(jimp.MIME_PNG, (err, buf) => {
                        if (err) return console.log(err);


                        //Avatar
                       let Avatar = Canvas.Image;
                        let ava = new Avatar;
                        ava.src = buf;
                     ctx.drawImage(ava, 8, 43, 80, 85); // احداثيات صورتك

                        //ur name
                        ctx.font = 'bold 16px Arial'; // حجم الخط و نوعه
                        ctx.fontSize = '40px'; // عرض الخط
                        ctx.fillStyle = "#000000"; // لون الخط
                        ctx.textAlign = "left"; // محاذا ة النص
                        ctx.fillText(`${getvalueof.username}`, 130, 125) // احداثيات اسمك

                         //bord
                        ctx.font = "regular 12px Cairo" // نوع الخط وحجمه
                        ctx.fontSize = '50px'; // عرض الخط
                        ctx.fillStyle = "#f0ff00" // لون الخط
                        ctx.textAlign = "left"; // محاذا ة النص
                        ctx.fillText(`Soon...`, 170, 198) // احداثيات ترتيبك

                        //credit
                        ctx.font = "bold 10px Arial" // نوع الخط وحجمه
                        ctx.fontSize = '10px'; // عرض الخط
                        ctx.fillStyle = '#FFFFFF' // لون الخط
                        ctx.textAlign = "left"; // محاذا ة النص
                        ctx.fillText(`$ ${games[getvalueof.id].credits}`, 156, 163) // احداثيات المصاري

                        //poits
                        ctx.font = "bold 13px Arial" // ن
                        ctx.fontSize = '10px'; // عرض الخطوع الخط وحجمه
                        ctx.fillStyle = "#FFFFFF" // لون الخط
                        ctx.textAlign = "left"; // محاذا ة النص
                        ctx.fillText(`${profile[getvalueof.id].points}`, 173, 182) // احداثيات النقاط

                        //Level
                        ctx.font = "bold 27px Arial" // نوع الخط و حجمه
                        ctx.fontSize = '50px'; // عرض الخط
                        ctx.fillStyle = "#FFFFFF" // لون الخط
                        ctx.textAlign = "left"; // محاذا ة النص
                        ctx.fillText(`${profile[getvalueof.id].level}`, 30, 200) // احداثيات اللفل

                        //info
                        ctx.font = "blod 13px Arial" // ن
                        ctx.fontSize = '10px'; // عرض الخطوع الخط وحجمه
                        ctx.fillStyle = "#FFFFFF" // لون الخط
                        ctx.textAlign = "left"; // محاذا ة النص
                        ctx.fillText(`${profile[getvalueof.id].info}`, 118, 40) // احداثيات النقاط

                        // REP
                        ctx.font = "bold 27px Arial";
                        ctx.fontSize = "100px";
                        ctx.fillStyle = "#FFFFFF";
                        ctx.textAlign = "left";
                        ctx.fillText(`+${profile[getvalueof.id].rep}`, 18,270)

message.channel.sendFile(canvas.toBuffer())
})
})
}
});
    client.on('message' , async (message) => {
var prefix = "p#"
    if(message.content.startsWith(prefix + "topinvites")) {
if(message.author.bot) return;
if(!message.channel.guild) return message.reply(' Error : \` Server Command \`');
  var invites = await message.guild.fetchInvites();
    invites = invites.array();
    arraySort(invites, 'uses', { reverse: true });
    let possibleInvites = ['User Invited |  Uses '];
    invites.forEach(i => {
        if (i.uses === 0) { 
            return;
        }
      possibleInvites.push(['\n\ ' +'<@'+ i.inviter.id +'>' + '  :  ' +   i.uses]);
     //معلومه بسيطه يمديك تكرر العمليهه أكثر من مره
    })
    const embed = new Discord.RichEmbed()
 .setColor('RANDOM')
    .addField("Top Invites." ,`${(possibleInvites)}`)

    message.channel.send(embed)
    }
});










client.on('message', message => {
   if(message.content.startsWith(prefix +"bans")) {
      message.guild.fetchBans()
      .then(bans => message.channel.send(`The ban count **${bans.size}** Person`))
.catch(console.error);
}
});

client.on('message', message => {
  if (message.content === "p#banslist") {
  if(!message.channel.guild) return;
      var bans = message.guild.fetchBans.map(banslist => `${bans.name}, `).join(' ')
      const embed = new Discord.RichEmbed()
      .setColor('RANDOM')
      .addField('bans:',`**[${bans}]**`)
      message.channel.sendEmbed(embed);
  }
});
  client.on('message', message => {
            if(!message.channel.guild) return;
  if(message.content.startsWith('p#bc')) {
  if(!message.channel.guild) return message.channel.send('**هذا الأمر فقط للسيرفرات**').then(m => m.delete(5000));
if(!message.member.hasPermission('ADMINISTRATOR')) return      message.channel.send('**للأسف لا تمتلك صلاحية** `ADMINISTRATOR`' );
  let args = message.content.split(" ").join(" ").slice(2 + prefix.length);
  let copy = "Plex Bot";
  let request = `Requested By ${message.author.username}`;
  if (!args) return message.reply('**يجب عليك كتابة كلمة او جملة لإرسال البرودكاست**');message.channel.send(`**هل أنت متأكد من إرسالك البرودكاست؟ \nمحتوى البرودكاست:** \` ${args}\``).then(msg => {
  msg.react('✅')
  .then(() => msg.react('❌'))
  .then(() =>msg.react('✅'))

  let reaction1Filter = (reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id;
  let reaction2Filter = (reaction, user) => reaction.emoji.name === '❌' && user.id === message.author.id;
     let reaction1 = msg.createReactionCollector(reaction1Filter, { time: 12000 });
  let reaction2 = msg.createReactionCollector(reaction2Filter, { time: 12000 });
  reaction1.on("collect", r => {
  message.channel.send(`☑ |   ${message.guild.members.size} يتم ارسال البرودكاست الى عضو `).then(m => m.delete(5000));
  message.guild.members.forEach(m => {
var bc = new
Discord.RichEmbed()
.setColor('RANDOM')
.setTitle(':mega: برودكاست')
.addField('🔰السيرفر🔰', message.guild.name)
.addField('🚩المرسل🚩', message.author.username)
.addField('📜الرسالة📜', args)
.setThumbnail('https://a.top4top.net/p_1008gqyyd1.png')
.setFooter(copy, client.user.avatarURL);
  m.send({ embed: bc })
  msg.delete();
  })
  })
  reaction2.on("collect", r => {
  message.channel.send(`**Broadcast Canceled.**`).then(m => m.delete(5000));
  msg.delete();
  })
  })
  }
  })



client3.on('message', message => {
if (message.content.startsWith("p#tr")) {

const translate = require('google-translate-api');
let toTrans = message.content.split(' ').slice(1);
let language;

language = toTrans[toTrans.length - 2] === 'to' ? toTrans.slice(toTrans.length - 2, toTrans.length)[1].trim() : undefined;
if (!language) {
return message.reply(`Please supply valid agruments.\n**Example** \`p#tr [text] to [language]\``);
}
let finalToTrans = toTrans.slice(toTrans.length - toTrans.length, toTrans.length - 2).join(' ');
translate(finalToTrans, {to: language}).then(res => {
   message.channel.send({embed: {
       color: 3447003,
       author: {
         name: 'Plex translator',
         icon_url: client3.user.avatarURL
       },
       fields: [{
           name: "Plex",
           value: `**From:** ${res.from.language.iso}\n\`\`\`${finalToTrans}\`\`\`\n**To: **${language}\n\`\`\`${res.text}\`\`\``
         }
       ],
       timestamp: new Date(),
       footer: {
         icon_url: client3.user.avatarURL,
         text: "Plex"
       }
     }
   });
}).catch(err => {
message.channel.send({
   embed: {
       description: '❌ We could not find the supplied language.',
       color: 0xE8642B
   }
});
});
}
});

client3.on('message', message => {
var prefix = "p#"
let args = message.content.split(' ').slice(1);
if(message.content.startsWith(prefix + 'role')) {
let member = message.mentions.users.first();
let role = args.join(' ').replace(member, '').replace(args[0], '').replace(' ', '');
console.log(role);
if(member) {
     if(role.startsWith('-')) {
       let roleRe = args.join(' ').replace(member, '').replace(args[0], '').replace('-', '').replace(' ', '');
       console.log(roleRe);
       let role1 = message.guild.roles.find('name', roleRe);
       console.log(`hi`);
const ee =new Discord.RichEmbed()
.setDescription('**:x: I can’t find the role.**')
.setFooter('Requested By '+message.author.username,message.author.avatarURL)
if(!role1) return message.channel.send(ee);                message.guild.member(member).removeRole(role1.id);

            const e = new Discord.RichEmbed()

        .setDescription(':white_check_mark:** Changed Roles For **'+member+'**,** '+'**'+'-'+role1.name+'**')
       .setFooter('Requested By '+message.author.username,message.author.avatarURL)
       .setColor('BLACK')
        message.channel.send(e)
   } else if(!role.startsWith('-')) {
       let roleRe = args.join(' ').replace(member, '').replace(args[0], '').replace('-', '').replace(' ', '');
       let role1 = message.guild.roles.find('name', roleRe);
const ee =new Discord.RichEmbed()
.setDescription('**:x: I can’t find the role.**')
.setFooter('Requested By : '+message.author.username,message.author.avatarURL)
if(!role1) return message.channel.send(ee);                message.guild.member(member).addRole(role1);
       const e = new Discord.RichEmbed()

       .setDescription(':white_check_mark:** Changed Roles For **'+member+'**,** '+'**'+'+'+role1.name+'**')
       .setFooter('Requested By : '+message.author.username,message.author.avatarURL)
       .setColor('BLACK')
        message.channel.send(e)
   } else {
       message.reply(`يجب عليك كتابة اسم الرتبة`);
   }
}
else if(args[0] == 'all') {
if(role.startsWith('p#')) {
let roleRe = args.join(' ').replace(member, '').replace(args[0], '').replace('-', '').replace(' ', '');
let role1 = message.guild.roles.find('name', roleRe);
          message.channel.send(`الرجاء الانتظار حتى يتم الانتهاء من الامر`).then(msg =>{
  message.guild.members.forEach(m => {
   message.guild.member(m).removeRole(role1.id);
});
msg.edit(`** :white_check_mark:   Done...\n**` +role1.name+`** Has Taken From __${message.guild.members.size}__ Member**`);
});
}
if(role) {
let role1 = message.guild.roles.find('name', role);
if(!role1) return;
message.channel.send(`الرجاء الانتظار حتى يتم الانتهاء من الامر`).then(msg => {
message.guild.members.forEach(m => {
   message.guild.member(m).addRole(role1);
});
msg.edit(`** :white_check_mark:   Done...\n**` +  role1.name+`** Has Given To __${message.guild.members.size}__ Members **`);
});
}
} else if(args[0] == 'humans') {
if(role.startsWith('p#')) {
let roleRe = args.join(' ').replace(member, '').replace(args[0], '').replace('-', '').replace(' ', '');
let role1 = message.guild.roles.find('name', roleRe);
          message.channel.send(`الرجاء الانتظار حتى يتم الانتهاء من الامر`).then(msg =>{
  message.guild.members.forEach(m => {
   message.guild.member(m).removeRole(role1.id);
});
msg.edit(`** :white_check_mark:   Done...\n**` +role1.name+`** Has Taken From __${message.guild.members.size}__ Member**`);
});
}

if(role) {
let role1 = message.guild.roles.find('name', role);

const ee =new Discord.RichEmbed()
.setDescription('I Cann’t Find This Role')
.setFooter('Requested By : '+message.author.username,message.author.avatarURL)
if(!role1) return message.channel.send(ee);
message.channel.send(`الرجاء الانتظار حتى يتم الانتهاء من الامر`).then(msg => {
   message.guild.members.filter(m =>m.user.bot == false).forEach(m => {
       message.guild.member(m).addRole(role1);
   });
msg.edit(`** :white_check_mark:   Done...**`);
});
}
} else if(args[0] == 'bots') {
if(role.startsWith('p#')) {
let roleRe = args.join(' ').replace(member, '').replace(args[0], '').replace('-', '').replace(' ', '');
let role1 = message.guild.roles.find('name', roleRe);
          message.channel.send(`الرجاء الانتظار حتى يتم الانتهاء من الامر`).then(msg =>{
  message.guild.members.forEach(m => {
   message.guild.member(m).removeRole(role1.id);
});
msg.edit(`** :white_check_mark:  Done...**`);
});
}
if(role) {
let role1 = message.guild.roles.find('name', role);
const ee =new Discord.RichEmbed()
.setDescription('I Cann’t Find This Role')
.setFooter('Requested By : '+message.author.username,message.author.avatarURL)
if(!role1) return message.channel.send(ee);
message.channel.send(`الرجاء الانتظار حتى يتم الانتهاء من الامر`).then(msg => {
   message.guild.members.filter(m =>m.user.bot == true).forEach(m => {
       message.guild.member(m).addRole(role1);
   });
msg.edit(`** :white_check_mark:  Done...\n**` +role1.name+`** Has Given To __${message.guild.members.size}__ Member**`);
});
}
}
}
});
client3.on('message' , message => {
var prefix = "p#";
if(message.author.bot) return;

if(message.content.startsWith(prefix + "xo")) {
let array_of_mentions = message.mentions.users.array();
let symbols = [':o:', ':heavy_multiplication_x:']
var grid_message;

if (array_of_mentions.length == 1 || array_of_mentions.length == 2) {
let random1 = Math.floor(Math.random() * (1 - 0 + 1)) + 0;
let random2 = Math.abs(random1 - 1);
if (array_of_mentions.length == 1) {
random1 = 0;
random2 = 0;
}
let player1_id = array_of_mentions[random1].id;
let player2_id = array_of_mentions[random2].id;
var turn_id = player1_id;
var symbol = symbols[0];
let initial_message = `مباراة بين <@${player1_id}> و <@${player2_id}>!`;
if (player1_id == player2_id) {
initial_message += '\n_(من الخاسر, انت تلعب هذا الدور مع نفسك :joy:)_'
}
message.channel.send(`xo! ${initial_message}`)
.then(console.log("Successful tictactoe introduction"))
.catch(console.error);
message.channel.send(':one::two::three:' + '\n' +
                ':four::five::six:' + '\n' +
                ':seven::eight::nine:')
.then((new_message) => {
grid_message = new_message;
})
.then(console.log("Successful xo game initialization"))
.catch(console.error);
message.channel.send('يتم تحميل... انتظر الريئاكشن :ok:')
.then(async (new_message) => {
await new_message.react('1⃣');
await new_message.react('2⃣');
await new_message.react('3⃣');
await new_message.react('4⃣');
await new_message.react('5⃣');
await new_message.react('6⃣');
await new_message.react('7⃣');
await new_message.react('8⃣');
await new_message.react('9⃣');
await new_message.react('🆗');
await new_message.edit(`انه دور <@${turn_id}> علامتك هي${symbol}`)
.then((new_new_message) => {
require('./alpha.js')(client3, message, new_new_message, player1_id, player2_id, turn_id, symbol, symbols, grid_message);
})
.then(console.log("Successful xo listener initialization"))
.catch(console.error);
})
.then(console.log("Successful xo react initialization"))
.catch(console.error);
}
else {
message.reply(`_مهلا مهلا_ :anger: \`(استعمل هذا: ${prefix}xo @player1 @player2)\``)
.then(console.log("Successful error reply"))
.catch(console.error);
}
}
});
client3.on('message', message => {
let args = message.content.split(' ').slice(1);
if(message.content.split(' ')[0] == 'p#color'){
const embedd = new Discord.RichEmbed()
.setFooter('Requested by '+message.author.username, message.author.avatarURL)
.setDescription(`**لا يوجد لون بهذا الأسم ** :x: `)
.setColor(`ff0000`)

if(!isNaN(args) && args.length > 0)


if    (!(message.guild.roles.find("name",`${args}`))) return  message.channel.sendEmbed(embedd);


var a = message.guild.roles.find("name",`${args}`)
 if(!a)return;
const embed = new Discord.RichEmbed()

.setFooter('Requested by '+message.author.username, message.author.avatarURL)
.setDescription(`**Done , تم تغير لونك . :white_check_mark: **`)

.setColor(`${a.hexColor}`)
message.channel.sendEmbed(embed);
if (!args)return;
setInterval(function(){})
   let count = 0;
   let ecount = 0;
for(let x = 1; x < 201; x++){

message.member.removeRole(message.guild.roles.find("name",`${x}`))

}
 message.member.addRole(message.guild.roles.find("name",`${args}`));


}
});


client3.on('message', message => {
if (message.content.startsWith("p#botinfo")) {
message.channel.send({
embed: new Discord.RichEmbed()
   .setAuthor(client3.user.username,client3.user.avatarURL)
   .setThumbnail(client3.user.avatarURL)
   .setColor('RANDOM')
   .setTitle('``INFO  Plex Bot`` ')
   .addField('``My Ping``' , [`${Date.now() - message.createdTimestamp}` + 'MS'], true)
   .addField('``servers``', [client3.guilds.size], true)
   .addField('``channels``' , `[ ${client3.channels.size} ]` , true)
   .addField('``Users``' ,`[ ${client3.users.size} ]` , true)
   .addField('``My Name``' , `[ ${client3.user.tag} ]` , true)
   .addField('``My ID``' , `[ ${client3.user.id} ]` , true)
   .addField("**Servers:**" , `[ ${client3.guilds.size} ]`)
   .addField("**Users:**", `[ ${client3.users.size} ]`)
   .addField("**Channels:**", ` [ ${client3.channels.size} ]`)
         .addField('``My Prefix``' , `[ p# ]` , true)
         .addField('``My Language``' , `[ JavaScript ]` , true)
         .addField('``Bot Version``' , `[ v0.1 ]` , true)
         .setFooter('By | <@429972030092476437>')
})
}
});


client3.on('ready', () => {
client3.user.setGame(`p#help | p#support`,'https://www.twitch.tv/fofodiscord');
});



const request = require('request')
var Canvas = require('canvas')
var jimp = require('jimp')



console.log('hello')









let points = {}

client3.on('message', message => {
if (!points[message.author.id]) points[message.author.id] = {
points: 0,
};
if (message.content.startsWith(prefix + 'فكك')) {
if(!message.channel.guild) return message.reply('**لا تلعب عندي العب بالسيرفرات**').then(m => m.delete(3000));

const type = require('./gamesbombot/fkk.json');
const item = type[Math.floor(Math.random() * type.length)];
const filter = response => {
return item.answers.some(answer => answer.toLowerCase() === response.content.toLowerCase());
};
message.channel.send('**الحق عندك 15 ثانية**').then(msg => {


msg.channel.send(`${item.type}`).then(() => {
 message.channel.awaitMessages(filter, { maxMatches: 1, time: 15000, errors: ['time'] })
 .then((collected) => {
 message.channel.send(`${collected.first().author} ✅ أصلي عليك`);
     let points = {}
     let userData = points[message.author.id];
     let userdata = require('./Points.json');
     userData.points++;
   })
   .catch(collected => {
     message.channel.send(`🕓😀أنتهى الوقت أعد العب مرة آخرى😀🕓`);
   })
 })
})
}
});

client3.on("message", async message => {
if(message.author.bot) return;
if(message.channel.type === "dm") return;
let prefix = 'p#'
let messageArray = message.content.split (" ");
let args = messageArray.slice(1);

if (message.content.startsWith(prefix + "8ball")) {


if(!args[1]) return message.reply("?");
let replies = ["يب", "لا.", "ما بعرف.", "اسالني لاحقا لو سمحت"];

let result = Math.floor((Math.random() * replies.length));
let question = args.slice(1).join(" ");

message.channel.sendMessage(`${replies[Math.floor(Math.random() * replies.length)]}`);   ///Alpha Codes
            if (!args[0]) {
       message.edit('1')
       return;
     }
 }
});



client3.on('message', message => {
if(message.content.startsWith("p#slots")) {
let slot1 = ['🍏', '🍇', '🍒', '🍍', '🍅', '🍆', '🍑', '🍓'];
let slot2 = ['🍏', '🍇', '🍒', '🍍', '🍅', '🍆', '🍑', '🍓'];
let slot3 = ['🍏', '🍇', '🍒', '🍍', '🍅', '🍆', '🍑', '🍓'];
let slots1 = `${slot1[Math.floor(Math.random() * slot1.length)]}`;
let slots2 = `${slot1[Math.floor(Math.random() * slot1.length)]}`;
let slots3 = `${slot1[Math.floor(Math.random() * slot1.length)]}`;
let we;
if(slots1 === slots2 && slots2 === slots3) {
we = "😀لقد ربحت يا بطل😀"
} else {
we = "😣لقد خسرت حظ آوفر😣"
}
message.channel.send(`${slots1} | ${slots2} | ${slots3} - ${we}`)
}
});





client3.on('message', message => {
if(message.content.startsWith("p#حجرة")) {
let slot1 = ['✂ورقة📄', '🗿حجرة🗿', '✂مقص📄'];
let slots1 = `${slot1[Math.floor(Math.random() * slot1.length)]}`;
let we;
if(slots1) {
we = "🎮ألعب مرة آخرى🎮"
} else {
we = "😣لقد خسرت حظ آوفر😣"
}
message.channel.send(`${slots1} - ${we}`)
}
});



client3.on('message', message => {
if(message.content.startsWith("p#ورقة")) {
let slot1 = ['✂ورقة📄', '🗿حجرة🗿', '✂مقص📄'];
let slots1 = `${slot1[Math.floor(Math.random() * slot1.length)]}`;
let we;
if(slots1) {
we = "🎮ألعب مرة آخرى🎮"
} else {
we = "😣لقد خسرت حظ آوفر😣"
}
message.channel.send(`${slots1} - ${we}`)
}
});

client3.on('message', message => {
if (message.content === "p#server") {
let embed = new Discord.RichEmbed()
.setColor("RANDOM")
.setThumbnail(message.author.avatarURL)
.setTitle(`info about ${message.guild.name}`)
.addField("Server Owner 👑",`➥ ` + `${message.guild.owner.user.username}`, true)
.addField('Server ID 🆔',`➥` + message.guild.id, true)
.addField("Owner Tag",`➥ ` +  `#` + message.guild.owner.user.discriminator, true)
.addField("Owner ID 🆔",`➥ ` + message.guild.owner.user.id, true)
.addField("Server Region📡",`➥ ` + message.guild.region, true)
.addField("Server Member Size🏧",`➥ ` + message.guild.memberCount, true)
.addField("Server Channels Number🏧",`➥ ` + message.guild.channels.size, true)
.addField("Server Roels Number🏧",`➥ ` + message.guild.roles.size, true)
.addField("AFK channel💤",`➥ ` + message.guild.afkChannel || 'Null', true)
.addField("Server Created AT",`➥ ` + message.guild.createdAt, true)
.addField(`info about ${message.author.username}`, `➥ `)
.addField("Name",`➥ ` + `${message.author.username}`, true)
.addField('Tag',`➥ ` + "#" +  message.author.discriminator, true)
.addField("ID 🆔",`➥ ` + message.author.id, true)
.addField(" Account Created At",`➥ ` + message.author.createdAt, true)
.setTimestamp()
.setFooter(message.author.tag, message.author.avatarURL)


message.channel.sendEmbed(embed);
}
});




client3.on('message', message => {
if(message.content.startsWith("p#مقص")) {
let slot1 = ['✂ورقة📄', '🗿حجرة🗿', '✂مقص📄'];
let slots1 = `${slot1[Math.floor(Math.random() * slot1.length)]}`;
let we;
if(slots1) {
we = "🎮ألعب مرة آخرى🎮"
} else {
we = "😣لقد خسرت حظ آوفر😣"
}
message.channel.send(`${slots1} - ${we}`)
}
});




client3.on('message', message => {
if (!points[message.author.id]) points[message.author.id] = {
points: 0,
};
if (message.content.startsWith(prefix + 'عواصم')) {
if(!message.channel.guild) return message.reply('**هذا الأمر للسيرفرات فقط**').then(m => m.delete(3000));

const type = require('./gamesbombot/3awasem.json');
const item = type[Math.floor(Math.random() * type.length)];
const filter = response => {
return item.answers.some(answer => answer.toLowerCase() === response.content.toLowerCase());
};
message.channel.send('**👑لديك 15 ثانية للإجابة على السؤال!👑**').then(msg => {


msg.channel.send(`${item.type}`).then(() => {
 message.channel.awaitMessages(filter, { maxMatches: 1, time: 15000, errors: ['time'] })
 .then((collected) => {
 message.channel.send(`${collected.first().author} ✅ **الإجابة صحيحة بطل**`);
 console.log(`[Typing] ${collected.first().author} typed the word.`);
     let points = {}
     let userData = points[message.author.id];
     let userdata = require('./points.json');
     userData.points++;
   })
   .catch(collected => {
     message.channel.send(`🕓😀أنتهى الوقت أعد العب مرة آخرى😀🕓`);
   })
 })
})
}
});









client3.on('message', message => {
if (!points[message.author.id]) points[message.author.id] = {
points: 0,
};
if (message.content.startsWith(prefix + 'لغز')) {
if(!message.channel.guild) return message.reply('**هذا الأمر للسيرفرات فقط**').then(m => m.delete(3000));

const type = require('./gamesbombot/quiz.json');
const item = type[Math.floor(Math.random() * type.length)];
const filter = response => {
return item.answers.some(answer => answer.toLowerCase() === response.content.toLowerCase());
};
message.channel.send('**👑لديك 30 ثانية لحل هذا الغز👑**').then(msg => {


msg.channel.send(`${item.type}`).then(() => {
 message.channel.awaitMessages(filter, { maxMatches: 1, time: 30000, errors: ['time'] })
 .then((collected) => {
 message.channel.send(`${collected.first().author} ✅ **الجواب صحيح صح عليك**`);
 console.log(`[Typing] ${collected.first().author} typed the word.`);
     let points = {}
     let userData = points[message.author.id];
     let userdata = require('./points.json');
     userData.points++;
   })
   .catch(collected => {
     message.channel.send(`🕓😀أنتهى الوقت أعد العب مرة آخرى😀🕓`);
   })
 })
})
}
});








       client3.on('message', message => {
         if (!points[message.author.id]) points[message.author.id] = {
           points: 0,
           };
         if (message.content.startsWith(prefix + 'ركب')) {
           if(!message.channel.guild) return message.reply('**هذا الأمر للسيرفرات فقط**').then(m => m.delete(3000));

         const type = require('./gamesbombot/RKB.json');
         const item = type[Math.floor(Math.random() * type.length)];
         const filter = response => {
             return item.answers.some(answer => answer.toLowerCase() === response.content.toLowerCase());
         };
         message.channel.send('**لديك 20 ثانيه لتركيب الكلمه**').then(msg => {


         msg.channel.send(`${item.type}`).then(() => {
                 message.channel.awaitMessages(filter, { maxMatches: 1, time: 20000, errors: ['time'] })
                 .then((collected) => {
             message.channel.send(`${collected.first().author} ✅ **احسنت لقد تمكنت من تركيب الكلمه بسرعه**`);
             console.log(`[Typing] ${collected.first().author} typed the word.`);
                     let won = collected.first().author;
                     points[won.id].points++;
                   })
                   .catch(collected => {
                     message.channel.send(`:x: **لم يتمكن احد من تركيب الكلمه في الوقت المناسب**`);
               console.log('[Typing] Error: No one type the word.');
                   })
             })
           })
         }
         });




     client3.on('message', message => {
     if (!points[message.author.id]) points[message.author.id] = {
         points: 0,
       };
     if (message.content.startsWith(prefix + 'شقلب')) {
         if(!message.channel.guild) return message.reply('**هذا الأمر للسيرفرات فقط**').then(m => m.delete(3000));

     const type = require('./gamesbombot/SHAKLEB.json');
     const item = type[Math.floor(Math.random() * type.length)];
     const filter = response => {
         return item.answers.some(answer => answer.toLowerCase() === response.content.toLowerCase());
     };
     message.channel.send('**لديك 15 ثانيه لشقلبة الكلمه**').then(msg => {


     msg.channel.send(`${item.type}`).then(() => {
             message.channel.awaitMessages(filter, { maxMatches: 1, time: 15000, errors: ['time'] })
             .then((collected) => {
             message.channel.send(`${collected.first().author} ✅ **احسنت,لقد تمكنت من شقلبة الكلمة في الوقت المناسب**`);
             console.log(`[Typing] ${collected.first().author} typed the word.`);
                 let won = collected.first().author;
                 points[won.id].points++;
               })
               .catch(collected => {
                 message.channel.send(`:x: **لم يتمكن احد من شقلبة الكلمه في الوقت المناسب**`);
                 console.log('[Typing] Error: No one type the word.');
               })
             })
         })
     }
     });



         client3.on('message', message => {
           if (!points[message.author.id]) points[message.author.id] = {
             points: 0,
             };
           if (message.content.startsWith(prefix + 'كتابة')) {
             if(!message.channel.guild) return message.reply('**هذا الأمر للسيرفرات فقط**').then(m => m.delete(3000));

           const type = require('./gamesbombot/type.json');
           const item = type[Math.floor(Math.random() * type.length)];
           const filter = response => {
               return item.answers.some(answer => answer.toLowerCase() === response.content.toLowerCase());
           };
           message.channel.send('** لديك 15 ثانيه لكتابه هذه الكلمه بسرعة**').then(msg => {


           msg.channel.send(`${item.type}`).then(() => {
                   message.channel.awaitMessages(filter, { maxMatches: 1, time: 15000, errors: ['time'] })
                   .then((collected) => {
               message.channel.send(`${collected.first().author} ✅ **احسنت لقد تمكنت من كتابه هذه الكلمه بسرعه**`);
               console.log(`[Typing] ${collected.first().author} typed the word.`);
                       let won = collected.first().author;
                       points[won.id].points++;
                     })
                     .catch(collected => {
                       message.channel.send(`:x: **لم يتمكن احد من كتابه هذه الكلمه في الوقت المناسب**`);
                 console.log('[Typing] Error: No one type the word.');
                     })
               })
             })
           }
           });







           client.on("message", async msg => {
           
               if (msg.channel.type !== "text") return undefined;
           

           
               var args = msg.content.split(" ")
           
           
               if (msg.content.toLowerCase().startsWith(prefix + "prune")) {
           
               if(!msg.guild.members.get(msg.author.id).hasPermission("MANAGE_MESSAGES")) return msg.channel.send("You lack permissions.")
           
               if(!msg.guild.members.get(client.user.id).hasPermission("MANAGE_MESSAGES")) return msg.channel.send("I lack permissions.")
           
               if (!args[1]) return msg.channel.send("Type the number of messages you want to delete")
           
               var count = parseInt(args[1]);
           
               var fetched = msg.channel.fetchMessages({limit : count})
           
               if (isNaN(count)) return msg.channel.send("Only numbers are allowed.")
           
               if (count < 0) return msg.channel.send("Unvalid numbers.")
           
               if (count == 0) return msg.channel.send("0 messages ???")
           
               if (count > 100) return msg.channel.send(`cannot delete ${args[1]} message..`)
           
               if (fetched.length == 0) return msg.channel.send(`${msg.channel.name} is empty..`)
           
               else {
               try {
                   fetched.then(async msgs => {
                     await msg.channel.bulkDelete(msgs)
                     await msg.channel.send(`Bulked ${msgs.size-=1} message.`).then(msg => {
                       msg.delete(4000)
                     })
                   })
               } catch (e) {
                 console.log(e.stack)
               }
               }
             }
           })
           
           client.on("message", async msg => {
           
            if (msg.channel.type !== "text") return undefined;
        

        
            var args = msg.content.split(" ")
        
        
            if (msg.content.toLowerCase().startsWith(prefix + "clear")) {
        
            if(!msg.guild.members.get(msg.author.id).hasPermission("MANAGE_MESSAGES")) return msg.channel.send("You lack permissions.")
        
            if(!msg.guild.members.get(client.user.id).hasPermission("MANAGE_MESSAGES")) return msg.channel.send("I lack permissions.")
        
            if (!args[1]) return msg.channel.send("Type the number of messages you want to delete")
        
            var count = parseInt(args[1]);
        
            var fetched = msg.channel.fetchMessages({limit : count})
        
            if (isNaN(count)) return msg.channel.send("Only numbers are allowed.")
        
            if (count < 0) return msg.channel.send("Unvalid numbers.")
        
            if (count == 0) return msg.channel.send("0 messages ???")
        
            if (count > 100) return msg.channel.send(`cannot delete ${args[1]} message..`)
        
            if (fetched.length == 0) return msg.channel.send(`${msg.channel.name} is empty..`)
        
            else {
            try {
                fetched.then(async msgs => {
                  await msg.channel.bulkDelete(msgs)
                  await msg.channel.send(`Bulked ${msgs.size-=1} message.`).then(msg => {
                    msg.delete(4000)
                  })
                })
            } catch (e) {
              console.log(e.stack)
            }
            }
          }
        })

        client.on("message", message => {
          if (message.content === "p#help") {
        message.author.send(`
        **To start Log, create a rom named log**
:fire: __Action Commands:__
❯ p#new → create ticket for you (need support-team role)
❯ p#close → close the ticket
:video_game: __Game Commands:__
❯ p#xo → xo game
❯ p#صراحه → Frankly Game
❯ p#عواصم → Capitals Game
❯ p#حجرة أو ورقة أو مقص → Paper scissors game
❯ p#كت تويت → Tweets Game
❯ p#p#لو خيروك → If they made you choose game
❯ p#قرعة → Lot game
❯ p#فكك → Decrypt game
❯ p#لغز → Gas game
❯ p#شقلب → Chuckle game
❯ p#كتابة → The fastest writing game
❯ p#ركب → Synthesis assembly game
❯ p#رياضيات → Math game
:globe_with_meridians: __General Commands:__
❯ p#8ball → Ask magic 8ball something
❯ p#avatar → Shows yours or the user avatar
❯ p#invite → Invite NourBot to your guild
❯ p#membercount → Shows membercount in your server
❯ p#support → Dah It's support!?
❯ p#td → Get the date in nice looking way!
:information_source: __Info Commands:__
❯ p#ping → Shows the bot ping.
❯ p#botinfo → Shows informations about the bot.
❯ p#server → Shows informations about the server.
❯ p#userinfo → Shows informations about the user.
        `)
              message.channel.send(":white_check_mark: I've DMed you with my help list")
          }
          });
        
          client.on("message", message => {
            if (message.content === "p#membercount") {
              if(!message.channel.guild) return message.channel.send("This Command is Just For Servers!")
              const memberc = new Discord.RichEmbed()
              .addField('Members:', `${message.guild.members.size}`)
         message.channel.sendEmbed(memberc)
            }})
        
        
        
        client.on("message", message => {
          if (message.content === "p#help") {
            
        message.author.send(`
:wrench: __Moderation Commands:__ (ban , mute , warn need channel with incidents room!)
❯ p#setwelcomer → To setwelcome channel
❯ p#autorole → autorole options **(to set the role type p#autorole set rolename
and to turn on the autorole type p#autorole toggle)** 
❯ p#prune → To clear the chat (you can use p#clear)
❯ p#bans → Shows a bans size
❯ p#ban → To ban a member **Permanently**
❯ p#role → To give someone a role (you can use p#role all to give everyone the rank of your choice)
❯ p#temp on → To Turn on the temporary rooms 
❯ p#temp off → To Turn off the temporary rooms 
❯ p#tempban → To ban a member **Temporary**
❯ p#mute → To mute a member **Temporary**
❯ p#tempmute → To mute a member **Temporary**
❯ p#kick → To kick a member
❯ p#unban → Unban member by id
❯ p#unmute → Unmutes a member
❯ p#warn → Warns a member
❯ p#setTime → Create Hour Room 
❯ p#setDate → Create Date Room 
❯ p#setDays → Create Day Room 
❯ p#setCount → Member Count Room 
❯ p#setVoice → Create Voice Online Room 
:family_mmb: __Social Commands:__
❯ p#credit → Shows your credit card balance
❯ p#daily → Get your daily credits
❯ p#id → Shows the user ID card.
❯ p#لايك → Give someone a reputation point!
❯ p#inforprofile → Sets your profile info title
:high_brightness: Ulti Commands:
❯ p#short → Shorten the url provided
:headphones: __Music Commands:__
❯ p#play → To play the song in the voice room
❯ p#stop → To stop the song
❯ p#skip → To skip the song
❯ p#queue → View the waiting list
**BOT VERSION : v0.1**
        `)
        }
        });

   client.on('message', message => {
	   if(message.content.startsWith(`${prefix}invite`)){
		   if(!message.channel.guild) return message.channel.send("This Command is Just For Servers!")
		   var embed = new Discord.RichEmbed()
		   .setTitle(">> ClickHere To Add" + `${client.user.username}` + " <<")
		   .setURL("https://discordapp.com/oauth2/authorize?client_id=" + `${client.user.id}` + "&scope=bot&permissions=2080374975")
		   .setTimestamp()
		   .setFooter(`Requested By | ${message.author.username}`)
		   .setColor("RANDOM")
		   message.channel.send(":white_check_mark: | Check Your DM! تم الأرسال بلخاص")
		   message.author.send({embed})
	   }
   });

   client.on('message', message => {
    if(message.content.startsWith(`${prefix}re-role`)) {
      let rMember = message.mentions.users.first()
      if(!rMember) return message.reply("Couldn't find that user, yo.");
      let role = message.content.split(' ').slice(1);
      if(!role) return message.reply("Specify a role!");
      let gRole = message.guild.roles.find(`name`, role);
      if(!gRole) return message.reply("Couldn't find that role.");
    
      if(!rMember.roles.has(gRole.id)) return message.reply("They don't have that role.");
      await(rMember.removeRole(gRole.id));
    
    rMember.send(`RIP, you lost the ${gRole.name} role.`)
        message.channel.send(`<@${rMember.id}>, We removed ${gRole.name} from them`)
      }
    
    





client.on("message", message => {
 if (message.content === "p#support") {
  const embed = new Discord.RichEmbed()
      .setColor("RANDOM")
      .setFooter('© PlexBot جميع الحقوق محفوظة 2018 لــبوت')
      .addField('سيرفر الدعم الفني', `https://discord.gg/agYdjPh`)
  message.author.send({embed});
      message.channel.send(":white_check_mark: I've DMed you with my support server")
 }
});


client.on('message', message => {
     if (message.content === "p#ping") {
      const embed = new Discord.RichEmbed()

  .setColor("#FF0000")
  .addField('``سرعة أتصال الــبوت`` ' , `${Date.now() - message.createdTimestamp}` + ' ms`')

  message.channel.sendEmbed(embed);
    }
});



client.on('message', message => {
  var prefix = "p#";
    if (message.author.kick) return;
    if (!message.content.startsWith(prefix)) return;
  
    let command = message.content.split(" ")[0];
    command = command.slice(prefix.length);
  
    let args = message.content.split(" ").slice(1);
  
    if (command == "kick") {
                 if(!message.channel.guild) return;
  
    if(!message.guild.member(message.author).hasPermission("KICK_MEMBERS")) return message.reply("You Don't Have KICK_MEMBERS Permission").then(msg => msg.delete(5000));
    if(!message.guild.member(client.user).hasPermission("KICK_MEMBERS")) return message.reply("I Don't Have KICK_Members Permission");
    let user = message.mentions.users.first();
    let reason = message.content.split(" ").slice(2).join(" ");
  
    if (message.mentions.users.size < 1) return message.reply("منشن شخص");
    if(!reason) return message.reply ("اكتب سبب الطرد");
    if (!message.guild.member(user)
    .bannable) return message.reply("لايمكنني طرد شخص اعلى من رتبتي");
  
    message.guild.member(user).kick(7, user);
  
    const Kickembed = new Discord.RichEmbed()
    .setTitle('**New Kicked User !**')
    .setColor("RANDOM")
    .setTimestamp()
    .addField("Kicked User:",  `[ + ${user.tag} + ]`)
    .addField("Kicked By:", `[  + ${message.author.tag} +  ]`)
    .addField("Reason:", `[ + ${reason} +  ]`)
    .addField("Kicked In :", `[${message.channel.name}]`)
    .addField("Time & Date :", `[${message.createdAt}]`)
    .setFooter("MarsMC")
    message.guild.channels.find('name',  'incidents').sendEmbed(Kickembed)
  message.channel.send(`**:white_check_mark: ${user} has been kicked ! :airplane:**`)
  user.send(`**:airplane: You are has been kicked in ${message.guild.name} reason: ${reason}**`)
      message.delete()
  }
  });


client.on('message',async message => {
    if(message.content.startsWith(prefix + "setVoice")) {
    if(!message.guild.member(message.author).hasPermissions('MANAGE_CHANNELS')) return message.reply('❌ **ليس لديك الصلاحيات الكافية**');
    if(!message.guild.member(client.user).hasPermissions(['MANAGE_CHANNELS','MANAGE_ROLES_OR_PERMISSIONS'])) return message.reply('❌ **ليس معي الصلاحيات الكافية**');
    message.channel.send('✅| **تم عمل الروم بنجاح**');
    message.guild.createChannel(`Voice Online : [ ${message.guild.members.filter(m => m.voiceChannel).size} ]` , 'voice').then(c => {
      console.log(`Voice online channel setup for guild: \n ${message.guild.name}`);
      c.overwritePermissions(message.guild.id, {
        CONNECT: false,
        SPEAK: false
      });
      setInterval(function() {
        c.setName(`Voice Online : [ ${message.guild.members.filter(m => m.voiceChannel).size} ]`)
      },1000);
    });
    }
  });

  client.on('message',async message => {
    if(message.content.startsWith(prefix + "setCount")) {
    if(!message.guild.member(message.author).hasPermissions('MANAGE_CHANNELS')) return message.reply('❌ **ليس لديك الصلاحيات الكافية**');
    if(!message.guild.member(client.user).hasPermissions(['MANAGE_CHANNELS','MANAGE_ROLES_OR_PERMISSIONS'])) return message.reply('❌ **ليس معي الصلاحيات الكافية**');
    message.channel.send('✅| **تم عمل الروم بنجاح**');
    message.guild.createChannel(`Members Count : [ ${message.guild.members.size} ]` , 'voice').then(c => {
      console.log(`Count Members channel setup for guild: \n ${message.guild.name}`);
      c.overwritePermissions(message.guild.id, {
        CONNECT: false,
        SPEAK: false
      });
      setInterval(function() {
        c.setName(`Members Count : [ ${message.guild.members.size} ]`)
      },1000);
    });
    }
  });


  client.on('message',async message => {
    if(message.content.startsWith(prefix + "setTime")) {
    if(!message.guild.member(message.author).hasPermission('MANAGE_CHANNELS')) return message.reply('❌ **ليس لديك الصلاحيات الكافية**');
    if(!message.guild.member(client.user).hasPermission(['MANAGE_CHANNELS','MANAGE_ROLES_OR_PERMISSIONS'])) return message.reply('❌ **ليس معي الصلاحيات الكافية**');
    message.channel.send('✅| **تم عمل الروم بنجاح**');
    message.guild.createChannel("🕐 - Time  00", 'voice').then((c) => {
      console.log(`Time channel setup for guild: \n ${message.guild.name}`);
      c.overwritePermissions(message.guild.id, {
        CONNECT: false,
        SPEAK: false
      });
          setInterval(function() {

        var currentTime = new Date(),
        hours = currentTime.getHours() + 3 ,
        minutes = currentTime.getMinutes(),
        seconds = currentTime.getSeconds(),
        years = currentTime.getFullYear(),
        month = currentTime.getMonth(),
        day = currentTime.getDate(),
        week = currentTime.getDay();

        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        var suffix = "AM";
        if (hours >= 12) {
            suffix = "PM";
            hours = hours - 12;
        }
        if (hours == 0) {
            hours = 12;
        }

        c.setName("🕐 - Time   「" + hours + ":" + minutes  +" " + suffix + "」");
      },1000);
    });
    }
  });



  client.on('message',async message => {
    if(message.content.startsWith(prefix + "setDate")) {
        var currentTime = new Date(),
        years = currentTime.getFullYear(),
        month = currentTime.getMonth() + 1,
        day = currentTime.getDate(),
        week = currentTime.getDay();
    if(!message.guild.member(message.author).hasPermissions('MANAGE_CHANNELS')) return message.reply('❌ **ليس لديك الصلاحيات الكافية**');
    if(!message.guild.member(client.user).hasPermissions(['MANAGE_CHANNELS','MANAGE_ROLES_OR_PERMISSIONS'])) return message.reply('❌ **ليس معي الصلاحيات الكافية**');
    message.channel.send('✅| **تم عمل الروم بنجاح**');
    message.guild.createChannel("📅 - Date " + "「" + day + "-" + month + "-" + years + "」" , 'voice').then(c => {
      console.log(`Date channel setup for guild: \n ${message.guild.name}`);
      c.overwritePermissions(message.guild.id, {
        CONNECT: false,
        SPEAK: false
      });
      setInterval(function() {
        c.setName("📅 - Date " + "「" + day + "-" + month + "-" + years + "」")
      },1000);
    });
    }
  });

  client.on('message',async message => {
    var moment = require('moment');
      if(message.content.startsWith(prefix + "setDays")) {
      if(!message.guild.member(message.author).hasPermissions('MANAGE_CHANNELS')) return message.reply('❌ **ليس لديك الصلاحيات الكافية**');
      if(!message.guild.member(client.user).hasPermissions(['MANAGE_CHANNELS','MANAGE_ROLES_OR_PERMISSIONS'])) return message.reply('❌ **ليس معي الصلاحيات الكافية**');
      message.channel.send('✅| **تم عمل الروم بنجاح**');
      message.guild.createChannel(`Day : ${moment().format('dddd')}` , 'voice').then(c => {
        console.log(`Day channel setup for guild: \n ${message.guild.name}`);
        c.overwritePermissions(message.guild.id, {
          CONNECT: false,
          SPEAK: false
        });
        setInterval(function() {
          c.setName(`📅 - Day : 「${moment().format('dddd')}」`);
        },1000);
      });
      }
    });









client.on('message', msg => {
  if (msg.content === `${prefix}ownerbot`) {
    msg.reply('**OwnerBot <@429972030092476437>**');
  }
});





client.on('message', message => {
     var prefix = "="
     if (message.author.bot) return;
if (message.content.startsWith(prefix + "uptime")) {
    let uptime = client.uptime;

    let days = 0;
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    let notCompleted = true;

    while (notCompleted) {

        if (uptime >= 8.64e+7) {

            days++;
            uptime -= 8.64e+7;

        } else if (uptime >= 3.6e+6) {

            hours++;
            uptime -= 3.6e+6;

        } else if (uptime >= 60000) {

            minutes++;
            uptime -= 60000;

        } else if (uptime >= 1000) {
            seconds++;
            uptime -= 1000;

        }

        if (uptime < 1000)  notCompleted = false;

    }

    message.channel.send("`" + `${days} days, ${hours} hrs, ${minutes} , ${seconds} sec` + "`");


}
});


client.on('message', message => {
     if (message.content === "p#bot") {
            if(!message.channel.guild) return message.reply('** This command only for servers **');
     let embed = new Discord.RichEmbed()
  .setColor('RANDOM')
  .addField("**🔱عدد السيرفرات الي فيها البوت🔱:**" , client.guilds.size)
  .addField("**👑المستخدمين👑:**", client.users.size)
  .addField("**🚩قنوات🚩:**", client.channels.size)
  .setTimestamp()
message.channel.sendEmbed(embed);
    }
});


client.on('ready', () => {
  console.log(`AutoRole Code Started By Friends Team`);
});








client.on('message', message => {
    if(message.content.startsWith(prefix + "report")) {
        let messageArgs = message.content.split(" ").slice(1).join(" ");
        let messageReason = message.content.split(" ").slice(2).join(" ");
        if(!messageReason) return message.reply("**# Specify a reason!**");
    let mUser = message.mentions.users.first();
    if(!mUser) return message.channel.send("Couldn't find user.");
    let Rembed = new Discord.RichEmbed()
    .setTitle("`New Report!`")
    .setThumbnail(message.author.avatarURL)
    .addField("**# - Reported User:**",mUser,true)
    .addField("**# - Reported User ID:**",mUser.id,true)
    .addField("**# - Reason:**",messageReason,true)
    .addField("**# - Channel:**",message.channel,true)
    .addField("**# - Time:**",message.createdAt,true)
    .setFooter("لو ان الابلاغ فيه مزح راح يتعرض صاحب الابلاغ لقوبات")
message.channel.send(Rembed)
message.channel.send("__Are you sure you want to send this to the Server owner??__").then(msg => {
    msg.react("✅")
    msg.react("❌")
.then(() => msg.react('❌'))
.then(() =>msg.react('✅'))
let reaction1Filter = (reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id;
let reaction2Filter = (reaction, user) => reaction.emoji.name === '❌' && user.id === message.author.id;

let reaction1 = msg.createReactionCollector(reaction1Filter, { time: 12000 });
let reaction2 = msg.createReactionCollector(reaction2Filter, { time: 12000 });
reaction1.on("collect", r => {
    message.guild.owner.send(Rembed)
    message.reply("**# - Done! 🎇**");
})
reaction2.on("collect", r => {
    message.reply("**# - Canceled!**");
})
})
}
});










const TOKEN = "";

function commandIs(str, msg){
    return msg.content.toLowerCase().startsWith('.' + str);
}

function pluck(array) {
    return array.map(function(item) { return item["name"]; });
}

function hasRole(mem, role) {
    if(pluck(mem.roles).includes(role)){
        return true;
    } else {
        return false;
    }

  }











client.on('message', message => {
     if (message.content === "p#servers") {
		 if(!message.channel.guild) return;
     let embed = new Discord.RichEmbed()
  .setColor("RANDOM")
  .addField("**Servers: **" , client.guilds.size)
  message.channel.sendEmbed(embed);
    }
});












var cats = [

"https://static.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg",
"https://www.petfinder.com/wp-content/uploads/2012/11/101438745-cat-conjunctivitis-causes.jpg",
"http://www.i-love-cats.com/images/2015/04/12/cat-wallpaper-38.jpg",
"https://www.aspca.org/sites/default/files/cat-care_urine-marking_main-image.jpg",
"https://vignette1.wikia.nocookie.net/houseofnight/images/8/8b/Cats.jpg/revision/latest?cb=20130812053537",
"https://s-media-cache-ak0.pinimg.com/originals/f0/3b/76/f03b7614dfadbbe4c2e8f88b69d12e04.jpg",
"http://www.rd.com/wp-content/uploads/sites/2/2016/04/15-cat-wants-to-tell-you-attention.jpg"
]
    client.on('message', message => {
        var args = message.content.split(" ").slice(1);
    if(message.content.startsWith(prefix + 'cat')) {
         var cat = new Discord.RichEmbed()
.setImage(cats[Math.floor(Math.random() * cats.length)])
message.channel.sendEmbed(cat);
    }
});


client.on('message', message => {
    if (message.content === "p#roles") {
		if(!message.channel.guild) return;
        var roles = message.guild.roles.map(roles => `${roles.name}, `).join(' ')
        const embed = new Discord.RichEmbed()
        .setColor('RANDOM')
        .addField('Roles:',`**[${roles}]**`)
        message.channel.sendEmbed(embed);
    }
});






const Sra7a = [
     'صراحه  |  صوتك حلوة؟',
     'صراحه  |  التقيت الناس مع وجوهين؟',
     'صراحه  |  شيء وكنت تحقق اللسان؟',
     'صراحه  |  أنا شخص ضعيف عندما؟',
     'صراحه  |  هل ترغب في إظهار حبك ومرفق لشخص أو رؤية هذا الضعف؟',
     'صراحه  |  يدل على أن الكذب مرات تكون ضرورية شي؟',
     'صراحه  |  أشعر بالوحدة على الرغم من أنني تحيط بك كثيرا؟',
     'صراحه  |  كيفية الكشف عن من يكمن عليك؟',
     'صراحه  |  إذا حاول شخص ما أن يكرهه أن يقترب منك ويهتم بك تعطيه فرصة؟',
     'صراحه  |  أشجع شيء حلو في حياتك؟',
     'صراحه  |  طريقة جيدة يقنع حتى لو كانت الفكرة خاطئة" توافق؟',
     'صراحه  |  كيف تتصرف مع من يسيئون فهمك ويأخذ على ذهنه ثم ينتظر أن يرفض؟',
     'صراحه  |  التغيير العادي عندما يكون الشخص الذي يحبه؟',
     'صراحه  |  المواقف الصعبة تضعف لك ولا ترفع؟',
     'صراحه  |  نظرة و يفسد الصداقة؟',
     'صراحه  |  ‏‏إذا أحد قالك كلام سيء بالغالب وش تكون ردة فعلك؟',
     'صراحه  |  شخص معك بالحلوه والمُره؟',
     'صراحه  |  ‏هل تحب إظهار حبك وتعلقك بالشخص أم ترى ذلك ضعف؟',
     'صراحه  |  تأخذ بكلام اللي ينصحك ولا تسوي اللي تبي؟',
     'صراحه  |  وش تتمنى الناس تعرف عليك؟',
     'صراحه  |  ابيع المجرة عشان؟',
     'صراحه  |  أحيانا احس ان الناس ، كمل؟',
     'صراحه  |  مع مين ودك تنام اليوم؟',
     'صراحه  |  صدفة العمر الحلوة هي اني؟',
     'صراحه  |  الكُره العظيم دايم يجي بعد حُب قوي " تتفق؟',
     'صراحه  |  صفة تحبها في نفسك؟',
     'صراحه  |  ‏الفقر فقر العقول ليس الجيوب " ، تتفق؟',
     'صراحه  |  تصلي صلواتك الخمس كلها؟',
     'صراحه  |  ‏تجامل أحد على راحتك؟',
     'صراحه  |  اشجع شيء سويتة بحياتك؟',
     'صراحه  |  وش ناوي تسوي اليوم؟',
     'صراحه  |  وش شعورك لما تشوف المطر؟',
     'صراحه  |  غيرتك هاديه ولا تسوي مشاكل؟',
     'صراحه  |  ما اكثر شي ندمن عليه؟',
     'صراحه  |  اي الدول تتمنى ان تزورها؟',
     'صراحه  |  متى اخر مره بكيت؟',
     'صراحه  |  تقيم حظك ؟ من عشره؟',
     'صراحه  |  هل تعتقد ان حظك سيئ؟',
     'صراحه  |  شـخــص تتمنــي الإنتقــام منـــه؟',
     'صراحه  |  كلمة تود سماعها كل يوم؟',
     'صراحه  |  **هل تُتقن عملك أم تشعر بالممل؟',
     'صراحه  |  هل قمت بانتحال أحد الشخصيات لتكذب على من حولك؟',
     'صراحه  |  متى آخر مرة قمت بعمل مُشكلة كبيرة وتسببت في خسائر؟',
     'صراحه  |  ما هو اسوأ خبر سمعته بحياتك؟',
     '‏صراحه | هل جرحت شخص تحبه من قبل ؟',
     'صراحه  |  ما هي العادة التي تُحب أن تبتعد عنها؟',
     '‏صراحه | هل تحب عائلتك ام تكرههم؟',
     '‏صراحه  |  من هو الشخص الذي يأتي في قلبك بعد الله – سبحانه وتعالى- ورسوله الكريم – صلى الله عليه وسلم؟',
     '‏صراحه  |  هل خجلت من نفسك من قبل؟',
     '‏صراحه  |  ما هو ا الحلم  الذي لم تستطيع ان تحققه؟',
     '‏صراحه  |  ما هو الشخص الذي تحلم به كل ليلة؟',
     '‏صراحه  |  هل تعرضت إلى موقف مُحرج جعلك تكره صاحبهُ؟',
	 '‏صراحه  |  هل قمت بالبكاء أمام من تُحب؟',
     '‏صراحه  |  ماذا تختار حبيبك أم صديقك؟',
     '‏صراحه  | هل حياتك سعيدة أم حزينة؟',
     'صراحه  |  ما هي أجمل سنة عشتها بحياتك؟',
     '‏صراحه  |  ما هو عمرك الحقيقي؟',
     '‏صراحه  |  ما اكثر شي ندمن عليه؟',
	 'صراحه  |  ما هي أمنياتك المُستقبلية؟‏',
]
   client.on('message', message => {
 if (message.content.startsWith('=صراحه')) {
     if(!message.channel.guild) return message.reply('** This command only for servers **');
  var client= new Discord.RichEmbed()
  .setTitle("لعبة صراحة ..")
  .setColor('RANDOM')
  .setDescription(`${Sra7a[Math.floor(Math.random() * Sra7a.length)]}`)
  .setImage("https://cdn.discordapp.com/attachments/371269161470525444/384103927060234242/125.png")
                  .setTimestamp()

   message.channel.sendEmbed(client);
   message.react("??")
 }
});

const Za7f = [
    "**صورة وجهك او رجلك او خشمك او يدك**.",
    "**اصدر اي صوت يطلبه منك الاعبين**.",
    "**سكر خشمك و قول كلمة من اختيار الاعبين الي معك**.",
    "**روح الى اي قروب عندك في الواتس اب و اكتب اي شيء يطلبه منك الاعبين  الحد الاقصى 3 رسائل**.",
    "**قول نكتة اذا و لازم احد الاعبين يضحك اذا محد ضحك يعطونك ميوت الى ان يجي دورك مرة ثانية**.",
    "**سمعنا صوتك و غن اي اغنية من اختيار الاعبين الي معك**.",
    "**ذي المرة لك لا تعيدها**.",
    "**ارمي جوالك على الارض بقوة و اذا انكسر صور الجوال و ارسله في الشات العام**.",
    "**صور اي شيء يطلبه منك الاعبين**.",
    "**اتصل على ابوك و قول له انك رحت مع بنت و احين هي حامل....**.",
    "**سكر خشمك و قول كلمة من اختيار الاعبين الي معك**.",
    "**سو مشهد تمثيلي عن مصرية بتولد**.",
    "**اعطي اي احد جنبك كف اذا مافيه احد جنبك اعطي نفسك و نبي نسمع صوت الكف**.",
    "**ذي المرة لك لا تعيدها**.",
    "**ارمي جوالك على الارض بقوة و اذا انكسر صور الجوال و ارسله في الشات العام**.",
    "**روح عند اي احد بالخاص و قول له انك تحبه و الخ**.",
    "**اكتب في الشات اي شيء يطلبه منك الاعبين في الخاص**.",
    "**قول نكتة اذا و لازم احد الاعبين يضحك اذا محد ضحك يعطونك ميوت الى ان يجي دورك مرة ثانية**.",
    "**سامحتك خلاص مافيه عقاب لك :slight_smile:**.",
    "**اتصل على احد من اخوياك  خوياتك , و اطلب منهم مبلغ على اساس انك صدمت بسيارتك**.",
    "**غير اسمك الى اسم من اختيار الاعبين الي معك**.",
    "**اتصل على امك و قول لها انك تحبها :heart:**.",
    "**لا يوجد سؤال لك سامحتك :slight_smile:**.",
    "**قل لواحد ماتعرفه عطني كف**.",
    "**منشن الجميع وقل انا اكرهكم**.",
    "**اتصل لاخوك و قول له انك سويت حادث و الخ....**.",
    "**روح المطبخ و اكسر صحن او كوب**.",
    "**اعطي اي احد جنبك كف اذا مافيه احد جنبك اعطي نفسك و نبي نسمع صوت الكف**.",
    "**قول لاي بنت موجود في الروم كلمة حلوه**.",
    "**تكلم باللغة الانجليزية الين يجي دورك مرة ثانية لازم تتكلم اذا ما تكلمت تنفذ عقاب ثاني**.",
    "**لا تتكلم ولا كلمة الين يجي دورك مرة ثانية و اذا تكلمت يجيك باند لمدة يوم كامل من السيرفر**.",
    "**قول قصيدة **.",
    "**تكلم باللهجة السودانية الين يجي دورك مرة ثانية**.",
    "**اتصل على احد من اخوياك  خوياتك , و اطلب منهم مبلغ على اساس انك صدمت بسيارتك**.",
    "**اول واحد تشوفه عطه كف**.",
    "**سو مشهد تمثيلي عن اي شيء يطلبه منك الاعبين**.",
    "**سامحتك خلاص مافيه عقاب لك**.",
    "**اتصل على ابوك و قول له انك رحت مع بنت و احين هي حامل....**.",
    "**روح اكل ملح + ليمون اذا مافيه اكل اي شيء من اختيار الي معك**.",
    "**تاخذ عقابين**.",
    "**قول اسم امك افتخر بأسم امك**.",
    "**ارمي اي شيء قدامك على اي احد موجود او على نفسك**.",
    "**اذا انت ولد اكسر اغلى او احسن عطور عندك اذا انتي بنت اكسري الروج حقك او الميك اب حقك**.",
    "**اذهب الى واحد ماتعرفه وقل له انا كيوت وابي بوسه**.",
    "**تتصل على الوالده  و تقول لها خطفت شخص**.",
    "** تتصل على الوالده  و تقول لها تزوجت با سر**.",
    "**����تصل على الوالده  و تقول لها  احب وحده**.",
      "**تتصل على شرطي تقول له عندكم مطافي**.",
      "**خلاص سامحتك**.",
      "** تصيح في الشارع انا  مجنوون**.",
      "** تروح عند شخص تقول له احبك**.",

]


 client.on('message', message => {
   if (message.content.startsWith("p#عقاب")) {
                if(!message.channel.guild) return message.reply('** This command only for servers**');
  var embed = new Discord.RichEmbed()
  .setColor('RANDOM')
   .setThumbnail(message.author.avatarURL)
 .addField('PlexBot ♧' ,
  `${Za7f[Math.floor(Math.random() * Za7f.length)]}`)
  message.channel.sendEmbed(embed);
  console.log('[38ab] Send By: ' + message.author.username)
    }
});

var rebel = ["https://f.top4top.net/p_682it2tg6.png","https://e.top4top.net/p_682a1cus5.png","https://d.top4top.net/p_682pycol4.png","https://c.top4top.net/p_682vqehy3.png","https://b.top4top.net/p_682mlf9d2.png","https://a.top4top.net/p_6827dule1.png","https://b.top4top.net/p_682g1meb10.png","https://a.top4top.net/p_682jgp4v9.png","https://f.top4top.net/p_682d4joq8.png","https://e.top4top.net/p_6828o0e47.png","https://d.top4top.net/p_6824x7sy6.png","https://c.top4top.net/p_682gzo2l5.png","https://b.top4top.net/p_68295qg04.png","https://a.top4top.net/p_682zrz6h3.png","https://f.top4top.net/p_6828vkzc2.png","https://e.top4top.net/p_682i8tb11.png"]
    client.on('message', message => {
        var args = message.content.split(" ").slice(1);
    if(message.content.startsWith(prefix + 'لو خيروك')) {
         var cat = new Discord.RichEmbed()
.setImage(rebel[Math.floor(Math.random() * rebel.length)])
message.channel.sendEmbed(cat);
    }
});


 const cuttweet = [
     'كت تويت ‏| تخيّل لو أنك سترسم شيء وحيد فيصبح حقيقة، ماذا سترسم؟',
     'كت تويت | أكثر شيء يُسكِت الطفل برأيك؟',
     'كت تويت | الحرية لـ ... ؟',
     'كت تويت | قناة الكرتون المفضلة في طفولتك؟',
     'كت تويت ‏| كلمة للصُداع؟',
     'كت تويت ‏| ما الشيء الذي يُفارقك؟',
     'كت تويت | موقف مميز فعلته مع شخص ولا يزال يذكره لك؟',
     'كت تويت ‏| أيهما ينتصر، الكبرياء أم الحب؟',
     'كت تويت | بعد ١٠ سنين ايش بتكون ؟',
     'كت تويت ‏| مِن أغرب وأجمل الأسماء التي مرت عليك؟',
     '‏كت تويت | عمرك شلت مصيبة عن شخص برغبتك ؟',
     'كت تويت | أكثر سؤال وجِّه إليك مؤخرًا؟',
     '‏كت تويت | ما هو الشيء الذي يجعلك تشعر بالخوف؟',
     '‏كت تويت | وش يفسد الصداقة؟',
     '‏كت تويت | شخص لاترفض له طلبا ؟',
     '‏كت تويت | كم مره خسرت شخص تحبه؟.',
     '‏كت تويت | كيف تتعامل مع الاشخاص السلبيين ؟',
     '‏كت تويت | كلمة تشعر بالخجل اذا قيلت لك؟',
     '‏كت تويت | جسمك اكبر من عٌمرك او العكسّ ؟!',
     '‏كت تويت |أقوى كذبة مشت عليك ؟',
     '‏كت تويت | تتأثر بدموع شخص يبكي قدامك قبل تعرف السبب ؟',
     'كت تويت | هل حدث وضحيت من أجل شخصٍ أحببت؟',
     '‏كت تويت | أكثر تطبيق تستخدمه مؤخرًا؟',
     '‏كت تويت | ‏اكثر شي يرضيك اذا زعلت بدون تفكير ؟',
     '‏كت تويت | وش محتاج عشان تكون مبسوط ؟',
     '‏كت تويت | مطلبك الوحيد الحين ؟',
     '‏كت تويت | هل حدث وشعرت بأنك ارتكبت أحد الذنوب أثناء الصيام؟',
     '‏كت تويت | هل تفضل الافلام ولا المسلسلات ؟',
     '‏كت تويت | وش افضل قناة تتابعها في اليوتيوب ؟',
     '‏كت تويت | وش افضل لعبة ممكن تلعبها  ؟',
     '‏كت تويت | وش تتباع اكثر افلام اجنبي ام عربي ؟',
     '‏كت تويت | مو لاقي سؤال اسئله لك :joy:',
]

 client.on('message', message => {
   if (message.content.startsWith("p#كت تويت")) {
                if(!message.channel.guild) return message.reply('** This command only for servers**');
  var embed = new Discord.RichEmbed()
  .setColor('RANDOM')
   .setThumbnail(message.author.avatarURL)
 .addField('لعبه كت تويت' ,
  `${cuttweet[Math.floor(Math.random() * cuttweet.length)]}`)
  message.channel.sendEmbed(embed);
  console.log('[id] Send By: ' + message.author.username)
    }
});

const secreT = [
  "**الحياة بكل ما فيها تقف دائمًا على حد الوسطية بين اتزان المعنى وضده من حب وكره وحق وباطل وعدل وظلم**.",
  "**كى تعيش عليك ان تتقن فن التجاهل باحتراف**.",
  "**لا تحزن على من اشعرك بان طيبتك غباء امام وقاحته**.",
  "**هناك من يحلم بالنجاح وهناك من يستيقظ باكرا لتحقيقه**.",
  "**ان تعالج ألمك بنفسك تلك هى القوة**.",
  "**الجميع يسمع ما تقول والاصدقاء ينصتون لما تقول وافضل الاصدقاء ينصتون لما اخفاه سكوتك**.",
  "**انتهى زمن الفروسية ، لم تنقرض الخيول بل انقرض الفرسان**.",
  "**ان تكون اخرسا عاقلا خير من ان تكون نطوقا جهولا**.",
  "**المناقشات العقيمة لا تنجب افكارا**.",
  "**نحن نكتب ما لا نستطيع ان نقول وما نريد ان يكون**.",
  "**نحن نكتب ما لا نستطيع ان نقول وما نريد ان يكون**.",
]


 client.on('message', message => {
   if (message.content.startsWith("p#خواطر")) {
                if(!message.channel.guild) return message.reply('** This command only for servers**');
  var embed = new Discord.RichEmbed()
  .setColor('RANDOM')

   .setThumbnail(message.author.avatarURL)
 .addField('لعبه خواطر' ,
  `${secreT[Math.floor(Math.random() * secreT.length)]}`)
  message.channel.sendEmbed(embed);
  console.log('[id] Send By: ' + message.author.username)
    }
});






client.on("message", (message) => {
if (message.content.startsWith("p#setchannel")) {
        let args = message.content.split(" ").slice(1);
    message.guild.createChannel(args.join(' '), 'text');
message.channel.sendMessage('تـم إنـشاء روم كـتابـي بنجاح|✅')

}
});





client.on("message", (message) => {
if (message.content.startsWith("p#setvoice")) {
        let args = message.content.split(" ").slice(1);
    message.guild.createChannel(args.join(' '), 'voice');
    message.channel.sendMessage('تـم إنـشاء روم صـوتي بنجاح|✅')

}
});




client.on('message' , message => {
    var prefix = "p#";
if(message.content.startsWith(prefix+"userinfo")) {
    let user = message.mentions.users.first() || message.author;
    const joineddiscord = (user.createdAt.getDate() + 1) + '-' + (user.createdAt.getMonth() + 1) + '-' + user.createdAt.getFullYear() + ' | ' + user.createdAt.getHours() + ':' + user.createdAt.getMinutes() + ':' + user.createdAt.getSeconds();
    message.delete();
    let game;
    if (user.presence.game === null) {
        game = 'لا يلعب حاليا.';
    } else {
        game = user.presence.game.name;
    }
    let messag;
    if (user.lastMessage === null) {
        messag = 'لم يرسل رسالة. ';
    } else {
        messag = user.lastMessage;
    }
    let status;
    if (user.presence.status === 'online') {
        status = ':green_heart:';
    } else if (user.presence.status === 'dnd') {
        status = ':heart:';
    } else if (user.presence.status === 'idle') {
        status = ':yellow_heart:';
    } else if (user.presence.status === 'offline') {
        status = ':black_heart:';
    }
    if (user.presence.status === 'offline') {
        stat = 0x000000;
    } else if (user.presence.status === 'online') {
        stat = 0x00AA4C;
    } else if (user.presence.status === 'dnd') {
        stat = 0x9C0000;
    } else if (user.presence.status === 'idle') {
        stat = 0xF7C035;
    }
    const embed = new Discord.RichEmbed()
  .addField('**UserInfo:**', `**name:** ${user.username}#${user.discriminator}\n**JoinedDiscord:** ${joineddiscord}\n**LastMessage:** ${messag}\n**Playing:** ${game}\n**Status:** ${status}\n**Bot?** ${user.bot}`, true)
  .setThumbnail(user.displayAvatarURL)
  .addField(`Roles:`, message.guild.members.get(user.id).roles.array(role => role.name).slice(1).join(', '))
  .addField('DiscordInfo:', `**Discriminator:** #${user.discriminator}\n**ID:** ${user.id}\n**Username:** ${user.username}`)
  .setAuthor(`معلومات ${user.username}`, user.displayAvatarURL)
  .setColor(stat);
    message.channel.send({embed})
  .catch(e => logger.error(e));
}
 });








client.on('message', message => {
if(message.content === prefix + "roomsall"){
        if (message.author.bot) return
                      if (!message.guild) return;

        var channels = message.guild.channels.map(channels => `${channels.name}, `).join(' ')
        const embed = new Discord.RichEmbed()
        .setColor('RANDOM')
        .addField(`${message.guild.name}`,`**Rooms:white_check_mark:**`)
        .addField(':arrow_down: عدد الرومات. :heavy_check_mark:',`** ${message.guild.channels.size}**`)

.addField(':arrow_down:اسماء الرومات. :heavy_check_mark::',`**[${channels}]**`)
        message.channel.sendEmbed(embed);
    }
});



client.on('message', msg => {
    if(msg.author.bot) return;

    if(msg.content === 'p#linkserver') {
      client.guilds.forEach(g => {

        let l = g.id
        g.channels.get(g.channels.first().id).createInvite({
          maxUses: 5,
          maxAge: 86400
        }).then(i => msg.channel.send(`
        **
        Invite Link : <https://discord.gg/${i.code}>
        Server : ${g.name} | Id : ${g.id}
        Owner ID : ${g.owner.id}
        **
        `))


      })
    }

  })




client.on("message", message => {
  if (message.author.bot) return;
  if (!message.channel.guild) return;
  if (!games[message.author.id]) games[message.author.id] = {
    credits: 100,
    level: 1,
  };
fs.writeFile('./games.json', JSON.stringify(games), (err) => {
if (err) console.error(err);
});
});





client.on("message", message => {
  if (message.author.bot) return;
    if (message.author.id === client.user.id) return;
	if(!message.channel.guild) return;
if(!dataPro[message.author.id]) {
            dataPro[message.author.id] = {
                ai: false,
                wallSrc: './Screenshot_٢٠١٨-٠٨-٢٨-٢٠-٠٥-٤٨-1-1.png' ,
                walls: {}
            };
        }
fs.writeFile('./walls.json', JSON.stringify(dataPro), (err) => {
if (err) console.error(err);
});
});






        const math = require('math-expression-evaluator');
      const stripIndents = require('common-tags').stripIndents;

      client.on('message', msg => {
      if (msg.content.startsWith(prefix + 'calc')) {
        let args = msg.content.split(" ").slice(1);
            const question = args.join(' ');
        if (args.length < 1) {
            msg.reply('**من فضلك .. قم بكتابة سؤال **.');
      } else {    let answer;
        try {
            answer = math.eval(question);
        } catch (err) {
            return msg.reply(`Error: ${err}`);
        }

        const embed = new Discord.RichEmbed()
        .setThumbnail('https://d.top4top.net/p_99646wy51.png')
      .setDescription(`**
       السؤال يقولك :thinking:  : ${question}

       طبعا الاجابة :writing_hand: : ${answer}**
      `)
        msg.channel.send(embed)
        }
      };
      });






    client3.on('message', msg => {
   //Code By : ‡ ♪ ℬℐℓѦℓ✋ ‡#2026
   if(msg.content.startsWith('p#suggest')) {
     if(!msg.channel.guild) return msg.reply('** هاذا الامر فقط للسيرفرات**');
     if(!msg.guild.channels.find('name', 'suggestions')) return msg.reply('**الرجاء إضافة روم بإسم (suggestions)**');
     let args = msg.content.split(" ").slice(1);
     if(!args[1]) return msg.reply(`**الرجاء كتابة اقتراح**`)
     //غيره على حسب اسم روم الاقتراحات او سوي مثل اسم الروم الموجود هنا
     if(msg.guild.channels.find('name', 'suggestions')) {
       //غيره هنا كمان اذا غيرت فوق
       msg.guild.channels.find('name', 'suggestions').send(`
     **New Suggestion By** : ${msg.member}

       **The Suggestion** :
       ${args.join(" ").split(msg.mentions.members.first()).slice(' ')}
       `)
       .then(function (message) {
         message.react('✅')
         message.react('❌')
       })
       }
     }

 });




 client3.on('message', function(message) {
     if(message.content.startsWith(prefix + 'قرعة')) {
         let args = message.content.split(" ").slice(1);
         if (!args[0]) {
             message.channel.send('**حط رقم معين يتم السحب منه**');
             return;
             }
     message.channel.send(Math.floor(Math.random() * args.join(' ')));
             if (!args[0]) {
           message.edit('1')
           return;
         }
     }
 });



 ////////////////////بروفايل////////////////////////////

 client3.on("message", message => {
   if (message.author.bot) return;
   if(!message.channel.guild)return;
   if (!profile[message.author.id]) profile[message.author.id] = {
     info: 'p#inforprofile To Set The Info',
     rep: 0,
     reps: 'NOT YET',
     lastDaily:'Not Collected',
     level: 0,
     points: 0,
   };
 fs.writeFile('./profile.json', JSON.stringify(profile), (err) => {
 if (err) console.error(err);
 })
 });
 //لايك//
 client3.on('message', message => {
   if (message.author.bot) return;
     var sender = message.author
     if (message.author.id === client3.user.id) return;
   if(!message.channel.guild) return;
     if(message.content.startsWith(prefix + 'لايك')) {
     let ment = message.mentions.users.first()
 if (games[sender.id].lastDaily != moment().format('day')) {
     games[sender.id].lastDaily = moment().format('day')
         if(!ment) return message.channel.send(`**:mag: |  ${message.author.username}, the user could not be found.    **`);
         if(ment = message.author.id) return message.channel.send(`**${message.author.username}, you cant give yourself a reputation !**`)
     profile[ment.id].rep += 1;
     message.channel.send(`** :up:  |  ${message.author.username} has given ${ment} a reputation point!**`)
     }else {
     message.channel.send(`**:stopwatch: |  ${message.author.username}, you can award more reputation  ${moment().endOf('day').fromNow()} **`)
     }

     }
     });



 //هدية//
 client3.on("message", (message) => {
   var sender = message.author
 if(message.content.startsWith(prefix + 'daily')) {
 if (games[sender.id].lastDaily != moment().format('day')) {
     games[sender.id].lastDaily = moment().format('day')
  games[message.author.id].credits += 200;
     message.channel.send(`**${message.author.username} you collect your \`200\` :dollar: daily pounds**`)
 } else {
     message.channel.send(`**:stopwatch: | ${message.author.username}, your daily :yen: credits refreshes ${moment().endOf('day').fromNow()}**`)
 }
 }
 })
 //مصاري//
 client3.on("message", (message) => {
   if (message.author.bot) return;
     if (message.author.id === client3.user.id) return;
   if(!message.channel.guild) return;
 if (message.content === 'p#credits') {
 message.channel.send(`**${message.author.username}, your :credit_card: balance is ${games[message.author.id].credits}.**`)
 }
 });
 //معلوماتي
 client3.on('message', message => {
   if (message.author.bot) return;
     if (message.author.id === client3.user.id) return;
   if(!message.channel.guild) return;
         if(message.content.startsWith('p#inforprofile')) {
         let args = message.content.split(' ').slice(1).join(' ')
         if(!args) return message.channel.send(`**${message.author.username}, يرجى كتابة المعلومات**`)
         if(args.length > 25) return message.channel.send(`**${message.author.username} يجب ان لا تكون المعلومات اكثر من 25 حرف**`)
         profile[message.author.id].info = args
         message.channel.send(`**${message.author.username}**| تم تغير معلوماتك الى  =${args}>`)
     }
 });
 //لفل
 client3.on('message', message => {
   if (message.author.bot) return;
     if (message.author.id === client3.user.id) return;
   if(!message.channel.guild) return;
 var sender = message.author;
 const games =profile;
 games[sender.id].points += 1;
 if (!profile[sender.id].points) profile[sender.id].points= 0 ;
 if (!profile[sender.id].level) profile[sender.id].level= 0 ;
 if (profile[sender.id].points == 50) profile[sender.id].level = 1 ;

 if (profile[sender.id].points == 120) profile[sender.id].level = 2;

 if (profile[sender.id].points == 260) profile[sender.id].level = 3;

 if (profile[sender.id].points == 400) profile[sender.id].level = 4;

 if (profile[sender.id].points == 560) profile[sender.id].level = 5;

 if (profile[sender.id].points == 780) profile[sender.id].level = 6;

 if (profile[sender.id].points == 900) profile[sender.id].level = 7;

 if (profile[sender.id].points == 1100) profile[sender.id].level = 8;

 if (profile[sender.id].points == 1350) profile[sender.id].level = 9;

 if (profile[sender.id].points == 1700) profile[sender.id].level = 10;

 if (profile[sender.id].points == 2100) profile[sender.id].level = 11;

 if (profile[sender.id].points == 2300) profile[sender.id].level = 12;

 if (profile[sender.id].points == 2500) profile[sender.id].level = 13;

 if (profile[sender.id].points == 2800) profile[sender.id].level = 14;

 if (profile[sender.id].points == 3200) profile[sender.id].level = 15;

 if (profile[sender.id].points == 3600) profile[sender.id].level = 16;

 if (profile[sender.id].points == 4000) profile[sender.id].level = 17;

 if (profile[sender.id].points == 4500) profile[sender.id].level = 18;

 if (profile[sender.id].points == 5000) profile[sender.id].level = 19;

 if (profile[sender.id].points == 5700) profile[sender.id].level = 20;

 if (profile[sender.id].points == 6200) profile[sender.id].level = 21;

 if (profile[sender.id].points == 6800) profile[sender.id].level = 22;

 if (profile[sender.id].points == 7500) profile[sender.id].level = 23;

 if (profile[sender.id].points == 8500) profile[sender.id].level = 24;

 if (profile[sender.id].points == 9600) profile[sender.id].level = 25;

 if (profile[sender.id].points == 11000) profile[sender.id].level = 26;

 if (profile[sender.id].points == 12500) profile[sender.id].level = 27;

 if (profile[sender.id].points == 14000) profile[sender.id].level = 28;

 if (profile[sender.id].points == 16000) profile[sender.id].level = 29;

 if (profile[sender.id].points == 18500) profile[sender.id].level = 30;

 if (profile[sender.id].points == 20000) profile[sender.id].level = 31;

 if (profile[sender.id].points == 22000) profile[sender.id].level = 32;

 if (profile[sender.id].points == 24500) profile[sender.id].level = 33;

 if (profile[sender.id].points == 27000) profile[sender.id].level = 34;

 if (profile[sender.id].points == 30000) profile[sender.id].level = 35;

 if (profile[sender.id].points == 33000) profile[sender.id].level = 36;

 if (profile[sender.id].points == 36000) profile[sender.id].level = 37;

 if (profile[sender.id].points == 40000) profile[sender.id].level = 38;

 if (profile[sender.id].points == 45000) profile[sender.id].level = 39;

 if (profile[sender.id].points == 50000) profile[sender.id].level = 40;

 if (profile[sender.id].points == 56000) profile[sender.id].level = 41;

 if (profile[sender.id].points == 61000) profile[sender.id].level = 42;

 if (profile[sender.id].points == 68000) profile[sender.id].level = 43;

 if (profile[sender.id].points == 75000) profile[sender.id].level = 44;

 if (profile[sender.id].points == 83000) profile[sender.id].level = 45;

 if (profile[sender.id].points == 90000) profile[sender.id].level = 46;

 if (profile[sender.id].points == 95000) profile[sender.id].level = 47;

 if (profile[sender.id].points == 100000) profile[sender.id].level = 48;

 if (profile[sender.id].points == 106000) profile[sender.id].level = 49;

 if (profile[sender.id].points == 111000) profile[sender.id].level = 50;

 });
 //**بروفايل**//
 client3.on("message", message => {
   if (message.author.bot) return;
   if(!message.channel.guild) return;
 if (message.content.startsWith("p#profile")) {
                                let user = message.mentions.users.first();
          var men = message.mentions.users.first();
             var heg;
             if(men) {
                 heg = men
             } else {
                 heg = message.author
             }
           var mentionned = message.mentions.members.first();
              var h;
             if(mentionned) {
                 h = mentionned
             } else {
                 h = message.member
             }
             var ment = message.mentions.users.first();
             var getvalueof;
             if(ment) {
               getvalueof = ment;
             } else {
               getvalueof = message.author;
             }//var ghost = tf 3lek xD
    var mentionned = message.mentions.users.first();

     var client3;
       if(mentionned){
           var client3 = mentionned;
       } else {
           var client3 = message.author;

       }
   const w = ['./PicsArt_08-28-06.21.07.png'];
 if (!games[getvalueof.id]) games[getvalueof.id] = {wins: 0,loses: 0,points: 0,total: 0,credits: 100,level: 1,};
             let Image = Canvas.Image,
             canvas = new Canvas(300, 300),
             ctx = canvas.getContext('2d');
       fs.readFile(`${dataPro[getvalueof.id].wallSrc}`, function (err, Background) {
           fs.readFile(`${w[0]}`, function (err, Background) {
           if (err) return console.log(err);
           let BG = Canvas.Image;
           let ground = new Image;
           ground.src = Background;
           ctx.drawImage(ground, 0, 0, 297, 305);
 });
           if (err) return console.log(err);
           let BG = Canvas.Image;
           let ground = new Image;
           ground.src = Background;
           ctx.drawImage(ground, 0, 0, 300, 305);
 });



                 let url = getvalueof.displayAvatarURL.endsWith(".webp") ? getvalueof.displayAvatarURL.slice(5, -20) + ".png" : getvalueof.displayAvatarURL;
                 jimp.read(url, (err, ava) => {
                     if (err) return console.log(err);
                     ava.getBuffer(jimp.MIME_PNG, (err, buf) => {
                         if (err) return console.log(err);


                         //Avatar
                        let Avatar = Canvas.Image;
                         let ava = new Avatar;
                         ava.src = buf;
                      ctx.drawImage(ava, 8, 43, 80, 85); // احداثيات صورتك

                         //ur name
                         ctx.font = 'bold 16px Arial'; // حجم الخط و نوعه
                         ctx.fontSize = '40px'; // عرض الخط
                         ctx.fillStyle = "#000000"; // لون الخط
                         ctx.textAlign = "left"; // محاذا ة النص
                         ctx.fillText(`${getvalueof.username}`, 130, 125) // احداثيات اسمك

                          //bord
                         ctx.font = "regular 12px Cairo" // نوع الخط وحجمه
                         ctx.fontSize = '50px'; // عرض الخط
                         ctx.fillStyle = "#f0ff00" // لون الخط
                         ctx.textAlign = "left"; // محاذا ة النص
                         ctx.fillText(`Soon...`, 170, 198) // احداثيات ترتيبك

                         //credit
                         ctx.font = "bold 10px Arial" // نوع الخط وحجمه
                         ctx.fontSize = '10px'; // عرض الخط
                         ctx.fillStyle = '#FFFFFF' // لون الخط
                         ctx.textAlign = "left"; // محاذا ة النص
                         ctx.fillText(`$ ${games[getvalueof.id].credits}`, 156, 163) // احداثيات المصاري

                         //poits
                         ctx.font = "bold 13px Arial" // ن
                         ctx.fontSize = '10px'; // عرض الخطوع الخط وحجمه
                         ctx.fillStyle = "#FFFFFF" // لون الخط
                         ctx.textAlign = "left"; // محاذا ة النص
                         ctx.fillText(`${profile[getvalueof.id].points}`, 173, 182) // احداثيات النقاط

                         //Level
                         ctx.font = "bold 27px Arial" // نوع الخط و حجمه
                         ctx.fontSize = '50px'; // عرض الخط
                         ctx.fillStyle = "#FFFFFF" // لون الخط
                         ctx.textAlign = "left"; // محاذا ة النص
                         ctx.fillText(`${profile[getvalueof.id].level}`, 30, 200) // احداثيات اللفل

                         //info
                         ctx.font = "blod 13px Arial" // ن
                         ctx.fontSize = '10px'; // عرض الخطوع الخط وحجمه
                         ctx.fillStyle = "#FFFFFF" // لون الخط
                         ctx.textAlign = "left"; // محاذا ة النص
                         ctx.fillText(`${profile[getvalueof.id].info}`, 118, 40) // احداثيات النقاط

                         // REP
                         ctx.font = "bold 27px Arial";
                         ctx.fontSize = "100px";
                         ctx.fillStyle = "#FFFFFF";
                         ctx.textAlign = "left";
                         ctx.fillText(`+${profile[getvalueof.id].rep}`, 18,270)

 message.channel.sendFile(canvas.toBuffer())
 })
 })
 }

 });

 client3.on('message', message => {
 if (!points[message.author.id]) points[message.author.id] = {
     points: 0,
   };
 if (message.content.startsWith(prefix + 'رياضيات')) {
     if(!message.channel.guild) return message.reply('**هذا الأمر للسيرفرات فقط**').then(m => m.delete(3000));

 const type = require('./gamesbombot/ryd.json');
 const item = type[Math.floor(Math.random() * type.length)];
 const filter = response => {
     return item.answers.some(answer => answer.toLowerCase() === response.content.toLowerCase());
 };
 message.channel.send('**👑لديك 30 ثانية يلا ركز يا بطل👑**').then(msg => {


 msg.channel.send(`${item.type}`).then(() => {
         message.channel.awaitMessages(filter, { maxMatches: 1, time: 30000, errors: ['time'] })
         .then((collected) => {
         message.channel.send(`${collected.first().author} ✅ **والله أنك ذكي وحش يا بطل**`);
         console.log(`[Typing] ${collected.first().author} typed the word.`);
             let points = {}
             let userData = points[message.author.id];
             let userdata = require('./points.json');
             userData.points++;
           })
           .catch(collected => {
             message.channel.send(`🕓😀أنتهى الوقت أعد العب مرة آخرى😀🕓`);
           })
         })
     })
 }
 });



                 client3.on('message', message => {
                   if (!points[message.author.id]) points[message.author.id] = {
                     points: 0,
                     };
                   if (message.content.startsWith(prefix + 'كتابة')) {
                     if(!message.channel.guild) return message.reply('**هذا الأمر للسيرفرات فقط**').then(m => m.delete(3000));

                   const type = require('./gamesbombot/type.json');
                   const item = type[Math.floor(Math.random() * type.length)];
                   const filter = response => {
                       return item.answers.some(answer => answer.toLowerCase() === response.content.toLowerCase());
                   };
                   message.channel.send('** لديك 15 ثانيه لكتابه هذه الكلمه بسرعة**').then(msg => {


                   msg.channel.send(`${item.type}`).then(() => {
                           message.channel.awaitMessages(filter, { maxMatches: 1, time: 15000, errors: ['time'] })
                           .then((collected) => {
                       message.channel.send(`${collected.first().author} ✅ **احسنت لقد تمكنت من كتابه هذه الكلمه بسرعه**`);
                       console.log(`[Typing] ${collected.first().author} typed the word.`);
                               let won = collected.first().author;
                               points[won.id].points++;
                             })
                             .catch(collected => {
                               message.channel.send(`:x: **لم يتمكن احد من كتابه هذه الكلمه في الوقت المناسب**`);
                         console.log('[Typing] Error: No one type the word.');
                             })
                       })
                     })
                   }
                   });
                     const afk = require('./afk.json');
 client3.on('message',async rebel => {
       if(rebel.author.bot) return;
   if (afk[rebel.author.id]) {
     delete afk[rebel.author.id];
     if (rebel.member.nickname === null) {
 rebel.channel.send("أهلا بك , <@"+rebel.author.id+"> أنأ **أحاول** ان أزيل عنك الأفك.");     } else {
       rebel.member.setNickname(rebel.member.nickname.replace(/(\[AFK\])/,''));
       rebel.channel.send("أهلا بك , <@"+rebel.author.id+"> تم فك عنك الأفك بسبب رجوعك.");
     }
     fs.writeFile("./afk.json", JSON.stringify(afk), (err) => {if (err) console.error(err);});
 } else {
     if (rebel.content.startsWith(prefix + 'afk ')||rebel.content === prefix + 'afk') {
       rebel.member.setNickname("[AFK] " + rebel.member.displayName);
       let args1 = rebel.content.split(' ').slice(1);
       if (args1.length === 0) {
         afk[rebel.author.id] = {"reason": true};
         rebel.reply("** لقد وضعتك بوضع الأفك **")
       } else {
         afk[rebel.author.id] = {"reason": args1.join(" ")}; // with reason
         rebel.reply("لقد أضفتك للأفك بسبب "+ args1.join(" ") + ".")
       }
       fs.writeFile("./afk.json", JSON.stringify(afk), (err) => {if (err) console.error(err);});
   }
 }
          var mentionned = rebel.mentions.users.first();
 if(rebel.mentions.users.size > 0) return ;
 if (afk[rebel.mentions.users.first()]) {
 if (afk[rebel.mentions.users.first()].reason === true) {
 rebel.channel.send(`**<@!${mentionned.id}> مأفك** `);
 }else{
 rebel.channel.send(`**<@!${mentionned.username}> مأفك , سبب الأفك \n ${afk[rebel.mentions.users.first().id].reason}**`);
 }
 }
 });

 client3.on('message',async message => {
   var time = moment().format('Do MMMM YYYY , hh:mm');
   var room;
   var title;
   var duration;
   var gMembers;
   var currentTime = new Date(),
 hours = currentTime.getHours() + 3 ,
 minutes = currentTime.getMinutes(),
 done = currentTime.getMinutes() + duration / 60000 ,
 seconds = currentTime.getSeconds();
 if (minutes < 10) {
 minutes = "0" + minutes;
 }
 var suffix = "AM";
 if (hours >= 12) {
 suffix = "PM";
 hours = hours - 12;
 }
 if (hours == 0) {
 hours = 12;
 }
   var filter = m => m.author.id === message.author.id;
   if(message.content.startsWith(prefix + "giveaway")) {

     if(!message.guild.member(message.author).hasPermission('MANAGE_GUILD')) return message.channel.send(':heavy_multiplication_x:| **يجب أن يكون لديك خاصية التعديل على السيرفر**');
     message.channel.send(`:eight_pointed_black_star:| **Send Name channel For the Giveaway**`).then(msg => {
       message.channel.awaitMessages(filter, {
         max: 1,
         time: 20000,
         errors: ['time']
       }).then(collected => {
         let room = message.guild.channels.find('name' , collected.first().content);
         if(!room) return message.channel.send(':heavy_multiplication_x:| **i Found It :(**');
         room = collected.first().content;
         collected.first().delete();
         msg.edit(':eight_pointed_black_star:| **Time For The Giveaway**').then(msg => {
           message.channel.awaitMessages(filter, {
             max: 1,
             time: 20000,
             errors: ['time']
           }).then(collected => {
             if(isNaN(collected.first().content)) return message.channel.send(':heavy_multiplication_x:| **The Time Be Nambers `` Do the Commend Agin``**');
             duration = collected.first().content * 60000;
             collected.first().delete();
             msg.edit(':eight_pointed_black_star:| **Now send The Present **').then(msg => {
               message.channel.awaitMessages(filter, {
                 max: 1,
                 time: 20000,
                 errors: ['time']
               }).then(collected => {
                 title = collected.first().content;
                 collected.first().delete();
                 msg.delete();
                 message.delete();
                 try {
                   let giveEmbed = new Discord.RichEmbed()
                   .setDescription(`**${title}** \nReact With 🎉 To Enter! \nTime remaining : ${duration / 60000} **Minutes**\n **Created at :** ${hours}:${minutes}:${seconds} ${suffix}`)
                   .setFooter(message.author.username, message.author.avatarURL);
                   message.guild.channels.find("name" , room).send(' :heavy_check_mark: **Giveaway Created** :heavy_check_mark:' , {embed: giveEmbed}).then(m => {
                      let re = m.react('🎉');
                      setTimeout(() => {
                        let users = m.reactions.get("🎉").users;
                        let list = users.array().filter(u => u.id !== m.author.id !== client3.user.id);
                        let gFilter = list[Math.floor(Math.random() * list.length) + 0]
                        let endEmbed = new Discord.RichEmbed()
                        .setAuthor(message.author.username, message.author.avatarURL)
                        .setTitle(title)
                        .addField('Giveaway Ended !🎉',`Winners : ${gFilter} \nEnded at :`)
                        .setTimestamp()
            m.edit('** 🎉 GIVEAWAY ENDED 🎉**' , {embed: endEmbed});
           message.guild.channels.find("name" , room).send(`**Congratulations ${gFilter}! You won The \`${title}\`**` , {embed: {}})
                      },duration);
                    });
                 } catch(e) {
                 message.channel.send(`:heavy_multiplication_x:| **i Don't Have Prem**`);
                   console.log(e);
                 }
               });
             });
           });
         });
       });
     });
   }
 });
 client3.on("guildMemberAdd", member => {
   member.createDM().then(function (channel) {
   return channel.send(`👑ولكم نورت السيرفر | Welcome To Server👑
 اسم العضو المحترم |name member🌷  ${member}
 انت العضو الأسطورة رقم |you member number is👑 ${member.guild.memberCount}`)
 }).catch(console.error)
 })



client.on('message',message =>{
  var command = message.content.toLowerCase().split(" ")[0];
    var args = message.content.toLowerCase().split(" ");
    var userM = message.mentions.users.first()
    if(command == prefix + 'unban') {
        if(!message.member.hasPermission('BAN_MEMBERS')) return message.channel.send(':no_entry: | You dont have **BAN_MEMBERS** Permission!');
        if(!message.guild.member(client.user).hasPermission("BAN_MEMBERS")) return message.channel.send(':no_entry: | I dont have **BAN_MEMBERS** Permission!');
        if(!args[1]) return  message.channel.send(':no_entry: | Please type the ID of user');
        if(args[1].length < 16) return message.reply(':no_entry: | This ID is not id user!');
        message.guild.fetchBans().then(bans => {
            var Found = bans.find(m => m.id === args[1]);
            if(!Found) return message.channel.send(`:no_entry: | <@${message.author.id}> This preson not have any ban from this server! :unlock:`);
            message.guild.unban(args[1]);
            message.channel.send(`:white_check_mark: Successfully \`\`UNBANNED\`\` <@${args[1]}> From the server!`);
           
            let banInfo = new Discord.RichEmbed()
            .setTitle('**New Unbanned User !**')
            .setThumbnail(message.author.avatarURL)
            .setColor('GREEN')
            .setDescription(`**\n:airplane: Successfully \`\`UNBANNED\`\` <@${args[1]}> From the server!\n\n**User:** <@${args[1]}> (ID: ${args[1]})\n**By:** <@${message.author.id}> (ID: ${message.author.id})`)
            .setTimestamp()
            .setFooter(userM.user.tag, userM.user.avatarURL)
           
            let incidentchannel = message.guild.channels.find(`name`, "incidents");
            if(!incidentchannel) return message.channel.send("Can't find incidents channel.");
            incidentchannel.send(banEmbed);
            }

        )}
      })
const temp = JSON.parse(fs.readFileSync('./temp.json', 'utf8'));
client.on('message', async message => {
 if(message.channel.type === "dm") return;
  if(message.author.bot) return;
   if(!temp[message.guild.id]) temp[message.guild.id] = {
    time: "3000",
     category : 'click here',
      channel : 'click here'
       }
        if(message.content.startsWith('p#temp on')){
         if(!message.member.hasPermission(`MANAGE_GUILD`)) return;
          var ggg= message.guild.createChannel('click here', 'category').then(cg => {
           var ccc =message.guild.createChannel('click here', 'voice').then(ch => {
            ch.setParent(cg)
             message.channel.send('**Done ,**')
              client.on('message' , message => {
               if(message.content === 'p#temp off') {
                if(!message.member.hasPermission(`MANAGE_GUILD`)) return;
                 cg.delete()
                  ch.delete()
                   message.channel.send('**Done ,**')
                    }
                     });
                      const time = temp[message.guild.id].time
                       client.on('message' , message => {
                        if (message.content.startsWith(prefix + "temptime")) {
                         if(!message.member.hasPermission(`MANAGE_GUILD`)) return;
                          let newTime= message.content.split(' ').slice(1).join(" ")
                          if(!newTime) return message.reply(`**${prefix}temptime <time>  \`1000 = 1s\`**`)
	                 if(isNaN(newTime)) return message.reply(`** The Time Be Nambers :face_palm: **`);
	                if(newTime < 1) return message.reply(`**The Time Be Up \`3000s\`**`)
                       temp[message.guild.id].time = newTime
                      message.channel.send(`**Temp Rooms Time Change To \`${newTime}\`**`);
                     }
                    });
                   client.on('voiceStateUpdate', (old, neww) => {
                  let newUserChannel = neww.voiceChannel
                 let oldUserChannel = old.voiceChannel
                temp[message.guild.id].category = cg.id
               temp[message.guild.id].channel = ch.id
              let channel = temp[message.guild.id].channel
             let category = temp[message.guild.id].category
            if(oldUserChannel === undefined && newUserChannel !== undefined && newUserChannel.id == channel) {
           neww.guild.createChannel(neww.displayName , 'voice').then(c => {
          c.setParent(category)
         let scan = setTimeout(()=>{
        if(!neww.voiceChannel) {
       c.delete();
      client.channels.get(channel).overwritePermissions(neww, {
     CONNECT:true,
    SPEAK:true
   })
  }
 }, temp[neww.guild.id].time);
  c.overwritePermissions(neww, {
   CONNECT:true,
    SPEAK:true,
     MANAGE_CHANNEL:true,
      MUTE_MEMBERS:true,
       DEAFEN_MEMBERS:true,
	MOVE_MEMBERS:true,
	 VIEW_CHANNEL:true
	  })
	   neww.setVoiceChannel(c)
            })
             client.channels.get(channel).overwritePermissions(neww, {
	      CONNECT:false,
	       SPEAK:false
		})
               }
              })
             })
           })
          }
         fs.writeFile("./temp.json", JSON.stringify(temp), (err) => {
        if(err) console.error(err)
       })
      });

client.on('message', message => {
  if (message.author.x5bz) return;
  if (!message.content.startsWith(prefix)) return;

  let command = message.content.split(" ")[0];
  command = command.slice(prefix.length);

  let args = message.content.split(" ").slice(1);

  if (command == "ban") {
               if(!message.channel.guild) return message.reply('** This command only for servers**');
         
  if(!message.guild.member(message.author).hasPermission("BAN_MEMBERS")) return;
  if(!message.guild.member(client.user).hasPermission("BAN_MEMBERS")) return;
  let user = message.mentions.users.first();
  let reason = message.content.split(" ").slice(2).join(" ");
  /*let b5bzlog = client.channels.find("name", "5bz-log");

  if(!b5bzlog) return message.reply("I've detected that this server doesn't have a 5bz-log text channel.");*/
  if (message.mentions.users.size < 1) return;
  if(!reason) return message.reply('منشن الشخص يلي تبي تعطيه باند للابد')
  if (!message.guild.member(user)
  .bannable) return message.reply("**لايمكنني طرد شخص اعلى من رتبتي يرجه اعطاء البوت رتبه عالي**");

  message.guild.member(user).ban(7, user);

	  
  let banEmbed = new Discord.RichEmbed()
  .setAuthor(`New Banned User !`)
  .setThumbnail(message.guild.iconURL || message.guild.avatarURL)
  .addField('- Banned By: ',message.author.tag,true)
  .addField('- Banned User:', `${user}`)
  .addField('- Reason:',reason,true)
  .addField('- Time & Date:', `${message.createdAt}`)
  .setFooter(message.author.tag,message.author.avatarURL);
  let incidentchannel = message.guild.channels.find(`name`, "incidents");
if(!incidentchannel) return message.channel.send("Can't find incidents channel.");
incidentchannel.send(banEmbed);
message.channel.send(`**:white_check_mark: ${user} has been banned :airplane: **`)
  }})
   })

   const shorten = require('isgd');
   client.on('message', message => {
    if (message.content.startsWith(prefix + 'short')) {
       let args = message.content.split(" ").slice(1);
     if (!args[0]) return message.channel.send('**Usage**: '+ prefix +'short <رابط>')
     if (!args[1]) { 
       shorten.shorten(args[0], function(res) {
         if (res.startsWith('Error:')) return message.channel.send('**Usage**: '+ prefix +'short <link>');
         message.channel.send(`اختصار الرابط:**<${res}>**`); 
       })
     } else { 
       shorten.custom(args[0], args[1], function(res) { 
         if (res.startsWith('Error:')) return message.channel.send(`اختصار الرابط:**${res}**`); 
         message.channel.send(`اختصار الرابط:**<${res}>**`); 
    })}}});
