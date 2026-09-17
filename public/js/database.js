(function() {
    'use strict';

    // ===== 分类元数据 =====
    const CATEGORY_META = {
        characters:          { name: '角色',       icon: '\u{1F464}', group: '角色相关' },
        talents:             { name: '天赋',       icon: '\u2728',   group: '角色相关' },
        constellations:      { name: '命之座',     icon: '\u2B50',    group: '角色相关' },
        outfits:             { name: '衣装',       icon: '\u{1F457}', group: '角色相关' },
        weapons:             { name: '武器',       icon: '\u{1F5E1}', group: '装备道具' },
        artifacts:           { name: '圣遗物',     icon: '\u{1F48E}', group: '装备道具' },
        materials:           { name: '材料',       icon: '\u{1F4E6}', group: '装备道具' },
        foods:               { name: '食物',       icon: '\u{1F374}', group: '世界探索' },
        domains:            { name: '秘境',       icon: '\u{1F3F0}', group: '世界探索' },
        enemies:             { name: '敌人',       icon: '\u{1F47E}', group: '世界探索' },
        animals:             { name: '动物',       icon: '\u{1F418}', group: '世界探索' },
        geographies:         { name: '地理志',     icon: '\u{1F30D}', group: '世界探索' },
        achievements:        { name: '成就',       icon: '\u{1F3C6}', group: '收集成就' },
        achievementgroups:   { name: '成就组',     icon: '\u{1F9F1}', group: '收集成就' },
        namecards:           { name: '名片',       icon: '\u{1F4C7}', group: '收集成就' },
        windgliders:         { name: '风之翼',     icon: '\u{1F3BE}', group: '收集成就' },
        tcgcharactercards:   { name: '角色卡',     icon: '\u{1F0BF}', group: '七圣召唤' },
        tcgactioncards:      { name: '行动卡',     icon: '\u{1F4AC}', group: '七圣召唤' },
        tcgcardbacks:        { name: '卡背',       icon: '\u{1F3B4}', group: '七圣召唤' },
        tcgcardboxes:        { name: '卡盒',       icon: '\u{1F497}', group: '七圣召唤' },
        tcgkeywords:         { name: '关键词',     icon: '\u{1F511}', group: '七圣召唤' },
        tcgsummons:          { name: '召唤物',     icon: '\u{1F4DF}', group: '七圣召唤' },
        tcgstatuseffects:    { name: '状态效果',   icon: '\u{1F501}', group: '七圣召唤' },
        tcgdetailedrules:    { name: '详细规则',   icon: '\u{1F4DA}', group: '七圣召唤' },
        tcglevelrewards:     { name: '等级奖励',   icon: '\u{1F381}', group: '七圣召唤' },
        adventureranks:      { name: '冒险等阶',   icon: '\u{1F3AF}', group: '其他' },
        elements:            { name: '元素',       icon: '\u{1F300}', group: '其他' },
        crafts:              { name: '锻造',       icon: '\u{1F528}', group: '其他' },
        rarity:              { name: '稀有度',     icon: '\u{1F451}', group: '其他' },
        talentmaterialtypes:  { name: '天赋材料类型', icon: '\u{1F4F0}', group: '其他' }
    };

    const GROUP_ORDER = ['角色相关', '装备道具', '世界探索', '收集成就', '七圣召唤', '其他'];

    // ===== DOM 元素 =====
    const categoryGrid = document.getElementById('dbCategoryGrid');
    const categoryPage = document.getElementById('dbCategoryPage');
    const homePage = document.getElementById('dbHome');
    const cardGrid = document.getElementById('dbCardGrid');
    const breadcrumb = document.getElementById('dbBreadcrumb');
    const categoryTitle = document.getElementById('dbCategoryTitle');
    const itemCount = document.getElementById('dbItemCount');
    const filterInput = document.getElementById('dbFilterInput');
    const sortPills = document.getElementById('dbSortPills');
    const pagination = document.getElementById('dbPagination');
    const prevBtn = document.getElementById('dbPrevBtn');
    const nextBtn = document.getElementById('dbNextBtn');
    const pageInfo = document.getElementById('dbPageInfo');
    const detailOverlay = document.getElementById('dbDetailOverlay');
    const detailPanel = document.getElementById('dbDetailPanel');
    const detailTitle = document.getElementById('dbDetailTitle');
    const detailSubtitle = document.getElementById('dbDetailSubtitle');
    const detailHeroImg = document.getElementById('dbDetailHeroImg');
    const detailBody = document.getElementById('dbDetailBody');
    const detailClose = document.getElementById('dbDetailClose');
    const detailToc = document.getElementById('dbDetailToc');
    const detailTocList = document.getElementById('dbDetailTocList');
    const langSelect = document.getElementById('dbLangSelect');

    // ===== 状态 =====
    let currentFolder = null;
    let currentPageNum = 1;
    let totalPages = 1;
    let totalCount = 0;
    let allItems = [];
    let currentLang = 'ChineseSimplified';
    let availableFolders = [];

    // ===== 初始化 =====
    function init() {
        loadFolders().then(() => {
            handleRoute();
        });

        window.addEventListener('hashchange', handleRoute);
        filterInput.addEventListener('input', handleFilter);
        sortPills.addEventListener('click', (e) => {
            if (e.target.classList.contains('db-sort-pill')) {
                sortPills.querySelectorAll('.db-sort-pill').forEach(p => p.classList.remove('active'));
                e.target.classList.add('active');
                handleSort(e.target.dataset.sort);
            }
        });
        prevBtn.addEventListener('click', () => goToPage(currentPageNum - 1));
        nextBtn.addEventListener('click', () => goToPage(currentPageNum + 1));
        detailClose.addEventListener('click', closeDetail);
        detailOverlay.addEventListener('click', (e) => {
            if (e.target === detailOverlay) closeDetail();
        });
        langSelect.addEventListener('change', () => {
            currentLang = langSelect.value;
            if (currentFolder) loadCategory(currentFolder, 1);
            else renderHome();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeDetail();
        });
    }

    // ===== 路由 =====
    function handleRoute() {
        const hash = window.location.hash.slice(1);
        const params = new URLSearchParams(hash);
        const folder = params.get('category');

        if (folder) {
            loadCategory(folder, parseInt(params.get('page'), 10) || 1);
        } else {
            showHome();
        }
    }

    function navigate(folder, page) {
        if (folder) {
            window.location.hash = `category=${folder}&page=${page || 1}`;
        } else {
            window.location.hash = '';
        }
    }

    // ===== 加载可用分类 =====
    async function loadFolders() {
        try {
            const res = await fetch('/api/folders');
            const data = await res.json();
            availableFolders = data.folders || [];
        } catch (e) {
            console.error('加载分类列表失败:', e);
            availableFolders = Object.keys(CATEGORY_META);
        }
    }

    // ===== 首页渲染 =====
    async function showHome() {
        homePage.style.display = '';
        categoryPage.style.display = 'none';
        renderBreadcrumb(null);
        renderHome();
    }

    async function renderHome() {
        categoryGrid.innerHTML = '<div class="db-loading"><div class="spinner"></div><p>正在加载分类...</p></div>';

        const counts = await Promise.all(
            availableFolders.map(f =>
                fetch(`/api/count?folder=${encodeURIComponent(f)}`).then(r => r.json()).then(d => ({ folder: f, count: d.count || 0 })).catch(() => ({ folder: f, count: 0 }))
            )
        );

        const folderCounts = {};
        counts.forEach(c => { folderCounts[c.folder] = c.count; });

        const grouped = {};
        availableFolders.forEach(f => {
            const meta = CATEGORY_META[f];
            const group = meta ? meta.group : '其他';
            if (!grouped[group]) grouped[group] = [];
            grouped[group].push({ folder: f, ...meta, count: folderCounts[f] || 0 });
        });

        let html = '';
        GROUP_ORDER.forEach(group => {
            if (!grouped[group]) return;
            html += `<div class="db-cat-group-header"><h3>${group}</h3><div class="group-line"></div></div>`;
            grouped[group].forEach(item => {
                const icon = item.icon || '\u{1F4CB}';
                const name = item.name || item.folder;
                html += `
                    <div class="db-cat-card" data-folder="${item.folder}">
                        <div class="cat-icon">${icon}</div>
                        <div class="cat-name">${name}</div>
                        <div class="cat-count">共 <span class="count-num">${item.count}</span> 项</div>
                    </div>`;
            });
        });

        categoryGrid.innerHTML = html;

        categoryGrid.querySelectorAll('.db-cat-card').forEach(card => {
            card.addEventListener('click', () => {
                navigate(card.dataset.folder, 1);
            });
        });
    }

    // ===== 分类页加载 =====
    async function loadCategory(folder, page) {
        currentFolder = folder;
        currentPageNum = page || 1;

        homePage.style.display = 'none';
        categoryPage.style.display = '';

        const meta = CATEGORY_META[folder] || { name: folder };
        renderBreadcrumb(folder, meta.name);
        categoryTitle.textContent = meta.name;

        cardGrid.innerHTML = '<div class="db-loading"><div class="spinner"></div><p>正在加载数据...</p></div>';
        pagination.style.display = 'none';

        try {
            const res = await fetch(`/api/category/${encodeURIComponent(folder)}?page=${currentPageNum}&pageSize=24&resultLanguage=${encodeURIComponent(currentLang)}`);
            const data = await res.json();

            if (data.error) {
                cardGrid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--text-dim);padding:60px;">${data.error}</div>`;
                return;
            }

            totalCount = data.total;
            totalPages = data.totalPages;
            allItems = data.items || [];

            itemCount.innerHTML = `共 <span class="count-num">${totalCount}</span> 项`;
            filterInput.value = '';
            sortPills.querySelectorAll('.db-sort-pill').forEach(p => p.classList.remove('active'));
            sortPills.querySelector('[data-sort="default"]').classList.add('active');

            renderCards(allItems);
            renderPagination();
        } catch (e) {
            cardGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:#ff6b6b;padding:60px;">加载数据失败，请确保后端服务已启动</div>';
            console.error(e);
        }
    }

    // ===== 渲染卡片网格 =====
    function renderCards(items) {
        if (!items || items.length === 0) {
            cardGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-dim);padding:60px;">暂无数据</div>';
            return;
        }

        let html = '';
        items.forEach(item => {
            const imgSrc = getItemImage(item);
            const name = item.name || '未知';
            const rarity = item.rarity;
            const element = item.elementText;
            const weapon = item.weaponText;
            const region = item.region;

            let subtitle = '';
            if (element) subtitle = element;
            else if (weapon) subtitle = weapon;
            else if (region) subtitle = region;
            else if (item.type) subtitle = item.type;

            let elementClass = '';
            if (element) {
                const elMap = { 'Pyro': 'Pyro', 'Hydro': 'Hydro', 'Anemo': 'Anemo', 'Electro': 'Electro', 'Dendro': 'Dendro', 'Cryo': 'Cryo', 'Geo': 'Geo', '炎': 'Pyro', '水': 'Hydro', '风': 'Anemo', '雷': 'Electro', '草': 'Dendro', '冰': 'Cryo', '岩': 'Geo' };
                elementClass = elMap[element] || '';
            }

            html += `
                <div class="db-item-card" data-name="${escapeHtml(name)}">
                    <div class="item-image">
                        ${rarity ? `<span class="rarity-badge rarity-${rarity}">${rarity}\u2605</span>` : ''}
                        ${imgSrc
        ? `<img src="${imgSrc}" alt="${escapeHtml(name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling?this.nextElementSibling.style.display='':'';">`
        : '<span class="item-placeholder">\u{1F4CB}</span>'
    }
                        ${imgSrc ? '<span class="item-placeholder" style="display:none;">\u{1F4CB}</span>' : ''}
                    </div>
                    <div class="item-info">
                        <div class="item-name" title="${escapeHtml(name)}">${escapeHtml(name)}</div>
                        ${subtitle ? `<div class="item-subtitle">${escapeHtml(subtitle)}</div>` : ''}
                        ${elementClass ? `<span class="item-element el-${elementClass}">${escapeHtml(element)}</span>` : ''}
                    </div>
                </div>`;
        });

        cardGrid.innerHTML = html;

        cardGrid.querySelectorAll('.db-item-card').forEach(card => {
            card.addEventListener('click', () => {
                openDetail(card.dataset.name);
            });
        });
    }

    // ===== 获取物品图片 =====
    function getItemImage(item) {
        if (!item.images) return null;
        return item.images.mihoyo_icon
            || item.images.hoyowiki_icon
            || item.images.card
            || item.images.icon
            || item.images.portrait
            || item.images.cover
            || item.images.image
            || item.images.url
            || item.images.bannerImg
            || null;
    }

    // ===== 分页渲染 =====
    function renderPagination() {
        if (totalPages <= 1) {
            pagination.style.display = 'none';
            return;
        }
        pagination.style.display = 'flex';
        prevBtn.disabled = (currentPageNum <= 1);
        nextBtn.disabled = (currentPageNum >= totalPages);
        pageInfo.textContent = `${currentPageNum} / ${totalPages}`;
    }

    function goToPage(page) {
        if (page < 1 || page > totalPages) return;
        navigate(currentFolder, page);
    }

    // ===== 筛选 =====
    let filterTimer = null;
    function handleFilter() {
        clearTimeout(filterTimer);
        filterTimer = setTimeout(() => {
            const query = filterInput.value.trim().toLowerCase();
            if (!query) {
                renderCards(allItems);
                return;
            }
            const filtered = allItems.filter(item =>
                (item.name || '').toLowerCase().includes(query) ||
                (item.elementText || '').toLowerCase().includes(query) ||
                (item.weaponText || '').toLowerCase().includes(query) ||
                (item.region || '').toLowerCase().includes(query)
            );
            renderCards(filtered);
        }, 200);
    }

    // ===== 排序 =====
    function handleSort(sortKey) {
        const sort = sortKey || 'default';
        let items = [...allItems];

        switch (sort) {
        case 'rarity-desc':
            items.sort((a, b) => (b.rarity || 0) - (a.rarity || 0));
            break;
        case 'rarity-asc':
            items.sort((a, b) => (a.rarity || 0) - (b.rarity || 0));
            break;
        case 'name-asc':
            items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            break;
        case 'name-desc':
            items.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
            break;
        }

        renderCards(items);
    }

    // ===== 详情面板 =====
    async function openDetail(name) {
        detailOverlay.style.display = '';
        detailTitle.textContent = name;
        detailSubtitle.innerHTML = '';
        detailHeroImg.innerHTML = '';
        detailToc.style.display = 'none';
        detailTocList.innerHTML = '';
        detailBody.innerHTML = '<div class="db-loading"><div class="spinner"></div><p>正在加载详情...</p></div>';

        try {
            const res = await fetch(`/api/item/${encodeURIComponent(currentFolder)}/${encodeURIComponent(name)}?resultLanguage=${encodeURIComponent(currentLang)}`);
            const data = await res.json();

            if (data.error) {
                detailBody.innerHTML = `<div style="text-align:center;color:#ff6b6b;padding:40px;">${data.error}</div>`;
                return;
            }

            renderDetailHero(data);
            renderDetail(data);
        } catch (e) {
            detailBody.innerHTML = '<div style="text-align:center;color:#ff6b6b;padding:40px;">加载详情失败</div>';
            console.error(e);
        }
    }

    function closeDetail() {
        detailOverlay.style.display = 'none';
    }

    // ===== Hero 区域渲染 =====
    function renderDetailHero(data) {
        const name = data.name || '未知';
        detailTitle.textContent = name;

        const subtitleParts = [];
        if (data.rarity) subtitleParts.push(`<span>${data.rarity}\u2605</span>`);
        if (data.elementText) subtitleParts.push(`<span>${escapeHtml(data.elementText)}</span>`);
        if (data.weaponText) subtitleParts.push(`<span>${escapeHtml(data.weaponText)}</span>`);
        if (data.region) subtitleParts.push(`<span>${escapeHtml(data.region)}</span>`);
        if (data.type) subtitleParts.push(`<span>${escapeHtml(data.type)}</span>`);
        if (data.category) subtitleParts.push(`<span>${escapeHtml(data.category)}</span>`);
        if (data.version) subtitleParts.push(`<span>v${escapeHtml(String(data.version))}</span>`);
        detailSubtitle.innerHTML = subtitleParts.join('<span class="sep">|</span>');

        const heroImg = getItemImage(data);
        if (heroImg) {
            detailHeroImg.innerHTML = `<img src="${heroImg}" alt="${escapeHtml(name)}" onerror="this.style.display='none'">`;
        } else {
            detailHeroImg.innerHTML = '';
        }
    }

    // ===== 详情渲染（手风琴） =====
    function renderDetail(data) {
        const sections = [];

        // 基础信息
        const basicFields = [
            { label: '名称', value: data.name },
            { label: 'ID', value: data.id },
            { label: '标题', value: data.title },
            { label: '描述', value: data.description, long: true },
            { label: '稀有度', value: data.rarity ? `${data.rarity}\u2605` : null },
            { label: '元素', value: data.elementText },
            { label: '武器类型', value: data.weaponText },
            { label: '地区', value: data.region },
            { label: '势力', value: data.associationType },
            { label: '生日', value: data.birthday },
            { label: '性别', value: data.gender },
            { label: '星座', value: data.constellation },
            { label: '所属', value: data.affiliation },
            { label: '副属性', value: data.substatText },
            { label: '类型', value: data.type },
            { label: '类别', value: data.category },
            { label: '副标题', value: data.subtitle },
            { label: '版本', value: data.version },
            { label: '掉落区域', value: data.dropArea }
        ].filter(f => f.value !== undefined && f.value !== null && f.value !== '');

        if (basicFields.length > 0) {
            let html = '<div class="db-detail-grid">';
            basicFields.forEach(f => {
                html += `
                    <div class="db-detail-item">
                        <div class="db-detail-label">${f.label}</div>
                        <div class="db-detail-value${f.long ? ' long-text' : ''}">${escapeHtml(String(f.value))}</div>
                    </div>`;
            });
            html += '</div>';
            sections.push({ title: '基础信息', content: html });
        }

        // CV / 声优
        if (data.cv) {
            let html = '<div class="db-detail-grid">';
            Object.entries(data.cv).forEach(([lang, name]) => {
                html += `
                    <div class="db-detail-item">
                        <div class="db-detail-label">${lang}</div>
                        <div class="db-detail-value">${escapeHtml(String(name))}</div>
                    </div>`;
            });
            html += '</div>';
            sections.push({ title: '声优', content: html });
        }

        // 图片
        if (data.images) {
            let html = '<div class="db-detail-images">';
            const imgEntries = [
                { key: 'mihoyo_icon', label: '官方图标' },
                { key: 'hoyowiki_icon', label: 'Wiki图标' },
                { key: 'card', label: '卡片' },
                { key: 'portrait', label: '立绘' },
                { key: 'cover1', label: '封面1' },
                { key: 'cover2', label: '封面2' },
                { key: 'icon', label: '图标' },
                { key: 'image', label: '图片' },
                { key: 'url', label: '图片' },
                { key: 'bannerImg', label: '横幅' }
            ];

            imgEntries.forEach(e => {
                if (data.images[e.key]) {
                    html += `
                        <div class="db-detail-img-item">
                            <img src="${data.images[e.key]}" alt="${e.label}" loading="lazy" onerror="this.parentElement.style.display='none'">
                            <div class="img-label">${e.label}</div>
                        </div>`;
                }
            });

            if (data.images.filename_gachaSplash) {
                html += `
                    <div class="db-detail-img-item">
                        <img src="https://upload-os-bbs.mihoyo.com/game_record/genshin/character_image/${data.images.filename_gachaSplash}.png" alt="抽卡立绘" loading="lazy" onerror="this.parentElement.style.display='none'">
                        <div class="img-label">抽卡立绘</div>
                    </div>`;
            }
            if (data.images.filename_sideIcon) {
                html += `
                    <div class="db-detail-img-item">
                        <img src="https://upload-os-bbs.mihoyo.com/game_record/genshin/character_side_icon/${data.images.filename_sideIcon}.png" alt="侧图标" loading="lazy" onerror="this.parentElement.style.display='none'">
                        <div class="img-label">侧图标</div>
                    </div>`;
            }
            html += '</div>';
            sections.push({ title: '图片资源', content: html });
        }

        // 升级素材
        if (data.costs) {
            let html = '<div class="db-detail-table"><table><thead><tr><th>阶段</th><th>素材</th><th>数量</th></tr></thead><tbody>';
            Object.entries(data.costs).forEach(([stage, items]) => {
                items.forEach((item, i) => {
                    html += `<tr>
                        <td>${i === 0 ? escapeHtml(stage) : ''}</td>
                        <td>${escapeHtml(String(item.name || ''))}</td>
                        <td>${item.count || 0}</td>
                    </tr>`;
                });
            });
            html += '</tbody></table></div>';
            sections.push({ title: '升级素材', content: html });
        }

        // 属性 / 统计
        if (data.stats && typeof data.stats === 'object') {
            let html = '<div class="db-detail-table"><table><thead><tr><th>属性</th><th>值</th></tr></thead><tbody>';
            Object.entries(data.stats).forEach(([key, val]) => {
                if (typeof val !== 'function') {
                    html += `<tr><td>${escapeHtml(key)}</td><td>${escapeHtml(String(val))}</td></tr>`;
                }
            });
            html += '</tbody></table></div>';
            sections.push({ title: '属性', content: html });
        }

        // 效果（圣遗物等）
        if (data.effect) {
            sections.push({ title: '套装效果', content: `<div class="db-detail-value long-text">${escapeHtml(String(data.effect))}</div>` });
        }
        if (data.setEffect) {
            sections.push({ title: '套装效果', content: `<div class="db-detail-value long-text">${escapeHtml(String(data.setEffect))}</div>` });
        }
        if (data.bonus) {
            sections.push({ title: '加成', content: `<div class="db-detail-value long-text">${escapeHtml(String(data.bonus))}</div>` });
        }

        // 技能 / 天赋
        if (data.skillTalents) {
            let html = '';
            data.skillTalents.forEach(skill => {
                html += `<div class="db-skill-card">
                    <div class="db-skill-name">${escapeHtml(skill.name || '')}</div>
                    <div class="db-skill-desc">${escapeHtml(skill.description || skill.detail || '')}</div>
                    ${skill.infoText ? `<div class="db-skill-info">${escapeHtml(skill.infoText)}</div>` : ''}
                </div>`;
            });
            sections.push({ title: '天赋技能', content: html });
        }
        if (data.combatTalents) {
            let html = '';
            data.combatTalents.forEach(skill => {
                html += `<div class="db-skill-card">
                    <div class="db-skill-name">${escapeHtml(skill.name || '')}</div>
                    <div class="db-skill-desc">${escapeHtml(skill.description || skill.detail || '')}</div>
                </div>`;
            });
            sections.push({ title: '战斗天赋', content: html });
        }
        if (data.passiveTalents) {
            let html = '';
            data.passiveTalents.forEach(skill => {
                html += `<div class="db-skill-card">
                    <div class="db-skill-name">${escapeHtml(skill.name || '')}</div>
                    <div class="db-skill-desc">${escapeHtml(skill.description || skill.detail || '')}</div>
                </div>`;
            });
            sections.push({ title: '被动天赋', content: html });
        }
        if (data.constellations) {
            let html = '';
            data.constellations.forEach(c => {
                html += `<div class="db-skill-card">
                    <div class="db-skill-name">${escapeHtml(c.name || '')}</div>
                    <div class="db-skill-desc">${escapeHtml(c.description || c.detail || '')}</div>
                </div>`;
            });
            sections.push({ title: '命之座', content: html });
        }

        // 效果文本（食物等）
        if (data.effects) {
            let html = '<div class="db-detail-value long-text">';
            if (Array.isArray(data.effects)) {
                data.effects.forEach(e => { html += `<div style="margin-bottom:8px;">${escapeHtml(String(e))}</div>`; });
            } else {
                html += escapeHtml(String(data.effects));
            }
            html += '</div>';
            sections.push({ title: '效果', content: html });
        }

        // 来源 / 掉落
        if (data.sources) {
            let html = '<div class="db-detail-table"><table><thead><tr><th>来源</th><th>类型</th></tr></thead><tbody>';
            if (Array.isArray(data.sources)) {
                data.sources.forEach(s => {
                    html += `<tr><td>${escapeHtml(String(s.name || s.text || ''))}</td><td>${escapeHtml(String(s.type || ''))}</td></tr>`;
                });
            } else {
                Object.entries(data.sources).forEach(([k, v]) => {
                    html += `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(String(v))}</td></tr>`;
                });
            }
            html += '</tbody></table></div>';
            sections.push({ title: '来源', content: html });
        }

        // 食材 / 配方
        if (data.ingredients) {
            let html = '<div class="db-detail-table"><table><thead><tr><th>食材</th><th>数量</th></tr></thead><tbody>';
            data.ingredients.forEach(item => {
                html += `<tr><td>${escapeHtml(String(item.name || ''))}</td><td>${item.count || 0}</td></tr>`;
            });
            html += '</tbody></table></div>';
            sections.push({ title: '食材', content: html });
        }
        if (data.ingredient) {
            let html = '<div class="db-detail-table"><table><thead><tr><th>食材</th><th>数量</th></tr></thead><tbody>';
            Object.entries(data.ingredient).forEach(([k, v]) => {
                html += `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(String(v))}</td></tr>`;
            });
            html += '</tbody></table></div>';
            sections.push({ title: '食材', content: html });
        }

        // TCG 相关
        if (data.cardTags) {
            sections.push({ title: '卡牌标签', content: `<div class="db-detail-value">${escapeHtml(data.cardTags.join(', '))}</div>` });
        }
        if (data.cardStatsState) {
            sections.push({ title: '卡牌状态', content: `<div class="db-detail-value">${escapeHtml(String(data.cardStatsState))}</div>` });
        }
        if (data.token) {
            sections.push({ title: '令牌', content: `<div class="db-detail-value">${escapeHtml(String(data.token))}</div>` });
        }
        if (data.energy) {
            sections.push({ title: '能量', content: `<div class="db-detail-value">${escapeHtml(String(data.energy))}</div>` });
        }
        if (data.tags) {
            sections.push({ title: '标签', content: `<div class="db-detail-value">${Array.isArray(data.tags) ? escapeHtml(data.tags.join(', ')) : escapeHtml(String(data.tags))}</div>` });
        }
        if (data.keywords) {
            sections.push({ title: '关键词', content: `<div class="db-detail-value">${Array.isArray(data.keywords) ? escapeHtml(data.keywords.join(', ')) : escapeHtml(String(data.keywords))}</div>` });
        }
        if (data.usage) {
            sections.push({ title: '使用方式', content: `<div class="db-detail-value long-text">${escapeHtml(String(data.usage))}</div>` });
        }
        if (data.rules) {
            sections.push({ title: '规则', content: `<div class="db-detail-value long-text">${escapeHtml(String(data.rules))}</div>` });
        }

        // URL 链接
        if (data.url) {
            let html = '';
            Object.entries(data.url).forEach(([k, v]) => {
                html += `<div style="margin-bottom:8px;"><a href="${v}" target="_blank" rel="noopener" class="db-detail-link">${escapeHtml(k)}: ${escapeHtml(String(v))}</a></div>`;
            });
            sections.push({ title: '相关链接', content: html });
        }

        // 其他字段（未分类的）
        const knownKeys = new Set([
            'name','id','title','description','rarity','elementText','elementType','weaponText','weaponType',
            'region','associationType','birthday','birthdaymmdd','gender','constellation','affiliation',
            'substatType','substatText','type','category','subtitle','version','dropArea','images','url',
            'costs','cv','stats','effect','setEffect','bonus','skillTalents','combatTalents','passiveTalents',
            'constellations','effects','sources','ingredients','ingredient','cardTags','cardStatsState',
            'token','energy','tags','keywords','usage','rules','versionNew'
        ]);
        const otherKeys = Object.keys(data).filter(k => !knownKeys.has(k) && typeof data[k] !== 'function');
        if (otherKeys.length > 0) {
            let html = '<div class="db-detail-table"><table><thead><tr><th>字段</th><th>值</th></tr></thead><tbody>';
            otherKeys.forEach(k => {
                const val = data[k];
                const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
                html += `<tr><td>${escapeHtml(k)}</td><td style="word-break:break-all;">${escapeHtml(str)}</td></tr>`;
            });
            html += '</tbody></table></div>';
            sections.push({ title: '其他属性', content: html });
        }

        // 完整 JSON
        sections.push({
            title: '原始 JSON 数据',
            content: `<div class="db-detail-json">${escapeHtml(JSON.stringify(data, (key, val) => typeof val === 'function' ? '[Function]' : val, 2))}</div>`
        });

        // 渲染区段 + 侧边目录
        let tocHtml = '';
        let bodyHtml = '';

        sections.forEach((s, i) => {
            const sectionId = `db-section-${i}`;
            tocHtml += `<li><a data-target="${sectionId}" class="${i === 0 ? 'active' : ''}">${escapeHtml(s.title)}</a></li>`;
            bodyHtml += `
                <div class="db-detail-section" id="${sectionId}">
                    <div class="db-detail-section-title">${escapeHtml(s.title)}</div>
                    ${s.content}
                </div>`;
        });

        detailBody.innerHTML = bodyHtml;

        if (sections.length > 1) {
            detailTocList.innerHTML = tocHtml;
            detailToc.style.display = '';
            detailTocList.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const target = document.getElementById(link.dataset.target);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        detailTocList.querySelectorAll('a').forEach(a => a.classList.remove('active'));
                        link.classList.add('active');
                    }
                });
            });

            detailBody.addEventListener('scroll', () => {
                const scrollTop = detailBody.scrollTop;
                let activeIdx = 0;
                sections.forEach((s, i) => {
                    const el = document.getElementById(`db-section-${i}`);
                    if (el && el.offsetTop - 60 <= scrollTop) activeIdx = i;
                });
                detailTocList.querySelectorAll('a').forEach((a, i) => {
                    a.classList.toggle('active', i === activeIdx);
                });
            });
        } else {
            detailToc.style.display = 'none';
        }
    }

    // ===== 面包屑导航 =====
    function renderBreadcrumb(folder, folderName) {
        if (!folder) {
            breadcrumb.innerHTML = '<span class="crumb" data-route="home" style="color:var(--gold);">百科首页</span>';
            return;
        }
        breadcrumb.innerHTML = `
            <span class="crumb" data-route="home">百科首页</span>
            <span class="crumb-sep">/</span>
            <span class="crumb" style="color:var(--gold);">${escapeHtml(folderName || folder)}</span>
        `;
        breadcrumb.querySelector('[data-route="home"]').addEventListener('click', () => {
            navigate(null);
        });
    }

    // ===== 工具函数 =====
    function escapeHtml(text) {
        if (text === null || text === undefined) return '';
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }

    // ===== 启动 =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
