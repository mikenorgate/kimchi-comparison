export interface TerminalLine {
  id: string
  type: 'input' | 'output' | 'error'
  text: string
}

export interface CommandResult {
  lines: string[]
}

export function executeCommand(input: string, context: { cwd: string }): CommandResult {
  const trimmed = input.trim()
  const [command, ...args] = trimmed.split(/\s+/)
  const arg = args.join(' ')

  switch (command.toLowerCase()) {
    case '':
      return { lines: [] }
    case 'help':
      return {
        lines: [
          'Available commands:',
          '  help       Show this help message',
          '  echo       Print arguments',
          '  date       Show current date and time',
          '  whoami     Show current user',
          '  pwd        Show current directory',
          '  ls         List directory contents',
          '  clear      Clear the terminal',
          '  uname      Show system information',
          '  open       Open a file or URL',
          '  exit       Close the terminal',
        ],
      }
    case 'echo':
      return { lines: [arg] }
    case 'date':
      return { lines: [new Date().toString()] }
    case 'whoami':
      return { lines: ['tahoe-user'] }
    case 'pwd':
      return { lines: [context.cwd] }
    case 'ls':
      return {
        lines: ['Applications', 'Desktop', 'Documents', 'Downloads', 'Movies', 'Music', 'Pictures'],
      }
    case 'clear':
      return { lines: [] }
    case 'uname':
      return { lines: ['TahoeOS 1.0 arm64'] }
    case 'open':
      return { lines: [`Opening ${arg || 'Finder'}...`] }
    case 'exit':
      return { lines: ['Session closed.'] }
    default:
      return { lines: [`zsh: command not found: ${command}`] }
  }
}
