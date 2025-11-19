// ============================================
// 履修情報共有ページのJavaScript
// ============================================

// グローバル変数
let allReviews = [];
let currentFilters = {
    year: '',
    semester: '',
    category: '',
    keyword: ''
};
let currentSort = 'newest';

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    loadReviews();
    setupEventListeners();
});

// イベントリスナーの設定
function setupEventListeners() {
    // フォーム送信
    document.getElementById('courseReviewForm').addEventListener('submit', handleFormSubmit);
    
    // フィルター適用
    document.getElementById('applyFilter').addEventListener('click', applyFilters);
    
    // 並び替え
    document.getElementById('sortBy').addEventListener('change', function() {
        currentSort = this.value;
        displayReviews(filterReviews(allReviews));
    });
    
    // Enterキーで検索
    document.getElementById('searchKeyword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
}

// レビューデータの読み込み
async function loadReviews() {
    try {
        const response = await fetch('tables/shared_course_reviews?limit=100');
        const data = await response.json();
        allReviews = data.data || [];
        displayReviews(filterReviews(allReviews));
    } catch (error) {
        console.error('レビューの読み込みエラー:', error);
        showMessage('レビューの読み込みに失敗しました。', 'error');
    }
}

// フォーム送信処理
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const reviewData = {
        nickname: formData.get('nickname'),
        year: parseInt(formData.get('year')),
        semester: formData.get('semester'),
        course_name: formData.get('courseName'),
        instructor: formData.get('instructor'),
        category: formData.get('category'),
        credits: parseInt(formData.get('credits')),
        difficulty: parseInt(formData.get('difficulty')),
        satisfaction: parseInt(formData.get('satisfaction')),
        comment: formData.get('comment')
    };
    
    try {
        const response = await fetch('tables/shared_course_reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reviewData)
        });
        
        if (response.ok) {
            showMessage('履修情報を投稿しました!', 'success');
            e.target.reset();
            loadReviews(); // リストを更新
        } else {
            throw new Error('投稿に失敗しました');
        }
    } catch (error) {
        console.error('投稿エラー:', error);
        showMessage('投稿に失敗しました。もう一度お試しください。', 'error');
    }
}

// フィルター適用
function applyFilters() {
    currentFilters = {
        year: document.getElementById('filterYear').value,
        semester: document.getElementById('filterSemester').value,
        category: document.getElementById('filterCategory').value,
        keyword: document.getElementById('searchKeyword').value.toLowerCase()
    };
    
    displayReviews(filterReviews(allReviews));
}

// レビューのフィルタリング
function filterReviews(reviews) {
    return reviews.filter(review => {
        // 学年フィルター
        if (currentFilters.year && review.year !== parseInt(currentFilters.year)) {
            return false;
        }
        
        // 学期フィルター
        if (currentFilters.semester && review.semester !== currentFilters.semester) {
            return false;
        }
        
        // 科目区分フィルター
        if (currentFilters.category && review.category !== currentFilters.category) {
            return false;
        }
        
        // キーワード検索
        if (currentFilters.keyword) {
            const searchText = `${review.course_name} ${review.instructor} ${review.comment}`.toLowerCase();
            if (!searchText.includes(currentFilters.keyword)) {
                return false;
            }
        }
        
        return true;
    });
}

// レビューの並び替え
function sortReviews(reviews) {
    const sorted = [...reviews];
    
    switch (currentSort) {
        case 'newest':
            sorted.sort((a, b) => b.created_at - a.created_at);
            break;
        case 'oldest':
            sorted.sort((a, b) => a.created_at - b.created_at);
            break;
        case 'satisfaction':
            sorted.sort((a, b) => b.satisfaction - a.satisfaction);
            break;
        case 'difficulty':
            sorted.sort((a, b) => b.difficulty - a.difficulty);
            break;
    }
    
    return sorted;
}

// レビューの表示
function displayReviews(reviews) {
    const reviewsList = document.getElementById('reviewsList');
    const sortedReviews = sortReviews(reviews);
    
    if (sortedReviews.length === 0) {
        reviewsList.innerHTML = `
            <div class="empty-message">
                <i class="fas fa-info-circle"></i>
                <p>該当する履修情報が見つかりませんでした。</p>
            </div>
        `;
        return;
    }
    
    reviewsList.innerHTML = sortedReviews.map(review => createReviewCard(review)).join('');
}

// レビューカードの作成
function createReviewCard(review) {
    const stars = '★'.repeat(5);
    const difficultyStars = '★'.repeat(review.difficulty) + '☆'.repeat(5 - review.difficulty);
    const satisfactionStars = '★'.repeat(review.satisfaction) + '☆'.repeat(5 - review.satisfaction);
    
    return `
        <div class="review-card">
            <div class="review-header">
                <div class="review-user">
                    <i class="fas fa-user-circle"></i>
                    <span>${escapeHtml(review.nickname)}</span>
                </div>
                <div class="review-meta">
                    <span class="meta-badge badge-year">
                        <i class="fas fa-graduation-cap"></i> ${review.year}年生
                    </span>
                    <span class="meta-badge badge-semester">
                        <i class="fas fa-calendar"></i> ${escapeHtml(review.semester)}
                    </span>
                    <span class="meta-badge badge-category">
                        <i class="fas fa-tag"></i> ${escapeHtml(review.category)}
                    </span>
                </div>
            </div>
            
            <div class="course-info">
                <h4 class="course-name">${escapeHtml(review.course_name)}</h4>
                <div class="course-details">
                    <span><i class="fas fa-chalkboard-teacher"></i> ${escapeHtml(review.instructor)}</span>
                    <span><i class="fas fa-certificate"></i> ${review.credits}単位</span>
                </div>
            </div>
            
            <div class="rating-display">
                <div class="rating-item">
                    <span class="rating-label">難易度</span>
                    <span class="rating-stars">${difficultyStars}</span>
                </div>
                <div class="rating-item">
                    <span class="rating-label">満足度</span>
                    <span class="rating-stars">${satisfactionStars}</span>
                </div>
            </div>
            
            <div class="review-comment">
                ${escapeHtml(review.comment)}
            </div>
        </div>
    `;
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
