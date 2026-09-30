<div align="center">

# Developer Documentation

开发者文档

</div>

---

## 中文

### 目录

- [架构设计](#架构设计)
- [项目结构](#项目结构)
- [API 文档](#api-文档)
- [配置说明](#配置说明)
- [本地开发](#本地开发)
- [构建](#构建)
- [测试](#测试)
- [部署](#部署)
- [发布](#发布)
- [贡献指南](#贡献指南)

### 架构设计

```
浏览器 (index.html + search.html + database.html)
    │  fetch XHR
    ▼
Express Server (server.js)
    ├── middleware/logger.js        ← 请求日志
    ├── middleware/errorHandler.js  ← 错误处理
    ├── static public/              ← 静态资源（首页/搜索/百科）
    └── /api/*  routes/api.js
              │
              ▼
        GenshinService (services/genshinService.js)
              │
              ▼
        genshin-db npm 包 (v5.2.12+)
```

分层职责：

| 层 | 文件 | 职责 |
|---|---|---|
| 入口 | `server.js` | Express 实例化、中间件挂载、路由挂载、端口监听 |
| 配置 | `config/index.js` | 环境变量加载、数据分类列表、分页配置 |
| 中间件 | `middleware/logger.js` | 请求日志记录 |
| 中间件 | `middleware/errorHandler.js` | 统一错误处理和 404 |
| 路由 | `routes/api.js` | API 端点定义、参数校验 |
| 服务 | `services/genshinService.js` | 封装 genshin-db 查询逻辑（搜索、分页浏览、详情） |
| 前端 | `public/` | 首页导航、搜索页、数据库百科页、样式、交互逻辑 |

### 项目结构

```
genshin-app/
├── config/
│   └── index.js              # 配置加载器（端口/语言/分页/分类）
├── docs/
│   └── DEVELOPER.md          # 本文档
├── middleware/
│   ├── logger.js             # 请求日志
│   └── errorHandler.js       # 错误处理
├── public/
│   ├── index.html            # 首页导航入口
│   ├── search.html           # 搜索页（精确/综合搜索）
│   ├── database.html         # 数据库百科页（卡片浏览+详情）
│   ├── css/
│   │   ├── style.css         # 搜索页暗色主题样式
│   │   └── database.css      # 数据库百科原神官网风格样式
│   └── js/
│       ├── app.js            # 搜索页前端逻辑
│       └── database.js      # 数据库百科前端逻辑（路由/卡片/详情）
├── routes/
│   └── api.js                # API 路由（search/category/item/count/list/folders）
├── services/
│   └── genshinService.js     # 数据服务层（搜索/分页/详情/摘要提取）
├── tests/
│   ├── api.test.js           # API 集成测试
│   └── service.test.js       # 服务层单元测试
├── .env.example              # 环境变量示例
├── .eslintrc.json            # ESLint 配置
├── .gitignore
├── Dockerfile                # Docker 部署
├── LICENSE
├── nodemon.json              # nodemon 配置
├── package.json
├── README.md                 # 玩家文档
└── server.js                 # 入口文件
```

### API 文档

#### `GET /api/search`

查询单个分类或跨所有分类搜索。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `folder` | string | 是 | 数据分类名（如 `characters`）或 `all` 进行综合搜索 |
| `query` | string | 是 | 搜索关键词 |
| `resultLanguage` | string | 否 | 结果语言，默认取配置值 |

**响应示例（单分类）：**

```json
{
  "name": "Furina",
  "fullname": "Furina",
  "title": "她",
  ...
}
```

**响应示例（综合搜索）：**

```json
{
  "type": "aggregated",
  "total": 3,
  "results": {
    "characters": { ... },
    "weapons": { ... },
    "materials": { ... }
  }
}
```

#### `GET /api/count`

获取指定分类的数据总数。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `folder` | string | 是 | 数据分类名或 `all` |

**响应：**

```json
{
  "folder": "characters",
  "count": 95
}
```

#### `GET /api/folders`

获取所有可用的数据分类列表。

**响应：**

```json
{
  "folders": ["characters", "talents", "constellations", ...]
}
```

#### `GET /api/list`

列出指定分类下所有数据项的名称。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `folder` | string | 是 | 数据分类名 |
| `resultLanguage` | string | 否 | 结果语言 |

**响应：**

```json
{
  "folder": "characters",
  "names": ["Amber", "Barbara", "Charlotte", ...]
}
```

#### `GET /api/category/:folder`

分页获取指定分类下的物品摘要列表（用于数据库百科卡片网格展示）。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `folder` | string | 是 | 数据分类名（路径参数） |
| `page` | number | 否 | 页码，默认取 `DEFAULT_PAGE` 配置值 |
| `pageSize` | number | 否 | 每页条数，默认取 `DEFAULT_PAGE_SIZE` 配置值 |
| `resultLanguage` | string | 否 | 结果语言 |

**响应：**

```json
{
  "folder": "characters",
  "page": 1,
  "pageSize": 24,
  "total": 120,
  "totalPages": 5,
  "items": [
    { "name": "安柏", "rarity": 4, "elementText": "火", "images": { ... } },
    ...
  ]
}
```

#### `GET /api/item/:folder/:name`

获取单个物品的完整详情数据（用于数据库百科详情面板展示）。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `folder` | string | 是 | 数据分类名（路径参数） |
| `name` | string | 是 | 物品名称（路径参数） |
| `resultLanguage` | string | 否 | 结果语言 |

**响应：** 返回 genshin-db 完整数据对象，包含 name、id、description、images、costs、stats 等全部字段。

### 配置说明

#### 环境变量

| 变量 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `PORT` | number | `3000` | 服务监听端口 |
| `RESULT_LANGUAGE` | string | `ChineseSimplified` | 默认结果输出语言 |
| `QUERY_LANGUAGES` | string (逗号分隔) | `ChineseSimplified,English,Japanese,Korean` | 查询输入语言列表 |
| `DEFAULT_PAGE` | number | `1` | 数据库百科默认起始页码 |
| `DEFAULT_PAGE_SIZE` | number | `24` | 数据库百科每页条数 |

#### 支持的语言

`ChineseSimplified`, `ChineseTraditional`, `English`, `French`, `German`, `Indonesian`, `Japanese`, `Korean`, `Portuguese`, `Russian`, `Spanish`, `Thai`, `Vietnamese`

#### 数据分类

项目支持以下 genshin-db 数据分类：

- **角色相关：** `characters`, `talents`, `constellations`, `outfits`
- **装备道具：** `weapons`, `artifacts`, `materials`
- **世界探索：** `foods`, `domains`, `enemies`, `animals`, `geographies`
- **收集成就：** `achievements`, `achievementgroups`, `namecards`, `windgliders`
- **其他：** `adventureranks`, `elements`, `crafts`, `rarity`
- **七圣召唤：** `tcgcharactercards`, `tcgactioncards`, `tcgcardbacks`, `tcgcardboxes`, `tcgkeywords`, `tcgsummons`, `tcgstatuseffects`, `tcgdetailedrules`, `tcglevelrewards`
- **材料类型：** `talentmaterialtypes`

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器（热重载）
npm run dev

# 启动生产服务器
npm start

# 运行测试
npm test

# 代码检查
npm run lint

# 代码格式化
npm run lint:fix
```

### 构建

将生产运行所需文件打包为 zip 归档（排除 tests、.github、node_modules 等）。

```bash
# 使用 package.json 中的版本号
npm run build

# 指定版本号（会同步更新 package.json）
npm run build 1.2.0
```

产物位于 `dist/genshin-app-v<版本号>.zip`。

### 测试

项目使用 Jest 作为测试框架。

```bash
# 运行所有测试
npm test

# 监听模式
npm run test:watch

# 覆盖率报告
npm run test:coverage
```

测试文件位于 `tests/` 目录，包含：
- `service.test.js` — GenshinService 单元测试
- `api.test.js` — API 端点集成测试

### 部署

#### Docker 部署

```bash
# 构建镜像
docker build -t genshin-app .

# 运行容器
docker run -p 3000:3000 --env-file .env genshin-app
```

#### 手动部署

```bash
npm install --production
npm start
```

确保目标环境已安装 Node.js 18+，并正确配置 `.env` 文件。

### 发布

项目通过 GitHub Actions 自动构建并发布 Release。

#### 发布流程

1. **编写版本更新说明**：在 `docs/releases/` 下创建 `v<版本号>.md` 文件（如 `docs/releases/v1.2.0.md`），内容作为 Release 的说明文本。
2. **提交并推送代码**：确保所有更改已提交到 `main` 分支。
3. **打 tag 并推送**：

   ```bash
   git tag v1.2.0
   git push origin v1.2.0
   ```

4. **自动构建发布**：GitHub Actions 检测到 tag 推送后，会自动：
   - 运行 Lint 和测试
   - 从 tag 名提取版本号（去掉 `v` 前缀）
   - 校验 `docs/releases/v1.2.0.md` 是否存在
   - 执行 `npm run build 1.2.0` 生成 `dist/genshin-app-v1.2.0.zip`
   - 创建 GitHub Release，以 `docs/releases/v1.2.0.md` 为说明，zip 为附件

#### 注意事项

- Tag 命名必须为 `v` 前缀格式（如 `v1.2.0`）。
- 发布前必须先创建对应的 `docs/releases/v<版本号>.md` 文件，否则 CI 会失败。
- 需在仓库 **Settings → Actions → General → Workflow permissions** 中设置为 **Read and write permissions**，以便 CI 创建 Release。

### 贡献指南

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'feat: add some feature'`
4. 推送分支：`git push origin feature/your-feature`
5. 提交 Pull Request

**提交规范：**

| 前缀 | 用途 |
|---|---|
| `feat:` | 新功能 |
| `fix:` | Bug 修复 |
| `docs:` | 文档更新 |
| `refactor:` | 代码重构 |
| `test:` | 测试相关 |
| `chore:` | 构建/工具变更 |

**代码要求：**
- 通过 ESLint 检查（`npm run lint`）
- 通过全部测试（`npm test`）
- 遵循现有代码风格
- 新功能需附带测试

---

## English

### Table of Contents

- [Architecture](#architecture)
- [Project Structure](#project-structure-1)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Local Development](#local-development-1)
- [Build](#build)
- [Testing](#testing-1)
- [Deployment](#deployment-1)
- [Release](#release)
- [Contributing](#contributing-1)

### Architecture

```
Browser (index.html + search.html + database.html)
    │  fetch XHR
    ▼
Express Server (server.js)
    ├── middleware/logger.js        ← request logging
    ├── middleware/errorHandler.js  ← error handling
    ├── static public/              ← static assets (home/search/database)
    └── /api/*  routes/api.js
              │
              ▼
        GenshinService (services/genshinService.js)
              │
              ▼
        genshin-db npm package (v5.2.12+)
```

Layer responsibilities:

| Layer | File | Responsibility |
|---|---|---|
| Entry | `server.js` | Express instantiation, middleware mounting, route mounting, port listening |
| Config | `config/index.js` | Environment variable loading, data category list, pagination config |
| Middleware | `middleware/logger.js` | Request logging |
| Middleware | `middleware/errorHandler.js` | Error handling and 404 |
| Routes | `routes/api.js` | API endpoint definitions, parameter validation |
| Service | `services/genshinService.js` | Wraps genshin-db query logic (search, pagination, detail) |
| Frontend | `public/` | Home navigation, search page, database browser, styles, interaction logic |

### Project Structure

```
genshin-app/
├── config/
│   └── index.js              # Config loader (port/lang/pagination/categories)
├── docs/
│   └── DEVELOPER.md          # This document
├── middleware/
│   ├── logger.js             # Request logger
│   └── errorHandler.js       # Error handler
├── public/
│   ├── index.html            # Home navigation entry
│   ├── search.html           # Search page (precise/aggregated)
│   ├── database.html         # Database browser (cards + detail)
│   ├── css/
│   │   ├── style.css         # Search page dark theme styles
│   │   └── database.css      # Database browser Genshin website style
│   └── js/
│       ├── app.js            # Search page frontend logic
│       └── database.js      # Database browser frontend logic (routing/cards/detail)
├── routes/
│   └── api.js                # API routes (search/category/item/count/list/folders)
├── services/
│   └── genshinService.js     # Data service (search/pagination/detail/summary)
├── tests/
│   ├── api.test.js           # API integration tests
│   └── service.test.js       # Service unit tests
├── .env.example              # Environment variable example
├── .eslintrc.json            # ESLint config
├── .gitignore
├── Dockerfile                # Docker deployment
├── LICENSE
├── nodemon.json              # nodemon config
├── package.json
├── README.md                 # Player documentation
└── server.js                 # Entry point
```

### API Documentation

#### `GET /api/search`

Search a single category or across all categories.

**Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `folder` | string | Yes | Data category name (e.g., `characters`) or `all` for aggregated search |
| `query` | string | Yes | Search keyword |
| `resultLanguage` | string | No | Result language, defaults to config value |

**Response (single category):**

```json
{
  "name": "Furina",
  "fullname": "Furina",
  "title": "She",
  ...
}
```

**Response (aggregated search):**

```json
{
  "type": "aggregated",
  "total": 3,
  "results": {
    "characters": { ... },
    "weapons": { ... },
    "materials": { ... }
  }
}
```

#### `GET /api/count`

Get the total number of records in a category.

**Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `folder` | string | Yes | Data category name or `all` |

**Response:**

```json
{
  "folder": "characters",
  "count": 95
}
```

#### `GET /api/folders`

Get all available data categories.

**Response:**

```json
{
  "folders": ["characters", "talents", "constellations", ...]
}
```

#### `GET /api/list`

List all item names in a category.

**Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `folder` | string | Yes | Data category name |
| `resultLanguage` | string | No | Result language |

**Response:**

```json
{
  "folder": "characters",
  "names": ["Amber", "Barbara", "Charlotte", ...]
}
```

#### `GET /api/category/:folder`

Get paginated item summaries for a category (used by the database browser card grid).

**Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `folder` | string | Yes | Data category name (path param) |
| `page` | number | No | Page number, defaults to `DEFAULT_PAGE` config |
| `pageSize` | number | No | Items per page, defaults to `DEFAULT_PAGE_SIZE` config |
| `resultLanguage` | string | No | Result language |

**Response:**

```json
{
  "folder": "characters",
  "page": 1,
  "pageSize": 24,
  "total": 120,
  "totalPages": 5,
  "items": [
    { "name": "Amber", "rarity": 4, "elementText": "Pyro", "images": { ... } },
    ...
  ]
}
```

#### `GET /api/item/:folder/:name`

Get full detail data for a single item (used by the database browser detail panel).

**Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `folder` | string | Yes | Data category name (path param) |
| `name` | string | Yes | Item name (path param) |
| `resultLanguage` | string | No | Result language |

**Response:** Returns the full genshin-db data object with all fields including name, id, description, images, costs, stats, etc.

### Configuration

#### Environment Variables

| Variable | Type | Default | Description |
|---|---|---|---|
| `PORT` | number | `3000` | Server listening port |
| `RESULT_LANGUAGE` | string | `ChineseSimplified` | Default result output language |
| `QUERY_LANGUAGES` | string (comma-separated) | `ChineseSimplified,English,Japanese,Korean` | Query input languages |
| `DEFAULT_PAGE` | number | `1` | Database viewer default starting page |
| `DEFAULT_PAGE_SIZE` | number | `24` | Database viewer items per page |

#### Supported Languages

`ChineseSimplified`, `ChineseTraditional`, `English`, `French`, `German`, `Indonesian`, `Japanese`, `Korean`, `Portuguese`, `Russian`, `Spanish`, `Thai`, `Vietnamese`

#### Data Categories

The project supports the following genshin-db data categories:

- **Characters:** `characters`, `talents`, `constellations`, `outfits`
- **Equipment:** `weapons`, `artifacts`, `materials`
- **World:** `foods`, `domains`, `enemies`, `animals`, `geographies`
- **Collection:** `achievements`, `achievementgroups`, `namecards`, `windgliders`
- **Other:** `adventureranks`, `elements`, `crafts`, `rarity`
- **TCG:** `tcgcharactercards`, `tcgactioncards`, `tcgcardbacks`, `tcgcardboxes`, `tcgkeywords`, `tcgsummons`, `tcgstatuseffects`, `tcgdetailedrules`, `tcglevelrewards`
- **Material Types:** `talentmaterialtypes`

### Local Development

```bash
# Install dependencies
npm install

# Start dev server (hot reload)
npm run dev

# Start production server
npm start

# Run tests
npm test

# Lint
npm run lint

# Fix linting issues
npm run lint:fix
```

### Build

Packages production runtime files into a zip archive (excludes tests, .github, node_modules, etc.).

```bash
# Use version from package.json
npm run build

# Specify version (also updates package.json)
npm run build 1.2.0
```

Output: `dist/genshin-app-v<version>.zip`.

### Testing

The project uses Jest as its test framework.

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

Test files are in the `tests/` directory:
- `service.test.js` — GenshinService unit tests
- `api.test.js` — API endpoint integration tests

### Deployment

#### Docker

```bash
# Build image
docker build -t genshin-app .

# Run container
docker run -p 3000:3000 --env-file .env genshin-app
```

#### Manual

```bash
npm install --production
npm start
```

Ensure Node.js 18+ is installed and `.env` is configured correctly.

### Release

The project uses GitHub Actions to automatically build and publish releases.

#### Release process

1. **Write release notes**: Create `docs/releases/v<version>.md` (e.g. `docs/releases/v1.2.0.md`) — its content becomes the Release description.
2. **Commit and push** all changes to the `main` branch.
3. **Tag and push**:

   ```bash
   git tag v1.2.0
   git push origin v1.2.0
   ```

4. **Auto build & release**: GitHub Actions detects the tag push and automatically:
   - Runs Lint and tests
   - Extracts version from tag name (strips `v` prefix)
   - Verifies `docs/releases/v1.2.0.md` exists
   - Runs `npm run build 1.2.0` to produce `dist/genshin-app-v1.2.0.zip`
   - Creates a GitHub Release using the md file as body and the zip as asset

#### Notes

- Tags must use the `v` prefix (e.g. `v1.2.0`).
- The corresponding `docs/releases/v<version>.md` must exist before pushing the tag, otherwise CI fails.
- Set **Settings → Actions → General → Workflow permissions** to **Read and write permissions** so CI can create releases.

### Contributing

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'feat: add some feature'`
4. Push branch: `git push origin feature/your-feature`
5. Submit a Pull Request

**Commit conventions:**

| Prefix | Usage |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation |
| `refactor:` | Code refactoring |
| `test:` | Testing |
| `chore:` | Build/tooling |

**Code requirements:**
- Pass ESLint checks (`npm run lint`)
- Pass all tests (`npm test`)
- Follow existing code style
- Include tests for new features
