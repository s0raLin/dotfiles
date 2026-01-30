
import { ConfigCategory, ConfigFile, SystemInfo } from './types';

export const CONFIG_CATEGORIES: ConfigCategory[] = [
  {
    id: 'shell',
    name: 'Shell 配置',
    icon: 'Terminal',
    color: 'bg-green-500',
    description: 'Bash, Zsh, Fish 等 Shell 配置文件'
  },
  {
    id: 'editor',
    name: '编辑器配置',
    icon: 'FileText',
    color: 'bg-blue-500',
    description: 'Vim, Neovim, Emacs 等编辑器配置'
  },
  {
    id: 'git',
    name: 'Git 配置',
    icon: 'GitBranch',
    color: 'bg-orange-500',
    description: 'Git 全局配置和忽略文件'
  },
  {
    id: 'ssh',
    name: 'SSH 配置',
    icon: 'Key',
    color: 'bg-purple-500',
    description: 'SSH 客户端配置和密钥管理'
  },
  {
    id: 'system',
    name: '系统配置',
    icon: 'Settings',
    color: 'bg-red-500',
    description: '系统级配置文件'
  },
  {
    id: 'app',
    name: '应用配置',
    icon: 'Package',
    color: 'bg-indigo-500',
    description: '各种应用程序的配置文件'
  }
];

export const COMMON_CONFIG_FILES: Omit<ConfigFile, 'lastModified' | 'size' | 'backupExists'>[] = [
  // Shell 配置
  {
    id: 'bashrc',
    name: '.bashrc',
    path: '~/.bashrc',
    category: CONFIG_CATEGORIES[0],
    description: 'Bash shell 配置文件',
    isSymlink: false
  },
  {
    id: 'zshrc',
    name: '.zshrc',
    path: '~/.zshrc',
    category: CONFIG_CATEGORIES[0],
    description: 'Zsh shell 配置文件',
    isSymlink: false
  },
  {
    id: 'profile',
    name: '.profile',
    path: '~/.profile',
    category: CONFIG_CATEGORIES[0],
    description: '通用 shell 配置文件',
    isSymlink: false
  },
  
  // 编辑器配置
  {
    id: 'vimrc',
    name: '.vimrc',
    path: '~/.vimrc',
    category: CONFIG_CATEGORIES[1],
    description: 'Vim 编辑器配置文件',
    isSymlink: false
  },
  {
    id: 'nvim-init',
    name: 'init.lua',
    path: '~/.config/nvim/init.lua',
    category: CONFIG_CATEGORIES[1],
    description: 'Neovim 配置文件',
    isSymlink: false
  },
  
  // Git 配置
  {
    id: 'gitconfig',
    name: '.gitconfig',
    path: '~/.gitconfig',
    category: CONFIG_CATEGORIES[2],
    description: 'Git 全局配置文件',
    isSymlink: false
  },
  {
    id: 'gitignore',
    name: '.gitignore_global',
    path: '~/.gitignore_global',
    category: CONFIG_CATEGORIES[2],
    description: 'Git 全局忽略文件',
    isSymlink: false
  },
  
  // SSH 配置
  {
    id: 'ssh-config',
    name: 'config',
    path: '~/.ssh/config',
    category: CONFIG_CATEGORIES[3],
    description: 'SSH 客户端配置文件',
    isSymlink: false
  },
  
  // 系统配置
  {
    id: 'hosts',
    name: 'hosts',
    path: '/etc/hosts',
    category: CONFIG_CATEGORIES[4],
    description: '系统主机名解析文件',
    isSymlink: false
  }
];

export const SAMPLE_SYSTEM_INFO: SystemInfo = {
  os: 'Linux',
  kernel: '6.1.0-13-amd64',
  shell: '/bin/bash',
  homeDir: '/home/user',
  user: 'user'
};

export const SAMPLE_BASHRC = `# ~/.bashrc: executed by bash(1) for non-login shells.

# If not running interactively, don't do anything
case $- in
    *i*) ;;
      *) return;;
esac

# History settings
HISTCONTROL=ignoreboth
HISTSIZE=1000
HISTFILESIZE=2000

# Append to the history file, don't overwrite it
shopt -s histappend

# Check the window size after each command
shopt -s checkwinsize

# Enable color support of ls and also add handy aliases
if [ -x /usr/bin/dircolors ]; then
    test -r ~/.dircolors && eval "$(dircolors -b ~/.dircolors)" || eval "$(dircolors -b)"
    alias ls='ls --color=auto'
    alias grep='grep --color=auto'
    alias fgrep='fgrep --color=auto'
    alias egrep='egrep --color=auto'
fi

# Some more ls aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'

# Custom aliases
alias ..='cd ..'
alias ...='cd ../..'
alias h='history'
alias c='clear'

# Custom functions
mkcd() {
    mkdir -p "$1" && cd "$1"
}

# Load additional configurations
if [ -f ~/.bash_aliases ]; then
    . ~/.bash_aliases
fi`;

export const SAMPLE_GITCONFIG = `[user]
    name = Your Name
    email = your.email@example.com

[core]
    editor = vim
    autocrlf = input
    excludesfile = ~/.gitignore_global

[init]
    defaultBranch = main

[push]
    default = simple

[pull]
    rebase = false

[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    df = diff
    lg = log --oneline --graph --decorate --all

[color]
    ui = auto

[diff]
    tool = vimdiff

[merge]
    tool = vimdiff`;
