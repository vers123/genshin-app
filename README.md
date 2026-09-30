<div align="center">

# GenshinDB Search Web

**A searchable web interface and visual database browser for the Genshin Impact database**

基于 [genshin-db](https://www.npmjs.com/package/genshin-db) 数据包构建的原神数据库搜索与百科浏览 Web 应用

[功能特性](#功能特性) | [快速开始](#快速开始) | [使用指南](#使用指南) | [English](#english)

</div>

---

## 中文

### 功能特性

- **全分类搜索** — 覆盖角色、武器、圣遗物、材料、食物、秘境、敌人等 20+ 个数据分类
- **综合搜索** — 一次性跨所有分类查询，结果分页浏览
- **数据库百科** — 可视化卡片图鉴浏览，展开查看详细信息，类似原神官网风格
- **分类浏览** — 首页入口按分组展示所有分类，点击进入卡片网格视图
- **手风琴详情** — 点击卡片弹出模态框，手风琴折叠展示基础信息、图片、升级素材、天赋技能等
- **筛选与排序** — 支持名称筛选和稀有度/名称排序
- **多语言支持** — 支持简体中文、繁体中文、英语、日语、韩语等 13 种语言
- **自动补全** — 输入部分名称即可匹配（如输入 "amb" 自动匹配 "安柏"）
- **实时数据** — 数据来源于 genshin-db npm 包，随版本更新
- **响应式界面** — 适配桌面和移动端浏览器
- **七圣召唤数据** — 包含七圣召唤卡牌相关数据分类

### 数据分类

| 分类 | 说明 | 分类 | 说明 |
|---|---|---|---|
| characters | 角色 | foods | 食物 |
| talents | 天赋 | domains | 秘境 |
| constellations | 命之座 | enemies | 敌人 |
| outfits | 衣装 | animals | 动物 |
| weapons | 武器 | geographies | 地理志 |
| artifacts | 圣遗物 | achievements | 成就 |
| materials | 材料 | namecards | 名片 |
| windgliders | 风之翼 | adventureranks | 冒险等阶 |
| elements | 元素 | crafts | 锻造 |
| rarity | 稀有度 | tcgcharactercards | 七圣召唤角色卡 |
| tcgactioncards | 七圣召唤行动卡 | tcgcardbacks | 七圣召唤卡背 |

### 快速开始

#### 环境要求

- [Node.js](https://nodejs.org/) 18+ (推荐 LTS 版本)
- npm 9+

#### 安装与运行

```bash
git clone https://github.com/vers123/genshin-app.git

cd genshin-app

npm install

npm start
```

启动后访问 http://localhost:3000 即可使用。

#### 页面说明

| 页面 | URL | 说明 |
|---|---|---|
| 首页 | `/` | 入口导航页，选择进入搜索或百科 |
| 数据搜索 | `/search.html` | 实时模糊搜索，跨分类统一排名，点击查看详情 |
| 数据库百科 | `/database.html` | 卡片图鉴浏览，展开查看详情 |

#### 开发模式

```bash
npm run dev
```

使用 nodemon 自动重启，修改代码后自动生效。

### 使用指南

#### 搜索数据

1. 在搜索框输入要查询的名称（如 "芙宁娜"、"雾切"、"原石"）
2. 选择查询分类：
   - **综合搜索（全部）** — 跨所有分类查询，结果按分类分页
   - **具体分类** — 在选定分类中精确查询
3. 选择结果语言（默认简体中文）
4. 点击「查询」按钮或按 Enter 键

#### 示例查询

| 输入 | 选择分类 | 结果 |
|---|---|---|
| 芙宁娜 | 角色 | 芙宁娜的完整数据 |
| 雾切 | 武器 | 雾切之回光数据 |
| 综合搜索 → 输入 "fire" | 综合搜索 | 所有分类中匹配 "fire" 的结果 |

### 配置说明

项目根目录的 `.env` 文件支持以下配置：

| 变量 | 默认值 | 说明 |
|---|---|---|
| `PORT` | `3000` | 服务端口 |
| `RESULT_LANGUAGE` | `ChineseSimplified` | 默认输出语言 |
| `QUERY_LANGUAGES` | `ChineseSimplified,English,Japanese,Korean` | 查询输入语言列表 |
| `DEFAULT_PAGE` | `1` | 数据库百科默认起始页 |
| `DEFAULT_PAGE_SIZE` | `24` | 数据库百科每页条数 |

### 常见问题

<details>
<summary><b>数据是最新的吗？</b></summary>

数据随 genshin-db npm 包更新。运行 `npm update genshin-db` 即可获取最新数据。
</details>

<details>
<summary><b>支持哪些语言？</b></summary>

支持简体中文、繁体中文、英语、法语、德语、印尼语、日语、韩语、葡萄牙语、俄语、西班牙语、泰语、越南语。
</details>

<details>
<summary><b>端口被占用怎么办？</b></summary>

修改 `.env` 文件中的 `PORT` 值，如 `PORT=8080`。
</details>

### 技术栈

| 技术 | 用途 |
|---|---|
| [Express](https://expressjs.com/) | Web 服务框架 |
| [genshin-db](https://www.npmjs.com/package/genshin-db) | 原神数据源 |
| [dotenv](https://www.npmjs.com/package/dotenv) | 环境变量管理 |
| 原生 HTML/CSS/JS | 前端界面 |

### 开发者文档

如需了解架构设计、API 文档、贡献指南等内容，请查阅 [开发者文档](docs/DEVELOPER.md)。

### 构建与发布

- **本地构建**：`npm run build` 生成 `dist/genshin-app-v<版本>.zip`
- **发布流程**：推送 tag（如 `git tag v1.2.0 && git push origin v1.2.0`）后，GitHub Actions 自动构建并创建 Release
- **版本说明**：发布前需在 `docs/releases/v<版本>.md` 编写更新说明，作为 Release 描述文本
- 详见 [开发者文档 - 发布章节](docs/DEVELOPER.md#发布)

### 许可证

[MIT License](LICENSE) - Copyright (c) 2026 昤兰

---

## English

### Features

- **Full-category search** — Covers 20+ data categories including characters, weapons, artifacts, materials, food, domains, enemies, etc.
- **Aggregated search** — Query across all categories at once with paginated results
- **Database browser** — Visual card-based browsing with expandable details, Genshin official website style
- **Category browsing** — Home page shows all categories grouped by type, click to enter card grid view
- **Accordion details** — Click a card to open a modal with collapsible sections for basic info, images, ascension materials, talents, etc.
- **Filter & sort** — Filter by name and sort by rarity or name
- **Multi-language support** — Supports 13 languages including Chinese (Simplified/Traditional), English, Japanese, Korean, etc.
- **Auto-completion** — Partial input matches automatically (e.g., typing "amb" matches "Amber")
- **Up-to-date data** — Data sourced from the genshin-db npm package, updated with versions
- **Responsive UI** — Adapts to both desktop and mobile browsers
- **TCG data** — Includes Genius Invokation TCG card data categories

### Data Categories

| Category | Description | Category | Description |
|---|---|---|---|
| characters | Characters | foods | Foods |
| talents | Talents | domains | Domains |
| constellations | Constellations | enemies | Enemies |
| outfits | Outfits | animals | Animals |
| weapons | Weapons | geographies | Geographies |
| artifacts | Artifacts | achievements | Achievements |
| materials | Materials | namecards | Namecards |
| windgliders | Windgliders | adventureranks | Adventure Ranks |
| elements | Elements | crafts | Crafts |
| rarity | Rarity | tcgcharactercards | TCG Character Cards |
| tcgactioncards | TCG Action Cards | tcgcardbacks | TCG Card Backs |

### Quick Start

#### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (LTS recommended)
- npm 9+

#### Installation

```bash
git clone https://github.com/vers123/genshin-app.git

cd genshin-app

npm install

npm start
```

Visit http://localhost:3000 after starting.

#### Pages

| Page | URL | Description |
|---|---|---|
| Home | `/` | Entry navigation page |
| Search | `/search.html` | Real-time fuzzy search, unified cross-category ranking, click to view details |
| Database | `/database.html` | Card-based visual browser with expandable details |

#### Development Mode

```bash
npm run dev
```

Uses nodemon for auto-restart on code changes.

### Usage Guide

#### Searching Data

1. Enter a name in the search box (e.g., "Furina", "Mistsplitter", "Primogem")
2. Select a category:
   - **Aggregated Search (All)** — Query across all categories with paginated results
   - **Specific Category** — Precise search within the selected category
3. Select the result language (default: Chinese Simplified)
4. Click "Search" or press Enter

#### Example Queries

| Input | Category | Result |
|---|---|---|
| Furina | Characters | Full data for Furina |
| Mistsplitter | Weapons | Mistsplitter Reforged data |
| Aggregated → "fire" | Aggregated Search | All matches for "fire" across categories |

### Configuration

The `.env` file supports the following options:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Server port |
| `RESULT_LANGUAGE` | `ChineseSimplified` | Default output language |
| `QUERY_LANGUAGES` | `ChineseSimplified,English,Japanese,Korean` | Query input languages |
| `DEFAULT_PAGE` | `1` | Database viewer default starting page |
| `DEFAULT_PAGE_SIZE` | `24` | Database viewer items per page |

### FAQ

<details>
<summary><b>Is the data up to date?</b></summary>

Data updates with the genshin-db npm package. Run `npm update genshin-db` to get the latest data.
</details>

<details>
<summary><b>What languages are supported?</b></summary>

Chinese Simplified, Chinese Traditional, English, French, German, Indonesian, Japanese, Korean, Portuguese, Russian, Spanish, Thai, Vietnamese.
</details>

<details>
<summary><b>Port is already in use?</b></summary>

Change the `PORT` value in the `.env` file, e.g., `PORT=8080`.
</details>

### Tech Stack

| Technology | Purpose |
|---|---|
| [Express](https://expressjs.com/) | Web framework |
| [genshin-db](https://www.npmjs.com/package/genshin-db) | Genshin Impact data source |
| [dotenv](https://www.npmjs.com/package/dotenv) | Environment variable management |
| Vanilla HTML/CSS/JS | Frontend UI |

### Developer Documentation

For architecture design, API documentation, and contribution guidelines, see [Developer Documentation](docs/DEVELOPER.md).

### Build & Release

- **Local build**: `npm run build` produces `dist/genshin-app-v<version>.zip`
- **Release flow**: Push a tag (e.g. `git tag v1.2.0 && git push origin v1.2.0`) — GitHub Actions automatically builds and creates a Release
- **Release notes**: Create `docs/releases/v<version>.md` before tagging; its content becomes the Release description
- See [Developer Docs - Release section](docs/DEVELOPER.md#release) for details

### License

[MIT License](LICENSE) - Copyright (c) 2026 昤兰
