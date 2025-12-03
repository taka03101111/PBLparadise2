// ============================================
// シラバス検索ページのJavaScript
// ============================================

// グローバル変数
let allSyllabus = [];
let currentFilters = {
    year: '',
    semester: '',
    category: '',
    dayOfWeek: '',
    period: '',
    credits: '',
    keyword: ''
};

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    loadSyllabus();
    setupEventListeners();
});

// イベントリスナーの設定
function setupEventListeners() {
    // 検索ボタン
    document.getElementById('searchBtn').addEventListener('click', performSearch);
    
    // Enterキーで検索
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // 詳細フィルタートグル
    document.getElementById('toggleFilters').addEventListener('click', function() {
        const filterPanel = document.getElementById('filterPanel');
        filterPanel.classList.toggle('active');
    });
    
    // フィルター適用
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    
    // フィルタークリア
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
}

// シラバスデータの読み込み
// シラバスデータの読み込み（Supabase版）
async function loadSyllabus() {
    try {
        const { data, error } = await supabase
            .from("syllabus")
            .select("*")
            .limit(500);   // 必要に応じて増やせる

        if (error) {
            console.error("Supabase 読み込みエラー:", error);
            showMessage('シラバスの読み込みに失敗しました。', 'error');
            return;
        }

        allSyllabus = data || [];

        if (allSyllabus.length === 0) {
            document.getElementById('syllabusResults').innerHTML = `
                <div class="empty-message">
                    <i class="fas fa-info-circle"></i>
                    <p>シラバスデータがまだ登録されていません。</p>
                </div>
            `;
        }

    } catch (error) {
        console.error('読み込み処理エラー:', error);
        showMessage('シラバスの読み込みに失敗しました。', 'error');
    }
}


// 検索実行
function performSearch() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    currentFilters.keyword = keyword;
    
    const filtered = filterSyllabus(allSyllabus);
    displayResults(filtered);
}

// フィルター適用
function applyFilters() {
    currentFilters = {
        year: document.getElementById('filterYearSyllabus').value,
        semester: document.getElementById('filterSemesterSyllabus').value,
        category: document.getElementById('filterCategorySyllabus').value,
        dayOfWeek: document.getElementById('filterDayOfWeek').value,
        period: document.getElementById('filterPeriod').value,
        credits: document.getElementById('filterCredits').value,
        keyword: document.getElementById('searchInput').value.toLowerCase()
    };
    
    const filtered = filterSyllabus(allSyllabus);
    displayResults(filtered);
}

// フィルタークリア
function clearFilters() {
    document.getElementById('filterYearSyllabus').value = '';
    document.getElementById('filterSemesterSyllabus').value = '';
    document.getElementById('filterCategorySyllabus').value = '';
    document.getElementById('filterDayOfWeek').value = '';
    document.getElementById('filterPeriod').value = '';
    document.getElementById('filterCredits').value = '';
    document.getElementById('searchInput').value = '';
    
    currentFilters = {
        year: '',
        semester: '',
        category: '',
        dayOfWeek: '',
        period: '',
        credits: '',
        keyword: ''
    };
    
    document.getElementById('syllabusResults').innerHTML = `
        <div class="empty-message">
            <i class="fas fa-info-circle"></i>
            <p>検索キーワードを入力するか、フィルターを設定して検索してください。</p>
        </div>
    `;
    
    document.getElementById('resultsCount').textContent = '0';
}

// シラバスのフィルタリング
function filterSyllabus(syllabusData) {
    return syllabusData.filter(course => {
        // 学年フィルター
        if (currentFilters.year && course.year !== parseInt(currentFilters.year)) {
            return false;
        }
        
        // 学期フィルター
        if (currentFilters.semester && course.semester !== currentFilters.semester) {
            return false;
        }
        
        // 科目区分フィルター
        if (currentFilters.category && course.category !== currentFilters.category) {
            return false;
        }
        
        // 曜日フィルター
        if (currentFilters.dayOfWeek && course.day_of_week !== currentFilters.dayOfWeek) {
            return false;
        }
        
        // 時限フィルター
        if (currentFilters.period && course.period !== parseInt(currentFilters.period)) {
            return false;
        }
        
        // 単位数フィルター
        if (currentFilters.credits && course.credits !== parseInt(currentFilters.credits)) {
            return false;
        }
        
        // キーワード検索
        if (currentFilters.keyword) {
            const searchText = `
                ${course.course_name} 
                ${course.instructor} 
                ${course.overview || ''} 
                ${course.keywords || ''}
            `.toLowerCase();
            
            if (!searchText.includes(currentFilters.keyword)) {
                return false;
            }
        }
        
        return true;
    });
}

// 検索結果の表示
function displayResults(results) {
    const resultsDiv = document.getElementById('syllabusResults');
    const resultsCount = document.getElementById('resultsCount');
    
    resultsCount.textContent = results.length;
    
    if (results.length === 0) {
        resultsDiv.innerHTML = `
            <div class="empty-message">
                <i class="fas fa-search"></i>
                <p>検索条件に一致する科目が見つかりませんでした。</p>
            </div>
        `;
        return;
    }
    
    resultsDiv.innerHTML = results.map(course => createSyllabusCard(course)).join('');
}

// シラバスカードの作成
function createSyllabusCard(course) {
    const days = { '月': '月曜', '火': '火曜', '水': '水曜', '木': '木曜', '金': '金曜' };
    const overview = course.overview ? 
        (course.overview.length > 100 ? course.overview.substring(0, 100) + '...' : course.overview) : 
        '授業概要はありません。';
    
    return `
        <div class="syllabus-card" onclick="showSyllabusDetail('${course.id}')">
            <div class="syllabus-header">
                <h4 class="syllabus-title">${escapeHtml(course.course_name)}</h4>
                <span class="syllabus-code">${escapeHtml(course.course_code || 'N/A')}</span>
            </div>
            
            <div class="syllabus-info">
                <span><i class="fas fa-chalkboard-teacher"></i> ${escapeHtml(course.instructor)}</span>
                <span><i class="fas fa-graduation-cap"></i> ${course.year}年生</span>
                <span><i class="fas fa-calendar"></i> ${escapeHtml(course.semester)}</span>
                <span><i class="fas fa-tag"></i> ${escapeHtml(course.category)}</span>
                <span><i class="fas fa-certificate"></i> ${course.credits}単位</span>
                ${course.day_of_week ? `<span><i class="fas fa-clock"></i> ${days[course.day_of_week]}日 ${course.period}限</span>` : ''}
            </div>
            
            <div class="syllabus-overview">
                ${escapeHtml(overview)}
            </div>
        </div>
    `;
}

// シラバス詳細表示
function showSyllabusDetail(courseId) {
    const course = allSyllabus.find(c => c.id === courseId);
    if (!course) return;
    
    const days = { '月': '月曜', '火': '火曜', '水': '水曜', '木': '木曜', '金': '金曜' };
    
    const detailHtml = `
        <div class="detail-section">
            <h3 class="detail-title">${escapeHtml(course.course_name)}</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">授業コード</span>
                    <span class="detail-value">${escapeHtml(course.course_code || 'N/A')}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">教員名</span>
                    <span class="detail-value">${escapeHtml(course.instructor)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">対象学年</span>
                    <span class="detail-value">${course.year}年生</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">開講学期</span>
                    <span class="detail-value">${escapeHtml(course.semester)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">科目区分</span>
                    <span class="detail-value">${escapeHtml(course.category)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">単位数</span>
                    <span class="detail-value">${course.credits}単位</span>
                </div>
                ${course.day_of_week ? `
                    <div class="detail-item">
                        <span class="detail-label">曜日・時限</span>
                        <span class="detail-value">${days[course.day_of_week]}日 ${course.period}限</span>
                    </div>
                ` : ''}
                ${course.room ? `
                    <div class="detail-item">
                        <span class="detail-label">教室</span>
                        <span class="detail-value">${escapeHtml(course.room)}</span>
                    </div>
                ` : ''}
            </div>
        </div>
        
        ${course.overview ? `
            <div class="detail-section">
                <h4 class="detail-title">授業概要</h4>
                <div class="detail-content">${escapeHtml(course.overview)}</div>
            </div>
        ` : ''}
        
        ${course.objectives ? `
            <div class="detail-section">
                <h4 class="detail-title">到達目標</h4>
                <div class="detail-content">${escapeHtml(course.objectives)}</div>
            </div>
        ` : ''}
        
        ${course.evaluation ? `
            <div class="detail-section">
                <h4 class="detail-title">評価方法</h4>
                <div class="detail-content">${escapeHtml(course.evaluation)}</div>
            </div>
        ` : ''}
        
        ${course.textbook ? `
            <div class="detail-section">
                <h4 class="detail-title">教科書</h4>
                <div class="detail-content">${escapeHtml(course.textbook)}</div>
            </div>
        ` : ''}
        
        ${course.keywords ? `
            <div class="detail-section">
                <h4 class="detail-title">キーワード</h4>
                <div class="detail-content">${escapeHtml(course.keywords)}</div>
            </div>
        ` : ''}
    `;
    
    document.getElementById('syllabusDetail').innerHTML = detailHtml;
    document.getElementById('syllabusModal').classList.add('active');
}

// モーダルを閉じる
function closeSyllabusModal() {
    document.getElementById('syllabusModal').classList.remove('active');
}

// メッセージ表示
function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background-color: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

// HTMLエスケープ
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// モーダル外クリックで閉じる
document.addEventListener('click', function(e) {
    const modal = document.getElementById('syllabusModal');
    if (e.target === modal) {
        closeSyllabusModal();
    }
});

// アニメーション用CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
