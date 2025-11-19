// ====================================
// 閲覧ページの機能
// ====================================

let allPosts = [];
let filteredPosts = [];
let currentFilter = 'all';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', function() {
    initViewPage();
});

/**
 * 閲覧ページの初期化
 */
function initViewPage() {
    // データ読み込み
    loadAndDisplayPosts();
    
    // 検索機能
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // フィルターボタン
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', handleFilter);
    });
}

/**
 * 投稿データを読み込んで表示
 */
function loadAndDisplayPosts() {
    allPosts = window.RishuApp.loadPosts();
    applyFiltersAndDisplay();
}

/**
 * フィルターと検索を適用して表示
 */
function applyFiltersAndDisplay() {
    // フィルター適用
    filteredPosts = allPosts.filter(post => {
        // 学年フィルター
        if (currentFilter !== 'all' && post.grade !== currentFilter) {
            return false;
        }
        
        // 検索フィルター
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const username = post.username.toLowerCase();
            const comment = post.comment.toLowerCase();
            
            if (!username.includes(query) && !comment.includes(query)) {
                return false;
            }
        }
        
        return true;
    });
    
    displayPosts();
}

/**
 * 投稿を表示
 */
function displayPosts() {
    const container = document.getElementById('postsContainer');
    
    if (!container) {
        return;
    }
    
    // 投稿がない場合
    if (filteredPosts.length === 0) {
        const emptyMessage = searchQuery || currentFilter !== 'all' 
            ? '該当する投稿が見つかりませんでした'
            : 'まだ投稿がありません';
        
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>${emptyMessage}</p>
                ${!searchQuery && currentFilter === 'all' ? '<a href="post.html" class="btn btn-primary">最初の投稿をする</a>' : ''}
            </div>
        `;
        return;
    }
    
    // 投稿カードを生成
    const postsHTML = filteredPosts.map(post => createPostCard(post)).join('');
    container.innerHTML = postsHTML;
}

/**
 * 投稿カードのHTMLを生成
 * @param {Object} post - 投稿データ
 * @returns {string} HTML文字列
 */
function createPostCard(post) {
    const initial = window.RishuApp.getInitial(post.username);
    const formattedDate = window.RishuApp.formatDate(post.timestamp);
    const fileType = window.RishuApp.getFileType(post.file);
    
    // 検索クエリでハイライト
    const highlightedUsername = searchQuery 
        ? window.RishuApp.highlightText(post.username, searchQuery)
        : post.username;
    
    const highlightedComment = searchQuery 
        ? window.RishuApp.highlightText(post.comment, searchQuery)
        : post.comment;
    
    // ファイル表示部分
    let fileHTML = '';
    if (fileType === 'image') {
        fileHTML = `
            <div class="post-file">
                <img src="${post.file}" alt="履修登録表" loading="lazy">
            </div>
        `;
    } else {
        fileHTML = `
            <div class="post-file">
                <div class="pdf-preview">
                    <i class="fas fa-file-pdf"></i>
                    <p><strong>${post.fileName}</strong></p>
                    <a href="${post.file}" download="${post.fileName}" target="_blank">
                        <i class="fas fa-download"></i>
                        PDFをダウンロード
                    </a>
                </div>
            </div>
        `;
    }
    
    return `
        <div class="post-card" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-user-info">
                    <div class="user-avatar">${initial}</div>
                    <div class="user-details">
                        <h3>${highlightedUsername}</h3>
                        <div class="user-meta">
                            <span class="grade-badge">
                                ${post.grade === '先輩' ? '<i class="fas fa-star"></i> ' : ''}
                                ${post.grade}
                            </span>
                            <span class="post-date">
                                <i class="fas fa-clock"></i>
                                ${formattedDate}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            ${post.comment && post.comment !== '（コメントなし）' ? `
                <div class="post-content">
                    <p class="post-comment">${highlightedComment}</p>
                </div>
            ` : ''}
            
            ${fileHTML}
        </div>
    `;
}

/**
 * 検索処理
 * @param {Event} e - イベントオブジェクト
 */
function handleSearch(e) {
    searchQuery = e.target.value.trim();
    applyFiltersAndDisplay();
}

/**
 * フィルター処理
 * @param {Event} e - イベントオブジェクト
 */
function handleFilter(e) {
    const btn = e.currentTarget;
    const grade = btn.dataset.grade;
    
    // アクティブ状態を更新
    document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('active');
    });
    btn.classList.add('active');
    
    // フィルターを適用
    currentFilter = grade;
    applyFiltersAndDisplay();
}

/**
 * 投稿を削除（開発用）
 * @param {string} postId - 投稿ID
 */
function deletePost(postId) {
    if (confirm('この投稿を削除しますか？')) {
        const posts = window.RishuApp.loadPosts();
        const updatedPosts = posts.filter(post => post.id !== postId);
        window.RishuApp.savePosts(updatedPosts);
        loadAndDisplayPosts();
        window.RishuApp.showNotification('投稿を削除しました', 'success');
    }
}

/**
 * すべての投稿をクリア（開発用）
 */
function clearAllPosts() {
    if (confirm('すべての投稿を削除しますか？この操作は取り消せません。')) {
        localStorage.removeItem('meijo_rishu_posts');
        loadAndDisplayPosts();
        window.RishuApp.showNotification('すべての投稿を削除しました', 'success');
    }
}

// グローバルスコープに関数を公開
window.deletePost = deletePost;
window.clearAllPosts = clearAllPosts;
window.loadAndDisplayPosts = loadAndDisplayPosts;
