class Dispatcher {
  constructor(prefix, bot, clients) {
    this.prefix = prefix
    this.bot = bot
    this.clients = clients
    this.clients.dispatcher = this
    this.commands = {}
  }

  enforceUniqueName(name) {
    if(this.commands.hasOwnProperty(name)) {
      let message = `${this.prefix}${name} is duplicated`
      throw new Error(message)
    }
  }

  enforceUniqueCommand(command) {
    this.enforceUniqueName(command.name)
    command.alias.forEach(this.enforceUniqueName)
  }

  add(modulePath) {
    let module = require(modulePath)
    let commands = this.commands
    let enforceUniqueCommand = this.enforceUniqueCommand
    let prefix = this.prefix
    module.getCommands(this.clients).forEach(command => {
      command.setPrefix(prefix)
      enforceUniqueCommand(command)
      commands[command.getFullName()] = command
      command.getFullAlias().forEach(name => { commands[name] = command})
    })
  }

  getCommandByName(name) {
    if(name === undefined) return
    return this.commands[this.prefix + name]
  }

  dispatch(msg) {
    let tags = {'channel': msg.channel.name, 'type': msg.channel.type}
    clients.dogstatsd.increment('discord.message', 1, tags)

    // Is this a command?
    // Or if you are a bot, your opinion is not important
    if(!msg.content.startsWith(prefix) || msg.author.bot) return

    // Maybe there is a better way to do this
    let commandName = msg.content.trim().split(' ', 1)[0].toLowerCase()

    // If the command doesn't exists then we don't care
    if(!this.commands.hasOwnProperty(commandName)) return

    let = this.commands[commandName]

    // If you are not enable we don't care
    if(!command.isEnable(msg)) {
      command.onDisable(msg)
      return
    }

    // If you are paused we don't care
    if(command.isPaused(msg)) {
      command.onPaused(msg)
      return
    }

    // If command is NSFW and channel is not
    // we can't execute this
    if(command.isNSFW && !msg.channel.nsfw) {
      command.onNSFW(msg)
      return
    }

    command.execute(msg)
  }

  register() {
    this.bot.on('message', this.dispatch)
  }
}