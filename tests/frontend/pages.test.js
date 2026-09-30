/**
 * 前端页面结构测试
 * 验证 HTML 页面的 DOM 结构和元素存在性
 */

const fs = require('fs');
const path = require('path');

function loadHtml(filename) {
    const filePath = path.join(__dirname, '../../public', filename);
    const html = fs.readFileSync(filePath, 'utf8');
    const dom = new DOMParser().parseFromString(html, 'text/html');
    return dom;
}

describe('Frontend Page Structure', () => {
    describe('index.html', () => {
        let doc;
        beforeEach(() => {
            doc = loadHtml('index.html');
        });

        test('should have correct title', () => {
            expect(doc.title).toBe('原神数据库 - LingLan');
        });

        test('should have site header with logo', () => {
            const header = doc.querySelector('.site-header');
            expect(header).not.toBeNull();
            const logo = doc.querySelector('.site-logo');
            expect(logo).not.toBeNull();
            expect(logo.getAttribute('href')).toBe('./index.html');
        });

        test('should have navigation with active state on home', () => {
            const nav = doc.querySelector('.site-nav');
            expect(nav).not.toBeNull();
            const links = nav.querySelectorAll('a');
            expect(links.length).toBe(4);
            expect(links[0].getAttribute('href')).toBe('./index.html');
            expect(links[0].classList.contains('active')).toBe(true);
            // 最后一个链接应为更新日志
            expect(links[links.length - 1].getAttribute('href')).toBe('./changelog.html');
        });

        test('should have entry cards linking to search, database and changelog', () => {
            const cards = doc.querySelectorAll('.home-entry-card');
            expect(cards.length).toBe(3);
            expect(cards[0].getAttribute('href')).toBe('./search.html');
            expect(cards[1].getAttribute('href')).toBe('./database.html');
            expect(cards[2].getAttribute('href')).toBe('./changelog.html');
        });

        test('should have site footer', () => {
            const footer = doc.querySelector('.site-footer');
            expect(footer).not.toBeNull();
            expect(footer.textContent).toContain('genshin-db');
        });
    });

    describe('search.html', () => {
        let doc;
        beforeEach(() => {
            doc = loadHtml('search.html');
        });

        test('should have correct title', () => {
            expect(doc.title).toBe('数据搜索 - 原神数据库');
        });

        test('should have site header with active state on search', () => {
            const nav = doc.querySelector('.site-nav');
            const searchLink = nav.querySelectorAll('a')[1];
            expect(searchLink.getAttribute('href')).toBe('./search.html');
            expect(searchLink.classList.contains('active')).toBe(true);
        });

        test('should have search input with correct placeholder', () => {
            const input = doc.getElementById('queryInput');
            expect(input).not.toBeNull();
            expect(input.getAttribute('placeholder')).toContain('芙宁娜');
        });

        test('should have folder select with comprehensive options', () => {
            const select = doc.getElementById('folderSelect');
            expect(select).not.toBeNull();
            const options = select.querySelectorAll('option');
            expect(options.length).toBeGreaterThan(20);
            // 第一项为"全部分类"（空值）
            expect(options[0].value).toBe('');
        });

        test('should have language select', () => {
            const select = doc.getElementById('langSelect');
            expect(select).not.toBeNull();
            const options = select.querySelectorAll('option');
            expect(options.length).toBeGreaterThan(0);
        });

        test('should have result list with placeholder', () => {
            const list = doc.getElementById('resultList');
            expect(list).not.toBeNull();
            const placeholder = list.querySelector('.placeholder');
            expect(placeholder).not.toBeNull();
        });

        test('should have result stats container', () => {
            expect(doc.getElementById('resultStats')).not.toBeNull();
            expect(doc.getElementById('hitCount')).not.toBeNull();
        });

        test('should have detail drawer elements', () => {
            expect(doc.getElementById('drawerOverlay')).not.toBeNull();
            expect(doc.getElementById('detailDrawer')).not.toBeNull();
            expect(doc.getElementById('drawerClose')).not.toBeNull();
            expect(doc.getElementById('drawerTitle')).not.toBeNull();
            expect(doc.getElementById('drawerBody')).not.toBeNull();
        });

        test('should load app.js script', () => {
            const script = doc.querySelector('script[src="./js/app.js"]');
            expect(script).not.toBeNull();
        });
    });

    describe('database.html', () => {
        let doc;
        beforeEach(() => {
            doc = loadHtml('database.html');
        });

        test('should have correct title', () => {
            expect(doc.title).toBe('数据库百科 - 原神数据库');
        });

        test('should have site header with active state on database', () => {
            const nav = doc.querySelector('.site-nav');
            const dbLink = nav.querySelectorAll('a')[2];
            expect(dbLink.getAttribute('href')).toBe('./database.html');
            expect(dbLink.classList.contains('active')).toBe(true);
        });

        test('should have language select', () => {
            const select = doc.getElementById('dbLangSelect');
            expect(select).not.toBeNull();
            const options = select.querySelectorAll('option');
            expect(options.length).toBe(13);
        });

        test('should have breadcrumb container', () => {
            expect(doc.getElementById('dbBreadcrumb')).not.toBeNull();
        });

        test('should have category grid container', () => {
            expect(doc.getElementById('dbCategoryGrid')).not.toBeNull();
        });

        test('should have card grid container', () => {
            expect(doc.getElementById('dbCardGrid')).not.toBeNull();
        });

        test('should have filter input', () => {
            expect(doc.getElementById('dbFilterInput')).not.toBeNull();
        });

        test('should have sort pills container', () => {
            const pills = doc.getElementById('dbSortPills');
            expect(pills).not.toBeNull();
            const pillItems = pills.querySelectorAll('.db-sort-pill');
            expect(pillItems.length).toBe(5);
        });

        test('should have pagination controls', () => {
            expect(doc.getElementById('dbPrevBtn')).not.toBeNull();
            expect(doc.getElementById('dbNextBtn')).not.toBeNull();
            expect(doc.getElementById('dbPageInfo')).not.toBeNull();
        });

        test('should have detail overlay with hero and toc', () => {
            expect(doc.getElementById('dbDetailOverlay')).not.toBeNull();
            expect(doc.getElementById('dbDetailTitle')).not.toBeNull();
            expect(doc.getElementById('dbDetailHeroImg')).not.toBeNull();
            expect(doc.getElementById('dbDetailToc')).not.toBeNull();
        });

        test('should load database.js script', () => {
            const script = doc.querySelector('script[src="./js/database.js"]');
            expect(script).not.toBeNull();
        });

        test('should load both style.css and database.css', () => {
            const styleSheet = doc.querySelector('link[href="./css/style.css"]');
            const dbStyleSheet = doc.querySelector('link[href="./css/database.css"]');
            expect(styleSheet).not.toBeNull();
            expect(dbStyleSheet).not.toBeNull();
        });
    });

    describe('changelog.html', () => {
        let doc;
        beforeEach(() => {
            doc = loadHtml('changelog.html');
        });

        test('should have correct title', () => {
            expect(doc.querySelector('title').textContent).toContain('更新日志');
        });

        test('should have navigation with active state on changelog', () => {
            const nav = doc.querySelector('.site-nav');
            expect(nav).not.toBeNull();
            const links = nav.querySelectorAll('a');
            expect(links.length).toBe(4);
            const active = nav.querySelector('a.active');
            expect(active.getAttribute('href')).toBe('./changelog.html');
        });

        test('should have timeline container', () => {
            expect(doc.getElementById('timeline')).not.toBeNull();
        });

        test('should load changelog.js script', () => {
            const script = doc.querySelector('script[src="./js/changelog.js"]');
            expect(script).not.toBeNull();
        });
    });

    describe('CSS file existence', () => {
        const cssDir = path.join(__dirname, '../../public/css');

        test('style.css should exist and contain shared variables', () => {
            const content = fs.readFileSync(path.join(cssDir, 'style.css'), 'utf8');
            expect(content).toContain('--gold');
            expect(content).toContain('.site-header');
            expect(content).toContain('.site-footer');
        });

        test('database.css should exist and contain db-specific styles', () => {
            const content = fs.readFileSync(path.join(cssDir, 'database.css'), 'utf8');
            expect(content).toContain('.db-card-grid');
            expect(content).toContain('.db-detail-hero');
        });
    });
});
