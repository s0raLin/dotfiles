# 🚀 I built a modern web-based Linux config file manager with VSCode-like interface


Hey ! I've been working on a project that I think many of you might find useful - a modern web-based configuration file manager for Linux systems.


## What is it?


**Linux Config Manager** is a web application that provides a VSCode-like interface for managing your Linux configuration files. Instead of jumping between different directories and using various text editors, you get everything in one clean, modern interface.


## 🎯 Key Features


### 📁 **Organized Config Management**
- **Shell configs**: .bashrc, .zshrc, .profile, etc.
- **Editor configs**: .vimrc, Neovim configurations
- **Git configs**: .gitconfig, global .gitignore
- **SSH configs**: Client configs and keys
- **System configs**: /etc/hosts, crontab, etc.
- **App configs**: Various application configuration files


### 🎨 **Modern Interface**
- VSCode-inspired three-panel layout
- Dark theme support
- Responsive design for all screen sizes
- Intuitive file tree navigation
- Real-time file modification indicators


### ✏️ **Built-in Editor**
- Syntax highlighting for common config formats
- Line numbers and file status indicators
- Real-time editing with instant save
- File backup creation
- Read-only mode for system files


### 🔧 **Smart Features**
- Symlink detection and handling
- File size and modification time display
- Connection status monitoring
- System information display
- Automatic backup management


## 🛠️ Tech Stack


**Frontend**: React 19 + TypeScript + Vite + Tailwind CSS  
**Backend**: Go with Gorilla Mux  
**Package Manager**: pnpm


## 🚀 Getting Started


```bash
# Clone the repo
git clone <your-repo-url>
cd linux-config-manager


# Quick start with the included script
chmod +x start.sh
./start.sh


# Or manually:
pnpm install
cd backend && go mod tidy && go run main.go &
cd .. && pnpm dev
```


Then visit `http://localhost:3000` and you're ready to go!


## 🎯 Why I Built This


As someone who manages multiple Linux systems, I got tired of:
- Constantly `cd`-ing between config directories
- Opening multiple terminal tabs for different configs
- Losing track of which files I've modified
- Manually creating backups before making changes
- Using different editors for different file types


This tool centralizes everything into one clean interface while maintaining the power and flexibility of direct file editing.


## 🔮 What's Next


I'm planning to add:
- [ ] Config file search and replace
- [ ] Syntax validation and error checking
- [ ] Configuration templates
- [ ] Git integration for version control
- [ ] Remote server config management
- [ ] Plugin system


## 🤝 Feedback Welcome!


This is still early stage, but it's already quite functional for daily use. I'd love to hear your thoughts, suggestions, or if you encounter any issues!

---


*Built with ❤️ for the Linux community. MIT licensed and open source!*


## Screenshots


[You should add some screenshots here showing the interface]


---


**TL;DR**: Web-based config file manager with VSCode-like interface. Manage all your Linux configs in one place with syntax highlighting, backups, and real-time editing.
