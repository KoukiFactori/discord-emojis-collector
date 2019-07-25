const Discord = require('discord.js');
const client = new Discord.Client();

const axios = require('axios');
const fs = require('fs');

const { prompt } = require('inquirer')
const chalk = require('chalk') 

console.log(chalk`{yellow
************************************
*                                  *
*     Discord Emojis Collector     *
*                                  *
*        by Asriel & Ahkrïn        *
*                                  *
************************************
}`)


prompt([
	{ name: "token", message: "Client token :"}
]).then(answers => {
	client.login(answers.token).catch(_ => { console.error(chalk`{red /!\\ }{bold Invalid token !}`), process.exit() })
})


client.on('ready', async () => {
	const guilds = client.guilds.map(guild => `${guild.id} - ${guild.name}`)
	getGuild(guilds)
		.then(({ guild: guildID }) => downloadEmojis(guildID))
})

const getGuild = (guilds) => {
	return prompt([
		{
			name: "guild",
			type: 'list',
			message: 'Select a guild :',
			filter: function(a) {
				return a.split(' ')[0]
			},
			choices: guilds
		}
	])
}

const downloadEmojis = async (guildID) => {
	const emojis = client.guilds.get(guildID).emojis.map(({  name, id, animated }) => [name, id, animated])
	for await (const emoji of emojis) {
		const url = `https://cdn.discordapp.com/emojis/${emoji[1]}.${emoji[2] ? "gif" : "png"}`

		const file = fs.createWriteStream(`${emoji[0]}.${emoji[2] ? "gif" : "png"}`)
		
		await axios({url, responseType: 'stream'})
			.then(({ data }) => data.pipe(file))
	}
	
	await prompt({
		type: 'confirm',
		name: 'restart',
		message: 'Téléchargement terminé, voulez vous télécharger les emotes d\'un autre serveur ?'
	}).then(({ restart }) => {
		if(!restart) { console.error(chalk`{bold Shutdown program...}`), process.exit() }
		client.emit('ready')
	})
	
}
		
