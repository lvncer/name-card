"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMarkdownFile = validateMarkdownFile;
const fs_1 = require("fs");
const path_1 = require("path");
async function validateMarkdownFile(filePath) {
    try {
        await fs_1.promises.access(filePath);
    }
    catch {
        throw new Error(`File not found: ${filePath}`);
    }
    if ((0, path_1.extname)(filePath) !== ".md") {
        throw new Error("File must be a Markdown file (.md)");
    }
}
//# sourceMappingURL=file-validator.js.map