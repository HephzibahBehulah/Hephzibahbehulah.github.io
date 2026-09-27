/* ========================================
   HEPHZIBAH BEHULAH - TERMINAL EMULATOR
   Version: 1.0.0
   Description: Web-based terminal emulator for pentest tools
   ======================================== */

(function() {
    'use strict';

    // ========================================
    // TERMINAL STATE
    // ========================================
    const state = {
        history: [],
        historyIndex: -1,
        commandBuffer: '',
        isRunning: false
    };

    // ========================================
    // DOM REFS
    // ========================================
    let terminalOutput;
    let terminalInput;
    let terminalBody;

    // ========================================
    // INITIALIZE
    // ========================================
    document.addEventListener('DOMContentLoaded', function() {
        terminalOutput = document.getElementById('terminalOutput');
        terminalInput = document.getElementById('terminalInput');
        terminalBody = document.getElementById('terminalBody');

        if (terminalInput) {
            terminalInput.addEventListener('keydown', handleTerminalInput);
            terminalInput.addEventListener('focus', () => {
                terminalInput.select();
            });
        }

        // Handle terminal close
        const closeBtn = document.querySelector('.terminal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeTerminal);
        }

        // Handle escape key to close
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const modal = document.getElementById('terminalModal');
                if (modal && modal.style.display === 'flex') {
                    closeTerminal();
                }
            }
        });

        // Click outside to close
        const modal = document.getElementById('terminalModal');
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeTerminal();
                }
            });
        }
    });

    // ========================================
    // TERMINAL HANDLERS
    // ========================================
    function handleTerminalInput(e) {
        if (e.key === 'Enter') {
            const command = this.value.trim();
            if (command) {
                executeCommand(command);
                state.history.push(command);
                state.historyIndex = state.history.length;
            }
            this.value = '';
            return;
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (state.historyIndex > 0) {
                state.historyIndex--;
                this.value = state.history[state.historyIndex] || '';
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (state.historyIndex < state.history.length - 1) {
                state.historyIndex++;
                this.value = state.history[state.historyIndex] || '';
            } else {
                state.historyIndex = state.history.length;
                this.value = '';
            }
            return;
        }

        if (e.key === 'Tab') {
            e.preventDefault();
            // Simple command completion
            const command = this.value.trim();
            if (command) {
                const matches = getCommandSuggestions(command);
                if (matches.length === 1) {
                    this.value = matches[0] + ' ';
                } else if (matches.length > 1) {
                    appendTerminalOutput(`Possible commands: ${matches.join(', ')}`);
                }
            }
        }
    }

    // ========================================
    // COMMAND EXECUTION
    // ========================================
    function executeCommand(command) {
        appendTerminalOutput(`$ ${command}`);

        const parts = command.split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        // Built-in commands
        switch (cmd) {
            case 'help':
                showHelp();
                break;
            case 'list':
                listTools();
                break;
            case 'run':
                if (args.length > 0) {
                    const toolId = parseInt(args[0]);
                    if (!isNaN(toolId) && toolId >= 1 && toolId <= 50) {
                        runTool(toolId);
                    } else {
                        appendTerminalOutput(`❌ Invalid tool ID: ${args[0]}`);
                        appendTerminalOutput('Use "list" to see available tools.');
                    }
                } else {
                    appendTerminalOutput('❌ Usage: run [tool-number]');
                }
                break;
            case 'clear':
                clearTerminal();
                break;
            case 'exit':
                appendTerminalOutput('🚪 Exiting terminal...');
                setTimeout(closeTerminal, 1000);
                break;
            case 'whoami':
                appendTerminalOutput('Hephzibah Behulah (ethical hacker)');
                break;
            case 'date':
                appendTerminalOutput(new Date().toLocaleString());
                break;
            case 'ping':
                appendTerminalOutput(`Pinging ${args[0] || 'localhost'}...`);
                appendTerminalOutput('Reply from 127.0.0.1: bytes=32 time<1ms TTL=128');
                break;
            default:
                // Check if it's a tool number shortcut
                const numCmd = parseInt(cmd);
                if (!isNaN(numCmd) && numCmd >= 1 && numCmd <= 50) {
                    runTool(numCmd);
                } else {
                    appendTerminalOutput(`❌ Unknown command: ${cmd}`);
                    appendTerminalOutput('Type "help" for available commands.');
                }
        }

        // Scroll to bottom
        scrollTerminal();
    }

    // ========================================
    // COMMAND HELPERS
    // ========================================
    function showHelp() {
        appendTerminalOutput('');
        appendTerminalOutput('╔══════════════════════════════════════════════════════════╗');
        appendTerminalOutput('║  🔐 HEPHZIBAH PENTEST TERMINAL - AVAILABLE COMMANDS    ║');
        appendTerminalOutput('╚══════════════════════════════════════════════════════════╝');
        appendTerminalOutput('');
        appendTerminalOutput('  help     - Show this help message');
        appendTerminalOutput('  list     - List all available tools');
        appendTerminalOutput('  run [n]  - Run tool number n (1-50)');
        appendTerminalOutput('  clear    - Clear terminal screen');
        appendTerminalOutput('  exit     - Close terminal');
        appendTerminalOutput('  whoami   - Display current user');
        appendTerminalOutput('  date     - Show current date/time');
        appendTerminalOutput('  ping     - Ping a host');
        appendTerminalOutput('  [1-50]   - Quick tool launch by number');
        appendTerminalOutput('');
        appendTerminalOutput('💡 Tip: Use arrow keys for command history');
        appendTerminalOutput('💡 Tip: Press Tab for command completion');
        appendTerminalOutput('');
    }

    function listTools() {
        appendTerminalOutput('');
        appendTerminalOutput('╔══════════════════════════════════════════════════════════╗');
        appendTerminalOutput('║  🔧 AVAILABLE PENTEST TOOLS (1-50)                      ║');
        appendTerminalOutput('╚══════════════════════════════════════════════════════════╝');
        appendTerminalOutput('');
        
        const tools = window.pentestTools || [];
        if (tools.length === 0) {
            appendTerminalOutput('⚠️ Tool list not loaded. Please refresh.');
            return;
        }

        // Group by category
        const categories = {};
        tools.forEach(tool => {
            if (!categories[tool.category]) {
                categories[tool.category] = [];
            }
            categories[tool.category].push(tool);
        });

        Object.keys(categories).forEach(cat => {
            appendTerminalOutput(`📂 ${cat.toUpperCase()}:`);
            categories[cat].forEach(tool => {
                appendTerminalOutput(`  ${String(tool.id).padStart(2, ' ')}. ${tool.name}`);
            });
            appendTerminalOutput('');
        });

        appendTerminalOutput('💡 Run a tool: run [number] or just type the number');
        appendTerminalOutput('');
    }

    function getCommandSuggestions(prefix) {
        const commands = ['help', 'list', 'run', 'clear', 'exit', 'whoami', 'date', 'ping'];
        return commands.filter(cmd => cmd.startsWith(prefix));
    }

    // ========================================
    // TOOL EXECUTION
    // ========================================
    function runTool(toolId) {
        const tools = window.pentestTools || [];
        const tool = tools.find(t => t.id === toolId);
        
        if (!tool) {
            appendTerminalOutput(`❌ Tool #${toolId} not found. Use "list" to see available tools.`);
            return;
        }

        appendTerminalOutput(`▶️ Running: ${tool.name}`);
        appendTerminalOutput(`📝 ${tool.description}`);
        appendTerminalOutput(`🔧 Command: ${tool.command}`);
        appendTerminalOutput(`📦 Package: ${tool.package || 'N/A'}`);
        appendTerminalOutput('');

        // Simulate tool execution
        simulateToolExecution(tool);
    }

    function simulateToolExecution(tool) {
        appendTerminalOutput(`[*] Initializing ${tool.name}...`);
        
        setTimeout(() => {
            appendTerminalOutput(`[✓] ${tool.name} is ready!`);
            appendTerminalOutput(`[ℹ] For full documentation: https://www.kali.org/tools/${tool.package}/`);
            appendTerminalOutput('');
            appendTerminalOutput(`🎯 Example usage:`);
            appendTerminalOutput(`   $ ${tool.command}`);
            appendTerminalOutput('');
            appendTerminalOutput('💡 Ready for next command');
        }, 500 + Math.random() * 500);
    }

    // ========================================
    // TERMINAL UI FUNCTIONS
    // ========================================
    function appendTerminalOutput(text) {
        if (!terminalOutput) return;

        const line = document.createElement('div');
        line.className = 'line';
        
        // Handle special formatting
        if (text.startsWith('✅') || text.startsWith('❌') || text.startsWith('⚠️')) {
            line.style.color = text.startsWith('✅') ? '#22c55e' : 
                              text.startsWith('❌') ? '#ef4444' : '#f59e0b';
        }

        line.textContent = text;
        terminalOutput.insertBefore(line, terminalOutput.lastElementChild);
        scrollTerminal();
    }

    function clearTerminal() {
        if (!terminalOutput) return;
        terminalOutput.innerHTML = `
            <div class="line">🔐 Terminal cleared.</div>
            <div class="line prompt">$ <span class="cursor">▊</span></div>
        `;
    }

    function scrollTerminal() {
    if (terminalBody) {
        terminalBody.scrollTop = terminalBody.scrollHeight;
        // Ensure it stays scrolled down after content loads
        setTimeout(() => {
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }, 50);
    }
}

    function closeTerminal() {
        const modal = document.getElementById('terminalModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // ========================================
    // EXPOSE TERMINAL API
    // ========================================
    window.terminal = {
        executeCommand,
        appendOutput: appendTerminalOutput,
        clear: clearTerminal,
        close: closeTerminal,
        scroll: scrollTerminal
    };

    // Make tools available globally
    window.pentestTools = window.pentestTools || [];

})();
