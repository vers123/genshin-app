(function () {
    'use strict';

    const timeline = document.getElementById('timeline');

    // ===== 轻量 Markdown 渲染器（支持标题/列表/粗体/代码/链接等常见语法）=====
    function renderMarkdown(md) {
        if (!md) return '';
        let html = escapeHtml(md);

        // 代码块 ```lang ... ```
        html = html.replace(/```[\s\S]*?```/g, block => {
            const inner = block.slice(3, -3).replace(/^[a-zA-Z0-9+#-]*\n/, '');
            return `<pre><code>${inner}</code></pre>`;
        });

        const lines = html.split('\n');
        let out = [];
        let listBuf = [];
        let listType = null; // 'ul' | 'ol'

        function flushList() {
            if (!listBuf.length) return;
            const tag = listType === 'ol' ? 'ol' : 'ul';
            out.push(`<${tag}>${listBuf.map(i => `<li>${i}</li>`).join('')}</${tag}>`);
            listBuf = [];
            listType = null;
        }

        for (let line of lines) {
            // 标题
            const h = line.match(/^(#{1,3})\s+(.+)$/);
            if (h) {
                flushList();
                const level = h[1].length;
                out.push(`<h${level}>${inline(h[2])}</h${level}>`);
                continue;
            }
            // 无序列表
            const ul = line.match(/^\s*[-*]\s+(.+)$/);
            if (ul) {
                if (listType && listType !== 'ul') flushList();
                listType = 'ul';
                listBuf.push(inline(ul[1]));
                continue;
            }
            // 有序列表
            const ol = line.match(/^\s*\d+\.\s+(.+)$/);
            if (ol) {
                if (listType && listType !== 'ol') flushList();
                listType = 'ol';
                listBuf.push(inline(ol[1]));
                continue;
            }
            // 空行
            if (line.trim() === '') {
                flushList();
                continue;
            }
            // 普通段落
            flushList();
            out.push(`<p>${inline(line)}</p>`);
        }
        flushList();

        return out.join('\n');
    }

    // 行内格式：粗体/斜体/行内代码/链接
    function inline(text) {
        // 行内代码 `code`
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        // 粗体 **text**
        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        // 斜体 *text*
        text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        // 链接 [text](url)
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
        return text;
    }

    function escapeHtml(s) {
        const div = document.createElement('div');
        div.textContent = String(s);
        return div.innerHTML;
    }

    // ===== 加载并渲染 =====
    async function loadChangelog() {
        try {
            const res = await fetch('/api/changelog');
            const data = await res.json();

            if (!data.releases || data.releases.length === 0) {
                timeline.innerHTML = '<div class="empty-changelog">暂无更新日志</div>';
                return;
            }

            timeline.innerHTML = data.releases.map(r => `
                <article class="release-card">
                    <div class="release-header">
                        <span class="release-version">v${r.version}</span>
                        <span class="release-date">${r.date}</span>
                        <span class="release-tag">${r.tag}</span>
                    </div>
                    <div class="release-body">${renderMarkdown(r.content)}</div>
                </article>
            `).join('');
        } catch (e) {
            timeline.innerHTML = '<div class="empty-changelog">加载更新日志失败，请确保后端服务已启动</div>';
            console.error(e);
        }
    }

    loadChangelog();
})();
