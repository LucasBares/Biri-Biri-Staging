const commands = require('../core/command.js')
const send = require('../core/utils.js').sendText
const utils = require('../core/utils.js')
const CustomCommand = commands.CustomCommand

exports.getCommands = (clients) => {
  return [
    new CustomCommand({
      'name': 'usercomando',
      'execute': (msg) => {
        let has_admin     = msg.member.permissions.has("ADMINISTRATOR")   // Check if the user has admin
        let has_manage    = msg.member.permissions.has("MANAGE_MESSAGES") // Check if the user has Manage Messages
        let maybeCommand  = msg.content.trim().split(/\s+/)[1]            // Checks if the requested text is a command or not
        let authorId      = msg.author.id;                                // Saves the author ID for validations 
        let mentionedUser = msg.mentions.users.map(v => v.username).toString()
        let mentionedId   = msg.mentions.users.map(v => v.id).toString()

        // Check if a member has a specific permission on the guild!
        if (!has_admin || !has_manage){
          return send(msg, 'Necesitas ser un admin, pendejo')
        }
        // Check if there is any command for disable
        if(maybeCommand === undefined) {
          return send(msg, 'Necesitas especificar un comando, pendejo')
        }
        // Validation for deactivate the command command
        if(maybeCommand === 'usercomando') {
          return send(msg, 'No <:wanwan:403968696067948554>')
        }

        let command = clients.dispatcher.getCommandByName(maybeCommand)
        let hasCommand = command !== undefined
        if(!hasCommand) {
          return send(msg, `Comando \`${maybeCommand}\` no encontrado`)
        }

        let maybeAction = msg.content.trim().split(/\s+/)[2]

        if(maybeAction !== 'activar' && maybeAction !== 'desactivar') {
          return send(msg, `Necesitas especificar una action 'activar' o 'desactivar', pendejo`)
        }

        if(!mentionedUser){
          return send(msg,`Necesitas etiquetar a alguien, pendejo`)
        }
        
        if(mentionedId === authorId){
          return send(msg,`No te puedes hacer esto a ti mismo, pendejo`)
        }
        
        if(mentionedId === NaN || !mentionedId){
          return send(msg,`Algo salio mal. Etiquetaste a alguien, pendejo?`)
        }

        let action = (maybeAction === 'activar') ? 'activado' : 'desactivado'
        action === 'activado' ? command.enableUser(msg, mentionedId) : command.disableUser(msg, mentionedId)
        
        return send(msg, `Comando ${command.name} ${action} para el usuario ${mentionedUser}`)
    }
    })
  ]
}