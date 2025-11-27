// ====================================
// 投稿ページの機能 (Supabase対応版)
// ====================================

// SupabaseクライアントはHTML（post.html）で定義されている（const supabase = ...）と仮定します。
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
 * フォーム送信処理 (Supabase対応)
 * @param {Event} e - イベントオブジェクト
 */
async function handleSubmit(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const grade = document.getElementById('grade').value;
    const comment = document.getElementById('comment').value.trim();
    
    // バリデーション
    if (!username) {
        alert("投稿者名を入力してください");
        return;
    }
    
    if (!grade) {
        alert("学年を選択してください");
        return;
    }
    
    if (!selectedFile) {
        alert("ファイルを選択してください");
        return;
    }
    
    // ファイルサイズチェック（10MB）
    if (selectedFile.size > 10 * 1024 * 1024) {
        alert('ファイルサイズが大きすぎます（最大10MB）');
        return;
    }
    
    // ローディング表示
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 投稿中...';
    
    try {
        
        // ファイル保存用のユニークなパス
        const filePath = `${Date.now()}_${selectedFile.name}`;

        // ① Storage にファイルをアップロード
        const { data: fileData, error: fileError } = await supabase
            .storage
            .from("rishu-files")
            .upload(filePath, selectedFile); // selectedFileを使用

        if (fileError) {
            console.error("Storage Upload Error:", fileError);
            throw new Error(`ファイルのアップロードに失敗しました: ${fileError.message}`);
        }

        // 公開URLを生成（URLはpost.htmlで定義されたSUPABASE_URLを元にしています）
        // URLのベースが「https://qlsqyymfamslyrzhcggn.supabase.co」であることを前提としています
        const fileUrl = `https://qlsqyymfamslyrzhcggn.supabase.co/storage/v1/object/public/rishu-files/${filePath}`;

        // ② Database に投稿データを保存
        const { data, error: dbError } = await supabase
            .from("posts")
            .insert([
                {
                    username: username,
                    grade: grade,
                    comment: comment,
                    file_url: fileUrl,
                    created_at: new Date().toISOString()
                }
            ]);

        if (dbError) {
            console.error("DB Insert Error:", dbError);
            throw new Error(`投稿の保存に失敗しました: ${dbError.message}`);
        }

        // 成功通知とリダイレクト
        alert("投稿が完了しました！");
        // post.htmlでindex.htmlへのリダイレクトが設定されていたため、今回はshared-courses.htmlへリダイレクトします
        window.location.href = "shared-courses.html"; 
        
    } catch (error) {
        console.error('投稿エラー:', error);
        alert('投稿に失敗しました。\n詳細: ' + error.message);
        
    } finally {
        // ボタンを元に戻す
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
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
            alert('対応していないファイル形式です');
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
        // Base64変換はSupabase投稿に不要なため、URL.createObjectURLでプレビューを生成
        const fileURL = URL.createObjectURL(file);
        
        let previewHTML = '';
        
        if (file.type.startsWith('image/')) {
            previewHTML = `
                <div class="file-preview-container">
                    <img src="${fileURL}" alt="プレビュー">
                    <button type="button" class="remove-file" onclick="removeFile()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <p class="file-info mt-1">
                    <i class="fas fa-file-image"></i>
                    ${file.name} (${formatFileSize(file.size)})
                </p>
            `;
        } else if (file.type === 'application/pdf') {
            previewHTML = `
                <div class="file-preview-container pdf-preview">
                    <i class="fas fa-file-pdf"></i>
                    <p><strong>${file.name}</strong></p>
                    <p>${formatFileSize(file.size)}</p>
                    <button type="button" class="remove-file" onclick="removeFile()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        } else {
             previewHTML = `
                <div class="file-preview-container other-file">
                    <i class="fas fa-file"></i>
                    <p><strong>${file.name}</strong></p>
                    <p>${formatFileSize(file.size)}</p>
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
        alert('ファイルの読み込みに失敗しました');
    }
}

/**
 * ファイル選択を解除
 */
function removeFile() {
    // 既存のオブジェクトURLがあれば解放
    if (selectedFile && selectedFile.fileURL) {
        URL.revokeObjectURL(selectedFile.fileURL);
    }
    
    selectedFile = null;
    const fileInput = document.getElementById('fileInput');
    const filePreview = document.getElementById('filePreview');
    
    fileInput.value = '';
    filePreview.innerHTML = '';
    filePreview.classList.remove('show');
    
    alert('ファイルを削除しました');
}

// プレビュー表示に必要なユーティリティ関数
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// post.jsの古いロジックで使われていた未定義のグローバルオブジェクトの簡易的な代替
if (typeof window.RishuApp === 'undefined') {
    window.RishuApp = {
        showNotification: (message, type) => {
            console.log(`Notification (${type}): ${message}`);
        },
        fileToBase64: async (file) => {
            throw new Error("Base64変換関数はSupabase投稿では使用しません");
        },
        getFileType: (data) => {
             return data.startsWith('data:image/') ? 'image' : 'other';
        },
        formatFileSize: formatFileSize
    };
}