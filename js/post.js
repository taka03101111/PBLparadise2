// ====================================
// 投稿ページの機能
// ====================================

let selectedFile = null;

document.addEventListener('DOMContentLoaded', function() {
    initPostPage();
});

/**
 * 投稿ページの初期化
 */
function initPostPage() {
    const form = document.getElementById('postForm');
    const fileInput = document.getElementById('fileInput');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const filePreview = document.getElementById('filePreview');
    
    // フォーム送信
    form.addEventListener('submit', handleSubmit);
    
    // ファイル選択
    fileInput.addEventListener('change', handleFileSelect);
    
    // ドラッグ＆ドロップ
    fileUploadArea.addEventListener('dragover', handleDragOver);
    fileUploadArea.addEventListener('dragleave', handleDragLeave);
    fileUploadArea.addEventListener('drop', handleDrop);
}

/**
 * フォーム送信処理
 * @param {Event} e - イベントオブジェクト
 */
async function handleSubmit(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const grade = document.getElementById('grade').value;
    const comment = document.getElementById('comment').value.trim();
    
    // バリデーション
    if (!username) {
        window.RishuApp.showNotification('投稿者名を入力してください', 'error');
        return;
    }
    
    if (!grade) {
        window.RishuApp.showNotification('学年を選択してください', 'error');
        return;
    }
    
    if (!selectedFile) {
        window.RishuApp.showNotification('ファイルを選択してください', 'error');
        return;
    }
    
    // ファイルサイズチェック（10MB）
    if (selectedFile.size > 10 * 1024 * 1024) {
        window.RishuApp.showNotification('ファイルサイズが大きすぎます（最大10MB）', 'error');
        return;
    }
    
    try {
        // ローディング表示
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 投稿中...';
        
        // ファイルをBase64に変換
        const fileData = await window.RishuApp.fileToBase64(selectedFile);
        
        // 投稿データを作成
        const post = {
            username,
            grade,
            comment: comment || '（コメントなし）',
            file: fileData,
            fileName: selectedFile.name,
            fileType: selectedFile.type
        };
        
        // 投稿を保存
        window.RishuApp.addPost(post);
        
        // 成功通知
        window.RishuApp.showNotification('投稿が完了しました！', 'success');
        
        // 少し待ってから閲覧ページへリダイレクト
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        console.error('投稿エラー:', error);
        window.RishuApp.showNotification('投稿に失敗しました', 'error');
        
        // ボタンを元に戻す
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 投稿する';
    }
}

/**
 * ファイル選択処理
 * @param {Event} e - イベントオブジェクト
 */
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

/**
 * ドラッグオーバー処理
 * @param {Event} e - イベントオブジェクト
 */
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

/**
 * ドラッグリーブ処理
 * @param {Event} e - イベントオブジェクト
 */
function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
}

/**
 * ドロップ処理
 * @param {Event} e - イベントオブジェクト
 */
function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        
        // ファイルタイプチェック
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            window.RishuApp.showNotification('対応していないファイル形式です', 'error');
            return;
        }
        
        processFile(file);
        
        // input要素にもファイルをセット
        const fileInput = document.getElementById('fileInput');
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
    }
}

/**
 * ファイルを処理してプレビューを表示
 * @param {File} file - ファイルオブジェクト
 */
async function processFile(file) {
    selectedFile = file;
    const filePreview = document.getElementById('filePreview');
    
    try {
        const fileData = await window.RishuApp.fileToBase64(file);
        const fileType = window.RishuApp.getFileType(fileData);
        
        let previewHTML = '';
        
        if (fileType === 'image') {
            previewHTML = `
                <div class="file-preview-container">
                    <img src="${fileData}" alt="プレビュー">
                    <button type="button" class="remove-file" onclick="removeFile()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <p class="file-info mt-1">
                    <i class="fas fa-file-image"></i>
                    ${file.name} (${window.RishuApp.formatFileSize(file.size)})
                </p>
            `;
        } else {
            previewHTML = `
                <div class="file-preview-container pdf-preview">
                    <i class="fas fa-file-pdf"></i>
                    <p><strong>${file.name}</strong></p>
                    <p>${window.RishuApp.formatFileSize(file.size)}</p>
                    <button type="button" class="remove-file" onclick="removeFile()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }
        
        filePreview.innerHTML = previewHTML;
        filePreview.classList.add('show');
        
    } catch (error) {
        console.error('ファイル処理エラー:', error);
        window.RishuApp.showNotification('ファイルの読み込みに失敗しました', 'error');
    }
}

/**
 * ファイル選択を解除
 */
function removeFile() {
    selectedFile = null;
    const fileInput = document.getElementById('fileInput');
    const filePreview = document.getElementById('filePreview');
    
    fileInput.value = '';
    filePreview.innerHTML = '';
    filePreview.classList.remove('show');
    
    window.RishuApp.showNotification('ファイルを削除しました', 'info');
}

// グローバルスコープに関数を公開
window.removeFile = removeFile;
