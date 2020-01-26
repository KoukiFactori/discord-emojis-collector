const Discord = require('discord.js')
const client = new Discord.Client()

const axios = require('axios')
const { createWriteStream, promises: fsPromises } = require('fs')
const { prompt } = require('inquirer')
const chalk = require('chalk')

const path = require('path')
const PATH_OUTPUT = path.join(__dirname, '../output')

prompt([
	{ name: "token", message: "Client token :"}
]).then(({ token }) => {
	client.login(token)
		.catch(() => {
			throw new Error(chalk`{red /!\\ }{bold Invalid token !}`)
		})
})


client.once('ready', async () => {
	main()
})

const getGuild = (guilds) => {
	return prompt([
		{
			name: "guild",
			type: 'list',
			message: 'Select a guild :',
			filter,
			choices: guilds
		}
	])
}

const downloadEmojis = async (emojis, guildName) => {
	await fsPromises.stat(PATH_OUTPUT).catch(async (err) => {
		if(err.code === 'ENOENT') await fsPromises.mkdir(PATH_OUTPUT)
	})

	await fsPromises.stat(path.join(PATH_OUTPUT, guildName)).catch(async (err) => {
		if (err.code === 'ENOENT') await fsPromises.mkdir(path.join(PATH_OUTPUT, guildName))
	})

	for await (const emoji of emojis) {
		const url = `https://cdn.discordapp.com/emojis/${emoji[1]}.${emoji[2] ? "gif" : "png"}`

		const file = createWriteStream(path.join(PATH_OUTPUT, guildName, `${emoji[0]}.${emoji[2] ? "gif" : "png"}`))
		await axios({url, responseType: 'stream'})
			.then(({ data }) => data.pipe(file))
	}
	
	await prompt({
		type: 'confirm',
		name: 'restart',
		message: 'Download finished, do you want to download emotes from another server?'
	}).then(({ restart }) => {
		if(!restart) { console.error(chalk`{bold See you next time...}`), process.exit() }
		main()
	})
	
}

function main() {
	const guilds = client.guilds.map(({ id, name }) => `${id} - ${name}`)
	getGuild(guilds)
		.then(({ guild: guildID }) => {
			const guildName = client.guilds.get(guildID).name
			const emojis = client.guilds.get(guildID).emojis.map(({  name, id, animated }) => [name, id, animated])
			downloadEmojis(emojis, guildName)
		})
}

function filter(str) {
	return str.split(' ')[0]
}