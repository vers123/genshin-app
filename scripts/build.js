/**
 * 构建脚本：将生产运行所需文件打包为 zip 归档
 *
 * 用法：
 *   node scripts/build.js              # 使用 package.json 中的版本号
 *   node scripts/build.js 1.2.0        # 指定版本号
 *
 * 产物：dist/genshin-app-v<version>.zip
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT, 'dist');

// 需要打包的文件/目录（相对于项目根目录）
const INCLUDE_PATTERNS = [
    'package.json',
    'package-lock.json',
    'server.js',
    'config',
    'routes',
    'services',
    'middleware',
    'public',
    'Dockerfile',
    '.dockerignore',
    '.env.example',
    'LICENSE',
    'README.md',
    'nodemon.json'
];

// 排除规则（在被包含的目录内进一步过滤）
const EXCLUDE_DIRS = new Set(['node_modules', '.git', 'dist', 'coverage', 'tests', '.github']);
const EXCLUDE_FILES = new Set(['.env', '.DS_Store', '*.log']);

/**
 * 获取版本号：优先 CLI 参数，其次 package.json
 */
function getVersion() {
    const arg = process.argv[2];
    if (arg) return arg.replace(/^v/, '');
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    return pkg.version;
}

/**
 * 递归收集目录下的文件
 */
function collectFiles(dir, baseDir, results = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.relative(baseDir, fullPath);

        if (entry.isDirectory()) {
            if (EXCLUDE_DIRS.has(entry.name)) continue;
            collectFiles(fullPath, baseDir, results);
        } else if (entry.isFile()) {
            if (EXCLUDE_FILES.has(entry.name)) continue;
            if (entry.name.endsWith('.log')) continue;
            results.push({ fullPath, relPath });
        }
    }
    return results;
}

/**
 * 检查路径是否应被包含
 */
function shouldInclude(relPath) {
    const normalized = relPath.split(path.sep).join('/');
    for (const pattern of INCLUDE_PATTERNS) {
        if (normalized === pattern || normalized.startsWith(pattern + '/')) {
            return true;
        }
    }
    return false;
}

function build() {
    const version = getVersion();
    const archiveName = `genshin-app-v${version}.zip`;
    const outputPath = path.join(DIST_DIR, archiveName);

    // 确保 dist 目录存在
    if (!fs.existsSync(DIST_DIR)) {
        fs.mkdirSync(DIST_DIR, { recursive: true });
    }

    // 更新 package.json 版本号并写回磁盘（使归档内版本与 tag 一致）
    const pkgPath = path.join(ROOT, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (pkg.version !== version) {
        pkg.version = version;
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
        console.log(`[build] package.json 版本已更新为 ${version}`);
    }

    // 收集所有文件
    const allFiles = collectFiles(ROOT, ROOT);
    const filesToPack = allFiles.filter(f => shouldInclude(f.relPath));

    // 收集 docs/releases 中的版本说明文件（随归档附带）
    const releaseNotesFile = path.join(ROOT, 'docs', 'releases', `v${version}.md`);
    if (fs.existsSync(releaseNotesFile)) {
        filesToPack.push({
            fullPath: releaseNotesFile,
            relPath: path.relative(ROOT, releaseNotesFile)
        });
    }

    console.log(`[build] 版本: v${version}`);
    console.log(`[build] 打包 ${filesToPack.length} 个文件`);

    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
            console.log(`[build] 完成: ${archiveName} (${sizeMB} MB)`);
            resolve(outputPath);
        });

        archive.on('error', reject);
        archive.pipe(output);

        for (const file of filesToPack) {
            archive.file(file.fullPath, { name: file.relPath.split(path.sep).join('/') });
        }

        archive.finalize();
    });
}

build().catch(err => {
    console.error('[build] 失败:', err);
    process.exit(1);
});
