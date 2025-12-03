// ==========================================
// 成績管理機能 (Excel連携・簡易認証版)
// ==========================================

// 設定: Supabase URL と Key
const SUPABASE_URL = "https://qlsqyymfamslyrzhcggn.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsc3F5eW1mYW1zbHlyemhjZ2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MjA0NDEsImV4cCI6MjA3ODQ5NjQ0MX0._jEWZGK3yDZKy95jPibMFh7c9u3nnJxsIek0UrvRjbQ"; 

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function getBrowserId() {
    let id = localStorage.getItem('grade_manager_user_id');
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('grade_manager_user_id', id);
    }
    return id;
}

const CURRENT_USER_ID = getBrowserId(); 

// --- 定数定義 ---
const COL_NAME = 3; 
const COL_SCORE_READ = 30; 
const TYPE_MAP = { 3: '必修科目', 4: '選択必修科目', 5: '選択科目', 6: '自由科目' };

// プログラム区分の列定義を追加 (ExcelJSは1始まりなので H=8, I=9, J=10, K=11)
const PROGRAM_MAP = { 8: 'PC', 9: 'DE', 10: 'HM', 11: 'NS' };

const SEMESTER_MAP = {
    12: '1年前期', 13: '1年後期', 14: '2年前期', 15: '2年後期',
    16: '3年前期', 17: '3年後期', 18: '4年前期', 19: '4年後期'
};
const SEMESTER_TO_COLUMN = {
    '1年前期': 20, '1年後期': 21, '2年前期': 22, '2年後期': 23,
    '3年前期': 24, '3年後期': 25, '4年前期': 26, '4年後期': 27
};

let rawFileBuffer = null;

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const updateBtn = document.getElementById('updateBtn');
    if (fileInput) fileInput.addEventListener('change', handleFileUpload);
    if (updateBtn) updateBtn.addEventListener('click', handleExportExcel);
});

// --- 1. アップロード & DB保存 ---
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const statusEl = document.getElementById('uploadStatus');
    statusEl.textContent = "処理中...";

    try {
        rawFileBuffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(rawFileBuffer);
        const worksheet = workbook.worksheets[2]; 

        const upsertMap = new Map();

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber < 6) return; 

            // 授業名取得
            const lectureNameCell = row.getCell(COL_NAME).value;
            if (!lectureNameCell) return;
            const lectureName = (typeof lectureNameCell === 'object' && lectureNameCell.text) 
                              ? lectureNameCell.text.trim() : String(lectureNameCell).trim();

            // 単位数チェック
            let credits = null;
            let lectureType = null;
            [4, 5, 6, 7].forEach(colIdx => {
                const val = row.getCell(colIdx).value;
                if (val != null && val !== '') {
                    credits = parseFloat(val);
                    if (colIdx === 4) lectureType = TYPE_MAP[3];
                    else if (colIdx === 5) lectureType = TYPE_MAP[4];
                    else if (colIdx === 6) lectureType = TYPE_MAP[5];
                    else if (colIdx === 7) lectureType = TYPE_MAP[6];
                }
            });

            if (credits === null || isNaN(credits)) return;

            // 学期取得
            let semester = null;
            for (const [colIdx, semName] of Object.entries(SEMESTER_MAP)) {
                if (row.getCell(parseInt(colIdx)).value) {
                    semester = semName;
                    break;
                }
            }

            // 評点取得
            const scoreVal = row.getCell(COL_SCORE_READ).value;
            let finalScore = null;
            if (scoreVal && typeof scoreVal === 'object' && 'result' in scoreVal) {
                finalScore = scoreVal.result;
            } else if (scoreVal !== null) {
                finalScore = scoreVal;
            }
            
            // 点数がない場合は登録しない
            if (finalScore === null || typeof finalScore !== 'number') {
                return; 
            }

            // プログラム区分の読み取り処理を追加
            const programTags = {};
            for (const [colIdx, progName] of Object.entries(PROGRAM_MAP)) {
                const val = row.getCell(parseInt(colIdx)).value;
                // セルに値が入っていれば（例: "○" や "1" など）、タグとして記録
                if (val != null && val !== '') {
                    programTags[progName] = String(val); // { "PC": "○", "NS": "○" } のような形で保存
                }
            }

            // データオブジェクト作成
            const data = {
                user_id: CURRENT_USER_ID, 
                course_name: lectureName,
                semester: semester,
                score: finalScore,
                credits: credits,
                lecture_type: lectureType,
                // ★修正点3: 読み取ったタグを保存（空ならnull）
                program_tags: Object.keys(programTags).length > 0 ? programTags : null,
                updated_at: new Date()
            };

            upsertMap.set(lectureName, data);
        });

        const upsertData = Array.from(upsertMap.values());

        if (upsertData.length === 0) {
            statusEl.textContent = "点数が入力されている科目がありませんでした。";
            return;
        }

        const { error } = await supabase
            .from('user_grades')
            .upsert(upsertData, { onConflict: 'user_id, course_name' });

        if (error) throw error;

        statusEl.textContent = `完了: ${upsertData.length}件のデータを保存しました。`;
        document.getElementById('updateBtn').disabled = false;

    } catch (error) {
        console.error(error);
        statusEl.textContent = "エラーが発生しました";
        alert("処理エラー: " + error.message);
    }
}

// --- 2. エクスポート ---
async function handleExportExcel() {
    if (!rawFileBuffer) return alert("テンプレートファイルが必要です");

    try {
        const { data: grades, error } = await supabase
            .from('user_grades')
            .select('*')
            .eq('user_id', CURRENT_USER_ID);

        if (error) throw error;

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(rawFileBuffer);
        const worksheet = workbook.worksheets[2];

        let updateCount = 0;

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber < 6) return;

            const lectureNameCell = row.getCell(COL_NAME).value;
            if (!lectureNameCell) return;
            const lectureName = (typeof lectureNameCell === 'object' && lectureNameCell.text) 
                              ? lectureNameCell.text.trim() : String(lectureNameCell).trim();

            const match = grades.find(g => g.course_name === lectureName);

            if (match && match.semester) {
                const colIndex = SEMESTER_TO_COLUMN[match.semester];
                if (colIndex) {
                    const cell = row.getCell(colIndex);
                    cell.value = match.score !== null ? match.score : null;
                    updateCount++;
                }
            }
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, "updated_grades.xlsx");
        
        alert(`ダウンロード完了（${updateCount}件更新）`);

    } catch (error) {
        console.error(error);
        alert("エクスポートエラー: " + error.message);
    }
}

// --- データを全削除する関数 ---
async function handleDeleteAllData() {
    if (!confirm("本当に全ての成績データを削除しますか？\n（この操作は取り消せません）")) {
        return;
    }

    try {
        const { error } = await supabase
            .from('user_grades')
            .delete()
            .eq('user_id', CURRENT_USER_ID); // 自分のブラウザIDのデータだけ消す

        if (error) throw error;

        alert("データを削除しました。");
        // 画面をリロードしてリセット
        window.location.reload();

    } catch (error) {
        console.error(error);
        alert("削除エラー: " + error.message);
    }
}