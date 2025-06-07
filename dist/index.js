"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const server_1 = require("./server");
const file_validator_1 = require("./utils/file-validator");
const program = new commander_1.Command();
program
    .name("name-card")
    .description("Markdown-based business card generator")
    .version("1.0.0");
program
    .argument("<file>", "Markdown file path")
    .option("-p, --port <port>", "Server port", "3000")
    .option("--no-open", "Do not open browser automatically")
    .action(async (file, options) => {
    try {
        // ファイル存在確認
        await (0, file_validator_1.validateMarkdownFile)(file);
        // サーバー起動
        await (0, server_1.startServer)(file, {
            port: parseInt(options.port),
            openBrowser: options.open,
        });
    }
    catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
});
program.parse();
//# sourceMappingURL=index.js.map