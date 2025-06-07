import { Command } from "commander";
import { startServer } from "./server";
import { validateMarkdownFile } from "./utils/file-validator";

const program = new Command();

program
  .name("name-card")
  .description("Markdown-based business card generator")
  .version("1.0.0");

program
  .argument("<file>", "Markdown file path")
  .option("-p, --port <port>", "Server port", "3000")
  .option("--no-open", "Do not open browser automatically")
  .action(async (file: string, options) => {
    try {
      // ファイル存在確認
      await validateMarkdownFile(file);

      // サーバー起動
      await startServer(file, {
        port: parseInt(options.port),
        openBrowser: options.open,
      });
    } catch (error) {
      console.error("Error:", (error as Error).message);
      process.exit(1);
    }
  });

program.parse();
