(function() {
    'use strict';

    // ===== DOM 元素 =====
    const queryInput = document.getElementById('queryInput');
    const folderSelect = document.getElementById('folderSelect');
    const langSelect = document.getElementById('langSelect');
    const searchBtn = document.getElementById('searchBtn');
    const resultArea = document.getElementById('resultArea');
    const paginationDiv = document.getElementById('pagination');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const pageInfo = document.getElementById('pageInfo');
    const totalDisplay = document.getElementById('totalCountDisplay');
    const actionBar = document.getElementById('actionBar');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const historyDatalist = document.getElementById('searchHistory');

    // ===== 分页状态 =====
    let currentPage = 0;
    let totalPages = 0;
    let folderNames = [];
    let aggregatedData = null;
    let currentResultText = '';

    // ===== 搜索历史 =====
    const HISTORY_KEY = 'genshin_search_history';
    const HISTORY_MAX = 10;

    function loadHistory() {
        try {
            const raw = localStorage.getItem(HISTORY_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function saveHistory(query) {
        let history = loadHistory().filter(item => item !== query);
        history.unshift(query);
        if (history.length > HISTORY_MAX) history = history.slice(0, HISTORY_MAX);
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        } catch (e) { /* ignore */ }
        renderHistory();
    }

    function renderHistory() {
        const history = loadHistory();
        historyDatalist.innerHTML = history.map(item => `<option value="${item}">`).join('');
    }

    // ===== 渲染加载状态 =====
    function showLoading(query) {
        resultArea.innerHTML = `<div class="loading"><div class="spinner"></div><div>正在查询 "${query}" ...</div></div>`;
        paginationDiv.style.display = 'none';
        actionBar.style.display = 'none';
    }

    // ===== 渲染当前分页 =====
    function renderPage() {
        if (!aggregatedData || folderNames.length === 0) {
            paginationDiv.style.display = 'none';
            return;
        }

        const folder = folderNames[currentPage];
        const data = aggregatedData.results[folder];
        const matchedCount = Array.isArray(data) ? data.length : 1;

        let html = `<span class="badge">综合搜索结果 · 第 ${currentPage + 1}/${totalPages} 页</span>\n\n`;
        html += `<div class="folder-header">${folder}（匹配 ${matchedCount} 项）</div>`;
        const jsonText = JSON.stringify(data, null, 2);
        html += jsonText;
        currentResultText = jsonText;
        resultArea.innerHTML = html;

        prevBtn.disabled = (currentPage === 0);
        nextBtn.disabled = (currentPage === totalPages - 1);
        pageInfo.textContent = `${currentPage + 1} / ${totalPages}`;
        paginationDiv.style.display = 'flex';
        actionBar.style.display = 'flex';
    }

    // ===== 分页切换 =====
    function changePage(delta) {
        const newPage = currentPage + delta;
        if (newPage < 0 || newPage >= totalPages) return;
        currentPage = newPage;
        renderPage();
    }

    // ===== 复制结果到剪贴板 =====
    function copyResult() {
        if (!currentResultText) return;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(currentResultText).then(() => {
                const orig = copyBtn.textContent;
                copyBtn.textContent = '已复制 ✓';
                setTimeout(() => { copyBtn.textContent = orig; }, 1500);
            }).catch(() => {
                fallbackCopy(currentResultText);
            });
        } else {
            fallbackCopy(currentResultText);
        }
    }

    function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            const orig = copyBtn.textContent;
            copyBtn.textContent = '已复制 ✓';
            setTimeout(() => { copyBtn.textContent = orig; }, 1500);
        } catch (e) {
            alert('复制失败，请手动选择文本复制');
        }
        document.body.removeChild(ta);
    }

    // ===== 清除结果 =====
    function clearResult() {
        resultArea.innerHTML = `<div class="placeholder">选择"综合搜索"可跨所有类别查询<br>也可选择具体分类精准查询</div>`;
        paginationDiv.style.display = 'none';
        actionBar.style.display = 'none';
        currentResultText = '';
    }

    // ===== 主查询 =====
    async function performSearch() {
        const query = queryInput.value.trim();
        const folder = folderSelect.value;
        const resultLanguage = langSelect.value;

        if (!query) {
            resultArea.innerHTML = `<span class="error-msg">请输入要查询的名称</span>`;
            paginationDiv.style.display = 'none';
            actionBar.style.display = 'none';
            return;
        }

        saveHistory(query);
        showLoading(query);
        searchBtn.disabled = true;

        try {
            const response = await fetch(`/api/search?folder=${encodeURIComponent(folder)}&query=${encodeURIComponent(query)}&resultLanguage=${encodeURIComponent(resultLanguage)}`);
            const data = await response.json();

            if (data && data.error) {
                resultArea.innerHTML = `<span class="error-msg">${data.error}</span>`;
                paginationDiv.style.display = 'none';
                actionBar.style.display = 'none';
                return;
            }

            // ---- 综合搜索（聚合结果） ----
            if (data && data.type === 'aggregated') {
                aggregatedData = data;
                folderNames = Object.keys(data.results);
                totalPages = folderNames.length;

                if (totalPages === 0) {
                    resultArea.innerHTML = `<span class="error-msg">综合搜索未找到任何匹配</span>`;
                    paginationDiv.style.display = 'none';
                    actionBar.style.display = 'none';
                    return;
                }

                currentPage = 0;
                renderPage();
                return;
            }

            // ---- 单个分类查询 ----
            if (!data || (Array.isArray(data) && data.length === 0)) {
                resultArea.innerHTML = `<span class="error-msg">未找到与 "${query}" 匹配的数据</span>`;
                paginationDiv.style.display = 'none';
                actionBar.style.display = 'none';
                return;
            }

            const prettyJson = JSON.stringify(data, null, 2);
            currentResultText = prettyJson;
            resultArea.innerHTML = `<span class="badge">查询结果 · ${folder}</span>\n\n${prettyJson}`;
            paginationDiv.style.display = 'none';
            actionBar.style.display = 'flex';

        } catch (error) {
            resultArea.innerHTML = `<span class="error-msg">网络请求失败，请确保后端服务已启动 (node server.js)</span>`;
            paginationDiv.style.display = 'none';
            actionBar.style.display = 'none';
            console.error('Fetch error:', error);
        } finally {
            searchBtn.disabled = false;
        }
    }

    // ===== 更新分类总数 =====
    async function updateTotalCount(folder) {
        try {
            const response = await fetch(`/api/count?folder=${encodeURIComponent(folder)}`);
            const data = await response.json();

            if (data && data.error) {
                totalDisplay.textContent = '总数：--';
                return;
            }

            if (folder === 'all') {
                totalDisplay.textContent = `全部数据总数：${data.count}`;
            } else {
                const selectedOption = folderSelect.options[folderSelect.selectedIndex];
                const displayName = selectedOption ? selectedOption.text.trim() : folder;
                totalDisplay.textContent = `${displayName} 总数：${data.count}`;
            }
        } catch (error) {
            totalDisplay.textContent = '总数：--';
            console.error('获取总数失败:', error);
        }
    }

    // ===== 事件绑定 =====
    queryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    searchBtn.addEventListener('click', performSearch);
    prevBtn.addEventListener('click', () => changePage(-1));
    nextBtn.addEventListener('click', () => changePage(1));
    copyBtn.addEventListener('click', copyResult);
    clearBtn.addEventListener('click', clearResult);

    folderSelect.addEventListener('change', function() {
        updateTotalCount(this.value);
    });

    // ===== 页面初始化 =====
    window.addEventListener('load', () => {
        queryInput.focus();
        renderHistory();
        updateTotalCount(folderSelect.value);
    });

})();
