import { Command } from "commander";
import { startServer } from "./server";
import { validateMarkdownFile } from "./utils/file-validator";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const program = new Command();

// package.jsonからバージョンを取得
const packageJsonPath = join(__dirname, "../package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

// 利用可能なテンプレート
const AVAILABLE_TEMPLATES = [
  { name: 'basic', description: 'シンプルなMarkdown形式（エンジニア向け）' },
  { name: 'business', description: 'ビジネス向けレイアウト' },
  { name: 'designer', description: 'UI/UXデザイナー向け' },
  { name: 'freelancer', description: 'フリーランス向け' },
  { name: 'html-sample', description: 'HTML + Tailwind CSS（高度なデザイン）' },
  { name: 'image-sample', description: '画像ファイル使用例' },
  { name: 'print-friendly', description: '印刷フレンドリー（背景色不要）' },
];

program
  .name("name-card")
  .description("Markdown-based business card generator")
  .version(packageJson.version);

// テンプレート一覧表示コマンド
program
  .command("list-templates")
  .description("利用可能なテンプレート一覧を表示")
  .action(() => {
    console.log("📋 利用可能なテンプレート:\n");
    AVAILABLE_TEMPLATES.forEach(template => {
      console.log(`  ${template.name.padEnd(15)} - ${template.description}`);
    });
    console.log("\n使用方法:");
    console.log("  name-card --template <template-name>");
    console.log("  例: name-card --template html-sample");
  });

program
  .argument("[file]", "Markdown file path")
  .option("-p, --port <port>", "Server port", "3000")
  .option("-t, --template <template>", "Use predefined template")
  .option("--no-open", "Do not open browser automatically")
  .action(async (file?: string, options?) => {
    try {
      let targetFile = file;

      // テンプレート指定がある場合
      if (options.template) {
        const template = AVAILABLE_TEMPLATES.find(t => t.name === options.template);
        if (!template) {
          console.error(`❌ Template '${options.template}' not found.`);
          console.log("\n利用可能なテンプレート:");
          AVAILABLE_TEMPLATES.forEach(t => {
            console.log(`  - ${t.name}`);
          });
          process.exit(1);
        }

        targetFile = join(__dirname, `../templates/${options.template}.md`);
        console.log(`📄 Using template: ${template.name} - ${template.description}`);
      }

      // ファイル指定がない場合はエラー
      if (!targetFile) {
        console.error("❌ Markdown file path is required.");
        console.log("\n使用方法:");
        console.log("  name-card <file>              - 指定ファイルを使用");
        console.log("  name-card --template <name>   - テンプレートを使用");
        console.log("  name-card list-templates      - テンプレート一覧表示");
        process.exit(1);
      }

      // ファイル存在確認
      await validateMarkdownFile(targetFile);

      // サーバー起動
      await startServer(targetFile, {
        port: parseInt(options.port),
        openBrowser: options.open,
      });
    } catch (error) {
      console.error("Error:", (error as Error).message);
      process.exit(1);
    }
  });

program.parse();
