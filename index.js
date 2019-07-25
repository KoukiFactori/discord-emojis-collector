const Discord = require('discord.js')
const client = new Discord.Client()

const axios = require('axios')
const fs = require('fs')

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
]).then(({ token }) => {
	client.login(token).catch(_ => { console.error(chalk`{red /!\\ }{bold Invalid token !}`), process.exit() })
})


client.on('ready', async () => {
	const guilds = client.guilds.map(({ id, name }) => `${id} - ${name}`)
	getGuild(guilds)
		.then(({ guild: guildID }) => downloadEmojis(guildID))
})

const getGuild = (guilds) => {
	return prompt([
		{
			name: "guild",
			type: 'list',
			message: 'Select a guild :',
			filter: function(str) {
				return str.split(' ')[0]
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
		message: 'Download finished, do you want to download emotes from another server?'
	}).then(({ restart }) => {
		if(!restart) { console.error(chalk`{bold Shutdown program...}`), process.exit() }
		client.emit('ready')
	})
	
}
		