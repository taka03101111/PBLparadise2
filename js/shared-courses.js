// ============================================
// 投稿一覧ページのJavaScript (Supabase対応版)
// ============================================

// ★ 古いレビュー、フィルタリング、並び替えのロジックは全て削除し、Supabaseから投稿を取得・表示する機能のみを残しています。

// ページ読み込み時の初期化
document.addEventListener("DOMContentLoaded", loadPosts);


// 投稿データの読み込み
async function loadPosts() {

    // SupabaseクライアントはHTMLで定義されている（const supabase = ...）と仮定します。
    const { data: posts, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

    const container = document.getElementById("postsContainer");
    container.innerHTML = ""; // コンテナをクリア

    if (error) {
        console.error("DB Load Error:", error);
        container.innerHTML = "<p>データの取得に失敗しました。</p>";
        return;
    }

    if (!posts || posts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>まだ投稿がありません</p>
                <a href="post.html" class="btn btn-primary">最初の投稿をする</a>
            </div>
        `;
        return;
    }
    
    // 投稿一覧の表示
    const postsHtml = posts.map(p => {
        // 画像とPDFのプレビューを分ける
        let fileContent = '';
        const fileUrl = p.file_url || '';

        if (fileUrl.match(/\.(jpeg|jpg|png|gif|webp)$/i)) {
            fileContent = `<img src="${fileUrl}" class="post-image editable-size" alt="投稿画像">`;

        } else if (fileUrl.match(/\.pdf$/i)) {
             // PDFファイル
             fileContent = `<div class="post-file-preview pdf-preview">
                                <i class="fas fa-file-pdf"></i>
                                <a href="${fileUrl}" target="_blank">PDFファイルを開く</a>
                            </div>`;
        } else if (fileUrl) {
             // その他のファイル
             fileContent = `<div class="post-file-preview other-file">
                                <i class="fas fa-file"></i>
                                <a href="${fileUrl}" target="_blank">ファイルを開く</a>
                            </div>`;
        }

        // コメントがNULLまたは空文字列の場合は空文字列を表示
        const comment = p.comment ? escapeHtml(p.comment) : '';

        return `
            <div class="post-card">
                <div class="post-header">
                    <h3>${escapeHtml(p.username)}（${escapeHtml(p.grade)}）</h3>
                    <small>${new Date(p.created_at).toLocaleString('ja-JP')}</small>
                </div>
                <div class="post-content">
                    ${fileContent}
                    <p class="post-comment">${comment}</p>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = postsHtml;
}


// HTMLエスケープ（shared-courses.jsの元々のヘルパー関数を利用）
function escapeHtml(text) {
    if (text === null || typeof text === 'undefined') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}