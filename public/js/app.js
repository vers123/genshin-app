(function() {
    'use strict';

    const ENKA = 'https://enka.network/ui/';

    // ===== DOM 元素 =====
    const queryInput = document.getElementById('queryInput');
    const folderSelect = document.getElementById('folderSelect');
    const langSelect = document.getElementById('langSelect');
    const resultList = document.getElementById('resultList');
    const resultStats = document.getElementById('resultStats');
    const hitCount = document.getElementById('hitCount');
    const historyDatalist = document.getElementById('searchHistory');

    const drawerOverlay = document.getElementById('drawerOverlay');
    const detailDrawer = document.getElementById('detailDrawer');
    const drawerClose = document.getElementById('drawerClose');
    const drawerHeroImg = document.getElementById('drawerHeroImg');
    const drawerTitle = document.getElementById('drawerTitle');
    const drawerEn = document.getElementById('drawerEn');
    const drawerMeta = document.getElementById('drawerMeta');
    const drawerBody = document.getElementById('drawerBody');

    // ===== 搜索历史 =====
    const HISTORY_KEY = 'genshin_search_history';
    const HISTORY_MAX = 10;

    function loadHistory() {
        try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
        catch { return []; }
    }
    function saveHistory(query) {
        let h = loadHistory().filter(i => i !== query);
        h.unshift(query);
        if (h.length > HISTORY_MAX) h = h.slice(0, HISTORY_MAX);
        try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); } catch { /* ignore */ }
        renderHistory();
    }
    function renderHistory() {
        historyDatalist.innerHTML = loadHistory().map(i => `<option value="${escapeHtml(i)}">`).join('');
    }

    // ===== 实时搜索（防抖） =====
    let searchTimer = null;
    let currentLang = 'ChineseSimplified';

    function scheduleSearch() {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(doSearch, 200);
    }

    async function doSearch() {
        const q = queryInput.value.trim();
        const folder = folderSelect.value;

        if (!q) {
            resultStats.style.display = 'none';
            resultList.innerHTML = '<div class="placeholder">输入关键词开始搜索（支持中英文）<br><span class="hint">例如：钟离、hutao、护摩、gladiator</span></div>';
            return;
        }

        saveHistory(q);

        try {
            const url = `/api/search-index?q=${encodeURIComponent(q)}&limit=40${folder ? `&folder=${encodeURIComponent(folder)}` : ''}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.error || !data.results || data.results.length === 0) {
                hitCount.textContent = '0';
                resultStats.style.display = '';
                resultList.innerHTML = `<div class="empty">未找到与 "${escapeHtml(q)}" 匹配的数据</div>`;
                return;
            }

            hitCount.textContent = data.total;
            resultStats.style.display = '';
            renderResults(data.results, q);
        } catch (e) {
            resultStats.style.display = 'none';
            resultList.innerHTML = '<div class="empty">搜索失败，请确保后端服务已启动</div>';
            console.error(e);
        }
    }

    function renderResults(items, query) {
        const q = query.toLowerCase();
        resultList.innerHTML = items.map(it => {
            const scorePct = it.score; // 60/80/100
            return `
            <div class="result-item" data-folder="${it.folder}" data-name="${escapeHtml(it.nameEn)}" data-namezh="${escapeHtml(it.nameZh)}">
                <span class="cat-badge">${escapeHtml(it.label)}</span>
                <div class="names">
                    <div class="name-zh">${highlight(it.nameZh, q)}</div>
                    <div class="name-en">${highlight(it.nameEn, q)}</div>
                </div>
                <div class="score-bar"><span style="width:${scorePct}%"></span></div>
            </div>`;
        }).join('');
    }

    // 关键词高亮
    function highlight(text, q) {
        if (!q) return escapeHtml(text);
        const safe = escapeHtml(text);
        const idx = safe.toLowerCase().indexOf(q);
        if (idx < 0) return safe;
        return safe.slice(0, idx) + `<mark style="background:var(--gold-dim);color:var(--gold-light);border-radius:2px;padding:0 2px;">${safe.slice(idx, idx + q.length)}</mark>` + safe.slice(idx + q.length);
    }

    // ===== 详情抽屉 =====
    resultList.addEventListener('click', async (e) => {
        const el = e.target.closest('.result-item');
        if (!el) return;
        const { folder, name } = el.dataset;
        await openDetail(folder, name);
    });

    async function openDetail(folder, name) {
        detailDrawer.classList.add('show');
        drawerOverlay.classList.add('show');
        drawerBody.innerHTML = '<div class="empty">加载中...</div>';

        try {
            const res = await fetch(`/api/item/${encodeURIComponent(folder)}/${encodeURIComponent(name)}?resultLanguage=${encodeURIComponent(currentLang)}`);
            const data = await res.json();
            if (data.error) {
                drawerBody.innerHTML = `<div class="empty">${escapeHtml(data.error)}</div>`;
                return;
            }
            renderDetail(data, folder);
        } catch (e) {
            drawerBody.innerHTML = '<div class="empty">加载详情失败</div>';
            console.error(e);
        }
    }

    function closeDetail() {
        detailDrawer.classList.remove('show');
        drawerOverlay.classList.remove('show');
    }

    drawerClose.addEventListener('click', closeDetail);
    drawerOverlay.addEventListener('click', closeDetail);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDetail();
    });

    // ===== 图片解析（Enka CDN 优先） =====
    function imgUrl(images, prefer) {
        if (!images) return null;
        const order = prefer
            ? [prefer, 'filename_gachaSplash', 'filename_gacha', 'filename_icon', 'filename_awakenicon', 'filename_sideIcon']
            : ['filename_gachaSplash', 'filename_gacha', 'filename_icon', 'filename_awakenicon', 'filename_sideIcon'];
        for (const k of order) {
            if (images[k]) return ENKA + images[k] + '.png';
        }
        // 回退远程 URL
        const remote = ['mihoyo_icon', 'hoyowiki_icon', 'card', 'icon', 'portrait', 'cover1', 'cover2', 'image', 'url', 'bannerImg'];
        for (const k of remote) {
            if (images[k]) return images[k];
        }
        return null;
    }

    // ===== 详情渲染 =====
    function renderDetail(d, folder) {
        drawerTitle.textContent = d.name || '未知';
        drawerEn.textContent = d.name ? '' : '';
        // 英文名：索引里带了，但详情 API 只返回 resultLanguage 的名字。这里用 id 无法反查英文名，留空即可。
        drawerEn.textContent = '';

        // Hero 图片
        const heroImg = imgUrl(d.images, folder === 'characters' ? 'filename_gachaSplash' : 'filename_icon');
        drawerHeroImg.innerHTML = heroImg
            ? `<img src="${heroImg}" alt="" onerror="this.style.display='none'">`
            : '<span style="color:var(--text-dim);font-size:2rem;">&#128196;</span>';

        // Meta 标签
        const tags = [];
        if (d.rarity) tags.push(`<span class="tag rarity">${'★'.repeat(d.rarity)}</span>`);
        if (d.elementText) tags.push(`<span class="tag">${escapeHtml(d.elementText)}</span>`);
        if (d.weaponText) tags.push(`<span class="tag">${escapeHtml(d.weaponText)}</span>`);
        if (d.region) tags.push(`<span class="tag">${escapeHtml(d.region)}</span>`);
        if (d.type) tags.push(`<span class="tag">${escapeHtml(d.type)}</span>`);
        if (d.category) tags.push(`<span class="tag">${escapeHtml(d.category)}</span>`);
        drawerMeta.innerHTML = tags.join('');

        // Body
        let h = '';

        if (d.description) h += section('描述', `<p>${escapeHtml(d.description)}</p>`);
        if (d.story) h += section('故事', `<p>${escapeHtml(d.story)}</p>`);

        // 分类专属渲染
        if (folder === 'characters') h += renderCharacter(d);
        else if (folder === 'weapons') h += renderWeapon(d);
        else if (folder === 'artifacts') h += renderArtifact(d);
        else if (folder === 'materials') h += renderMaterial(d);

        // 通用属性表
        const basic = [
            ['ID', d.id], ['标题', d.title], ['稀有度', d.rarity ? d.rarity + '★' : null],
            ['元素', d.elementText], ['武器类型', d.weaponText], ['地区', d.region],
            ['势力', d.associationType], ['生日', d.birthday], ['性别', d.gender],
            ['星座', d.constellation], ['所属', d.affiliation], ['副属性', d.substatText],
            ['类型', d.type], ['类别', d.category], ['副标题', d.subtitle],
            ['版本', d.version], ['掉落区域', d.dropArea]
        ].filter(([, v]) => v !== undefined && v !== null && v !== '');
        if (basic.length) {
            h += section('基础信息', `<table class="drawer-kv">${basic.map(([k, v]) => `<tr><td>${k}</td><td>${escapeHtml(String(v))}</td></tr>`).join('')}</table>`);
        }

        // 升级素材
        if (d.costs) {
            let rows = '';
            Object.entries(d.costs).forEach(([stage, items]) => {
                items.forEach((item, i) => {
                    rows += `<tr><td>${i === 0 ? escapeHtml(stage) : ''}</td><td>${escapeHtml(String(item.name || ''))}</td><td>${item.count || 0}</td></tr>`;
                });
            });
            h += section('升级素材', `<table class="drawer-kv"><thead><tr><th>阶段</th><th>素材</th><th>数量</th></tr></thead><tbody>${rows}</tbody></table>`);
        }

        // 原始 JSON
        h += section('原始 JSON', `<div class="drawer-json">${escapeHtml(JSON.stringify(d, null, 2))}</div>`);

        drawerBody.innerHTML = h;
        detailDrawer.scrollTop = 0;
    }

    function section(title, content) {
        return `<div class="drawer-sec"><h3>${title}</h3>${content}</div>`;
    }

    // ---- 角色 ----
    function renderCharacter(d) {
        let h = '';
        if (d.skillTalents && d.skillTalents.length) {
            h += section('天赋技能', d.skillTalents.map(s => skillCard(s)).join(''));
        }
        if (d.combatTalents && d.combatTalents.length) {
            h += section('战斗天赋', d.combatTalents.map(s => skillCard(s)).join(''));
        }
        if (d.passiveTalents && d.passiveTalents.length) {
            h += section('被动天赋', d.passiveTalents.map(s => skillCard(s)).join(''));
        }
        if (d.constellations && d.constellations.length) {
            h += section('命之座', d.constellations.map(c => skillCard(c)).join(''));
        }
        if (d.cv) {
            const rows = Object.entries(d.cv).map(([lang, name]) => `<tr><td>${lang}</td><td>${escapeHtml(String(name))}</td></tr>`).join('');
            h += section('声优', `<table class="drawer-kv">${rows}</table>`);
        }
        return h;
    }
    function skillCard(s) {
        return `<div class="drawer-skill"><b>${escapeHtml(s.name || '')}</b>${s.description || s.detail ? `<p>${escapeHtml(s.description || s.detail)}</p>` : ''}${s.infoText ? `<p style="color:var(--teal-light);">${escapeHtml(s.infoText)}</p>` : ''}</div>`;
    }

    // ---- 武器 ----
    function renderWeapon(d) {
        let h = '';
        const rows = [
            ['类型', d.weaponText],
            ['基础攻击力', d.baseAtkValue != null ? Math.round(d.baseAtkValue) : null],
            ['副属性', d.mainStatText || d.substatText],
            ['副属性值', d.substatValue != null ? d.substatValue : null]
        ].filter(([, v]) => v != null && v !== '');
        if (rows.length) h += section('属性', `<table class="drawer-kv">${rows.map(([k, v]) => `<tr><td>${k}</td><td>${escapeHtml(String(v))}</td></tr>`).join('')}</table>`);

        if (d.effectName) {
            let body = `<p style="color:var(--gold-light);font-weight:600;margin-bottom:8px;">${escapeHtml(d.effectName)}</p>`;
            for (const rk of ['r1', 'r2', 'r3', 'r4', 'r5']) {
                const r = d[rk];
                if (!r || !r.description) continue;
                body += `<div class="drawer-skill"><b>${rk.toUpperCase()}</b><p>${escapeHtml(r.description)}</p></div>`;
            }
            h += section('被动效果', body);
        }
        return h;
    }

    // ---- 圣遗物 ----
    function renderArtifact(d) {
        let h = '';
        if (d.effect2Pc || d.effect4Pc || d.setEffect) {
            let body = '';
            if (d.effect2Pc) body += `<div class="drawer-skill"><b>2 件套</b><p>${escapeHtml(d.effect2Pc)}</p></div>`;
            if (d.effect4Pc) body += `<div class="drawer-skill"><b>4 件套</b><p>${escapeHtml(d.effect4Pc)}</p></div>`;
            if (d.setEffect && !d.effect2Pc && !d.effect4Pc) body += `<p>${escapeHtml(d.setEffect)}</p>`;
            h += section('套装效果', body);
        }
        const parts = ['flower', 'plume', 'sands', 'goblet', 'circlet'];
        const hasParts = parts.some(p => d[p]);
        if (hasParts) {
            let body = '';
            for (const p of parts) {
                const item = d[p];
                if (!item) continue;
                const img = imgUrl(item.images, 'filename_icon');
                body += `<div class="drawer-part">${img ? `<img src="${img}" onerror="this.style.display='none'">` : ''}<span>${escapeHtml(item.relicText || '')} · ${escapeHtml(item.name || '')}</span></div>`;
            }
            h += section('部位', body);
        }
        if (d.rarityList) {
            h += section('可用稀有度', `<p>${d.rarityList.map(r => r + '★').join(' / ')}</p>`);
        }
        return h;
    }

    // ---- 材料 ----
    function renderMaterial(d) {
        let h = '';
        const rows = [
            ['类型', d.typeText || d.type],
            ['稀有度', d.rarity ? d.rarity + '★' : null]
        ].filter(([, v]) => v != null && v !== '');
        if (d.sources) {
            const src = Array.isArray(d.sources)
                ? d.sources.map(s => s.name || s.text || s).join('、')
                : String(d.sources);
            rows.push(['来源', src]);
        }
        if (rows.length) h += section('属性', `<table class="drawer-kv">${rows.map(([k, v]) => `<tr><td>${k}</td><td>${escapeHtml(String(v))}</td></tr>`).join('')}</table>`);
        return h;
    }

    // ===== 工具 =====
    function escapeHtml(s) {
        if (s === null || s === undefined) return '';
        const div = document.createElement('div');
        div.textContent = String(s);
        return div.innerHTML;
    }

    // ===== 事件绑定 =====
    queryInput.addEventListener('input', scheduleSearch);
    folderSelect.addEventListener('change', scheduleSearch);
    langSelect.addEventListener('change', () => {
        currentLang = langSelect.value;
        scheduleSearch();
    });

    // ===== 初始化 =====
    renderHistory();
    queryInput.focus();
})();
