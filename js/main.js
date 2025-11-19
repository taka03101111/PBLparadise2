// ====================================
// ローカルストレージ管理
// ====================================

const STORAGE_KEY = 'meijo_rishu_posts';

/**
 * 投稿データをローカルストレージに保存
 * @param {Array} posts - 投稿データの配列
 */
function savePosts(posts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

/**
 * ローカルストレージから投稿データを取得
 * @returns {Array} 投稿データの配列
 */
function loadPosts() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

/**
 * 新しい投稿を追加
 * @param {Object} post - 投稿データ
 */
function addPost(post) {
    const posts = loadPosts();
    const newPost = {
        id: generateId(),
        timestamp: Date.now(),
        ...post
    };
    posts.unshift(newPost); // 最新の投稿を先頭に追加
    savePosts(posts);
    return newPost;
}

/**
 * ユニークなIDを生成
 * @returns {string} ユニークID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 日時を日本語形式にフォーマット
 * @param {number} timestamp - タイムスタンプ
 * @returns {string} フォーマットされた日時
 */
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // 1時間以内
    if (diff < 60 * 60 * 1000) {
        const minutes = Math.floor(diff / (60 * 1000));
        return minutes <= 0 ? 'たった今' : `${minutes}分前`;
    }
    
    // 24時間以内
    if (diff < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(diff / (60 * 60 * 1000));
        return `${hours}時間前`;
    }
    
    // 7日以内
    if (diff < 7 * 24 * 60 * 60 * 1000) {
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        return `${days}日前`;
    }
    
    // それ以外
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}/${month}/${day} ${hours}:${minutes}`;
}

/**
 * ファイルサイズを人間が読みやすい形式に変換
 * @param {number} bytes - バイト数
 * @returns {string} フォーマットされたサイズ
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * ファイルをBase64に変換
 * @param {File} file - ファイルオブジェクト
 * @returns {Promise<string>} Base64エンコードされた文字列
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

/**
 * ファイルタイプを判定
 * @param {string} dataUrl - Data URL
 * @returns {string} ファイルタイプ ('image' or 'pdf')
 */
function getFileType(dataUrl) {
    if (dataUrl.startsWith('data:application/pdf')) {
        return 'pdf';
    }
    return 'image';
}

/**
 * ユーザー名の頭文字を取得（アバター表示用）
 * @param {string} username - ユーザー名
 * @returns {string} 頭文字
 */
function getInitial(username) {
    if (!username) return '?';
    return username.charAt(0).toUpperCase();
}

/**
 * テキストをハイライト
 * @param {string} text - テキスト
 * @param {string} query - 検索クエリ
 * @returns {string} ハイライトされたHTML
 */
function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

/**
 * 正規表現の特殊文字をエスケープ
 * @param {string} string - エスケープする文字列
 * @returns {string} エスケープされた文字列
 */
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 通知を表示
 * @param {string} message - メッセージ
 * @param {string} type - タイプ ('success', 'error', 'info')
 */
function showNotification(message, type = 'info') {
    // 既存の通知を削除
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // スタイルを追加
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 12px;
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    // 3秒後に削除
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// アニメーションのCSSを追加
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
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
                transform: translateX(400px);
                opacity: 0;
            }
        }
        
        .notification mark {
            background: yellow;
            padding: 2px 4px;
            border-radius: 3px;
        }
    `;
    document.head.appendChild(style);
}

// ====================================
// エクスポート（他のファイルで使用可能）
// ====================================
window.RishuApp = {
    savePosts,
    loadPosts,
    addPost,
    generateId,
    formatDate,
    formatFileSize,
    fileToBase64,
    getFileType,
    getInitial,
    highlightText,
    showNotification
};
