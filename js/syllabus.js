// ============================================
// シラバス検索ページのJavaScript（Supabase対応）
// ============================================

let allSyllabus = [];
let currentFilters = {
    keyword: '',
    grade: '',
    term: ''
};

// ページ読み込み
document.addEventListener('DOMContentLoaded', () => {
    loadSyllabus();
    setupEventListeners();
});

// イベント設定
function setupEventListeners() {
    document.getElementById('searchBtn').addEventListener('click', performSearch);

    document.getElementById('searchInput').addEventListener('keypress', e => {
        if (e.key === 'Enter') performSearch();
    });
}

// ============================================
// Supabase からデータ取得
// ============================================
async function loadSyllabus() {
    try {
        const client = window.supabaseClient;
        if (!client) {
            console.error("Supabase client is not initialized");
            showMessage("Supabase が初期化されていません", "error");
            return;
        }
        const { data, error } = await client
            .from("courses")
            .select("*");

        if (error) {
            console.error(error);
            showMessage("シラバスの読み込みに失敗しました", "error");
            return;
        }

        allSyllabus = data;
        displayResults(data);

    } catch (err) {
        console.error(err);
        showMessage("読み込み中にエラーが発生しました", "error");
    }
}

// ============================================
// キーワード検索（name で検索）
// ============================================
function performSearch() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    currentFilters.keyword = keyword;

    const filtered = allSyllabus.filter(item => {
        return item.name.toLowerCase().includes(keyword);
    });

    displayResults(filtered);
}

// ============================================
// 結果表示
// ============================================
function displayResults(list) {
    const container = document.getElementById("syllabusResults");
    const count = document.getElementById("resultsCount");

    count.textContent = list.length;

    if (list.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                <i class="fas fa-search"></i>
                <p>一致する科目がありませんでした。</p>
            </div>
        `;
        return;
    }

    container.innerHTML = list.map(course => createCard(course)).join("");
}

// ============================================
// カード生成
// ============================================
function createCard(course) {
    return `
        <div class="syllabus-card" onclick="showDetail('${course.id}')">
            <div class="syllabus-header">
                <h4 class="syllabus-title">${escapeHtml(course.name)}</h4>
                <span class="syllabus-code">${course.grade}年 / ${course.term}</span>
            </div>
            <div class="syllabus-overview">
                ${escapeHtml(course.description || "説明なし")}
            </div>
        </div>
    `;
}

// ============================================
// 詳細表示モーダル
// ============================================
async function showDetail(courseId) {
    try {
        const client = window.supabaseClient;
        if (!client) {
            console.error("Supabase client is not initialized");
            showMessage("Supabase が初期化されていません", "error");
            return;
        }
        // id に一致するデータだけ取得
        const { data, error } = await client
            .from("courses")         // ← あなたのテーブル名に合わせてある
            .select("*")
            .eq("id", courseId)
            .single();

        if (error || !data) {
            console.error(error);
            showMessage("詳細データを取得できませんでした", "error");
            return;
        }

        const c = data;

        // HTML を組み立てる
        const html = `
            <h3 class="detail-title">${escapeHtml(c.name)}</h3>

            <div class="detail-grid">
                <div class="detail-item"><span class="detail-label">学年</span><span class="detail-value">${c.grade} 年</span></div>
                <div class="detail-item"><span class="detail-label">学期</span><span class="detail-value">${escapeHtml(c.term)}</span></div>
            </div>

            ${section("授業概要", c.description)}
            ${section("授業の流れ", c.flow)}
            ${section("課題", c.homework)}
            ${section("評価方法", c.evolution)}
            ${section("難易度", c.difficulty)}
            ${section("まとめ", c.summary)}
        `;

        document.getElementById("syllabusDetail").innerHTML = html;
        document.getElementById("syllabusModal").classList.add("active");

    } catch (err) {
        console.error(err);
        showMessage("詳細データ取得時にエラーが発生しました", "error");
    }
}

function section(title, value) {
    if (!value) return "";
    return `
        <div class="detail-section">
            <h4 class="detail-title">${title}</h4>
            <div class="detail-content">${escapeHtml(value)}</div>
        </div>
    `;
}


// モーダル閉じる
function closeSyllabusModal() {
    document.getElementById("syllabusModal").classList.remove("active");
}

// HTMLエスケープ
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// メッセージ表示
function showMessage(msg, type = "success") {
    const el = document.createElement("div");
    el.style.cssText = `
        position: fixed; top:20px; right:20px;
        padding: 1rem 1.5rem;
        background: ${type === "success" ? "#10b981" : "#ef4444"};
        color: #fff; border-radius: 8px;
        z-index:9999;
    `;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}
