// ==========================================
// 履修登録・成績管理 (Excel連携 & マスターデータ版)
// ==========================================

const SUPABASE_URL = "https://qlsqyymfamslyrzhcggn.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsc3F5eW1mYW1zbHlyemhjZ2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MjA0NDEsImV4cCI6MjA3ODQ5NjQ0MX0._jEWZGK3yDZKy95jPibMFh7c9u3nnJxsIek0UrvRjbQ"; 

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ブラウザID (ローカルストレージで管理)
function getBrowserId() {
    let id = localStorage.getItem('grade_manager_user_id');
    if (!id) { id = crypto.randomUUID(); localStorage.setItem('grade_manager_user_id', id); }
    return id;
}
const CURRENT_BROWSER_ID = getBrowserId();

// 定数定義
const DAYS = ['月曜', '火曜', '水曜', '木曜', '金曜'];
const PERIODS = [1, 2, 3, 4, 5, 6];
const COL_NAME = 3;       // Excelの科目名列 (C列)
const COL_SCORE_READ = 30; // Excelの点数列 (AD列)
const SEMESTER_TO_COLUMN = {
    '1年前期': 20, '1年後期': 21, '2年前期': 22, '2年後期': 23,
    '3年前期': 24, '3年後期': 25, '4年前期': 26, '4年後期': 27
};
const SEMESTER_MAP = {
    12: '1年前期', 13: '1年後期', 14: '2年前期', 15: '2年後期',
    16: '3年前期', 17: '3年後期', 18: '4年前期', 19: '4年後期'
};

// アプリケーションの状態
let state = {
    year: 2,
    semester: '前期',
    classType: 'A',
    masterData: [], // subject_masterテーブルの全データ
    userGrades: [], // student_gradesテーブルの自分のデータ
    rawFileBuffer: null
};

// --- 初期化 ---
document.addEventListener('DOMContentLoaded', async () => {
    // 1. マスターデータをロード
    await fetchMasterData();
    
    // 2. ユーザーの成績をロード
    await fetchUserGrades();

    // 3. イベントリスナー設定
    setupEventListeners();

    // 4. 学籍番号の復元（あれば）
    const savedStudentNum = localStorage.getItem('grade_manager_student_num');
    if (savedStudentNum) {
        document.getElementById('studentNumberInput').value = savedStudentNum;
    }

    // 5. 描画
    renderTimetable();
});

// --- データ取得 ---
async function fetchMasterData() {
    const { data, error } = await supabase.from('subject_master').select('*');
    if (error) console.error('マスター取得エラー:', error);
    else state.masterData = data || [];
}

async function fetchUserGrades() {
    const { data, error } = await supabase
        .from('student_grades')
        .select('*')
        .eq('browser_id', CURRENT_BROWSER_ID);
    
    if (error) console.error('成績取得エラー:', error);
    else state.userGrades = data || [];
}

// --- イベントリスナー ---
function setupEventListeners() {
    // 表示条件の変更
    document.getElementById('yearSelect').addEventListener('change', (e) => { 
        state.year = parseInt(e.target.value); renderTimetable(); 
    });
    document.getElementById('semesterSelect').addEventListener('change', (e) => { 
        state.semester = e.target.value; renderTimetable(); 
    });
    document.querySelectorAll('input[name="classType"]').forEach(r => {
        r.addEventListener('change', (e) => { 
            state.classType = e.target.value; renderTimetable(); 
        });
    });

    // 1. ファイル読み込み（インポート用）
    document.getElementById('fileInput').addEventListener('change', handleFileUpload);

    // 2. Excel出力ボタンが押されたら、隠しファイル入力をクリックさせる
    document.getElementById('exportBtn').addEventListener('click', () => {
        // ※データがなくても出力したいケースがあるかもしれないのでチェックは任意ですが、
        // 親切にするなら警告を出しても良いです
        if (state.userGrades.length === 0) {
            alert('出力する成績データがありません。');
            return;
        }
        document.getElementById('exportFileInput').click();
    });

    // 3. 出力用ファイルが選択されたら、書き込み処理を実行
    document.getElementById('exportFileInput').addEventListener('change', handleExportWithUpload);

    const studentInput = document.getElementById('studentNumberInput');
    const importLabel = document.getElementById('importExcelLabel');

        // ボタンの有効/無効を切り替える関数
    const updateImportButtonState = () => {
        if (studentInput.value.trim().length > 0) {
            // 入力があれば disabled クラスを外す（押せるようになる）
            importLabel.classList.remove('disabled');
        } else {
            // 空なら disabled クラスを付ける（押せなくなる）
            importLabel.classList.add('disabled');
        }
    };

    // 学籍番号に入力があるたびにチェックを実行
    studentInput.addEventListener('input', updateImportButtonState);

    // ページ読み込み時に一度チェック（前回入力した番号が復元される場合があるため）
    // 少し遅延させないと、localStorageからの復元より先に走ってしまうことがあるため注意
    setTimeout(updateImportButtonState, 100);
}

// 学期を数値化して比較できるようにするヘルパー関数
// 例: "1年前期" -> 10, "1年後期" -> 15, "2年前期" -> 20 ...
function getSemesterValue(semesterStr) {
    if (!semesterStr) return 0;
    const year = parseInt(semesterStr); // "1年..." -> 1
    const isLate = semesterStr.includes('後期');
    return year * 10 + (isLate ? 5 : 0);
}

// --- 時間割描画ロジック ---
function renderTimetable() {
    // タイトル更新
    document.getElementById('timetableTitle').textContent = 
        `${state.year}年 ${state.semester} の時間割 (クラス: ${state.classType})`;

    const tbody = document.getElementById('timetableBody');
    tbody.innerHTML = '';

    // 現在表示している学期の数値（比較用）
    const currentViewSemesterStr = `${state.year}年${state.semester}`;
    const currentViewValue = getSemesterValue(currentViewSemesterStr);

    PERIODS.forEach(period => {
        const tr = document.createElement('tr');
        
        // 左端：時限
        const th = document.createElement('td');
        th.textContent = `${period}限`;
        th.style.textAlign = 'center';
        th.style.fontWeight = 'bold';
        th.style.verticalAlign = 'middle';
        th.style.background = '#f3f4f6';
        tr.appendChild(th);

        // 各曜日
        DAYS.forEach(day => {
            const td = document.createElement('td');
            
            // このマスに表示すべき科目を抽出 (マスターデータから)
            const subjects = state.masterData.filter(m => 
                m.year === state.year &&
                m.semester === state.semester &&
                m.day_of_week === day &&
                m.period === period &&
                (m.class_type === null || m.class_type === state.classType)
            );

            subjects.forEach(subj => {
                // 1. この科目の全成績データを抽出（過去の履歴含む）
                const allGradesForSubject = state.userGrades.filter(g => g.subject_name === subj.subject_name);

                // 2. 「現在の学期」に該当する成績を探す
                const currentGrade = allGradesForSubject.find(g => g.semester === currentViewSemesterStr);
                
                // 3. 再履修チェック:
                // 「現在の学期」のデータがあり、かつ「それより過去」のデータも存在する場合
                let isRetake = false;
                if (currentGrade) {
                    const hasOlderGrade = allGradesForSubject.some(g => {
                        // 学期情報があり、かつ現在の学期より数値が小さい（過去である）
                        return g.semester && getSemesterValue(g.semester) < currentViewValue;
                    });
                    if (hasOlderGrade) {
                        isRetake = true;
                    }
                }

                // クラス名の決定
                let cardClass = 'master'; // デフォルト（未履修）
                if (isRetake) {
                    cardClass = 'retake'; // 再履修（黄色）
                } else if (currentGrade) {
                    cardClass = 'registered'; // 通常履修（青）
                }

                // カード作成
                const card = document.createElement('div');
                card.className = `subject-card ${cardClass}`;
                
                // クリックで編集モーダルへ
                card.onclick = () => openScoreModal(subj.subject_name, currentGrade ? currentGrade.score : null);

                // カードの中身
                let html = `<div style="font-weight:600; margin-bottom:4px;">${subj.subject_name}</div>`;
                
                if (currentGrade && currentGrade.score !== null) {
                    html += `<span class="score-badge">${currentGrade.score}点</span>`;
                } else if (currentGrade) {
                    html += `<span class="score-badge" style="background:#aaa;">履修中</span>`;
                }
                
                // 再履修マークを付ける場合（お好みで）
                if (isRetake) {
                    html += `<span style="font-size:0.7rem; color:#d97706; font-weight:bold; position:absolute; bottom:5px; left:5px;">再履修</span>`;
                }
                
                card.innerHTML = html;
                td.appendChild(card);
            });

            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

// --- 点数編集モーダル ---
let currentEditingSubject = null;

function openScoreModal(subjectName, currentScore) {
    currentEditingSubject = subjectName;
    document.getElementById('modalSubjectName').textContent = subjectName;
    document.getElementById('modalScoreInput').value = currentScore !== null ? currentScore : '';
    document.getElementById('scoreModal').classList.add('active');
}

function closeScoreModal() {
    document.getElementById('scoreModal').classList.remove('active');
    currentEditingSubject = null;
}

// モーダルでの保存処理
async function saveScore() {
    const scoreVal = document.getElementById('modalScoreInput').value;
    const score = scoreVal === '' ? null : parseInt(scoreVal);
    
    // 学籍番号の取得
    const studentNum = document.getElementById('studentNumberInput').value.trim();

    if (!currentEditingSubject) return;

    // データ構築
    const upsertData = {
        browser_id: CURRENT_BROWSER_ID,
        student_number: studentNum || null, // 手動入力時もあれば保存
        subject_name: currentEditingSubject,
        score: score,
        updated_at: new Date()
    };

    const { error } = await supabase
        .from('student_grades')
        .upsert(upsertData, { onConflict: 'browser_id, subject_name' });

    if (error) {
        alert('保存エラー: ' + error.message);
    } else {
        closeScoreModal();
        await fetchUserGrades(); // 再取得
        renderTimetable();       // 再描画
    }
}

// --- Excelアップロード処理 ---
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 学籍番号チェック
    const studentNumber = document.getElementById('studentNumberInput').value.trim();
    if (!studentNumber) {
        alert("先に「学籍番号」を入力してください。");
        event.target.value = ""; 
        return;
    }
    // 学籍番号を記憶
    localStorage.setItem('grade_manager_student_num', studentNumber);

    try {
        state.rawFileBuffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(state.rawFileBuffer);
        const worksheet = workbook.worksheets[2]; // 3枚目

        // 重複除去用のMap
        const upsertMap = new Map();

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber < 6) return;

            // 授業名
            const nameCell = row.getCell(COL_NAME).value;
            if (!nameCell) return;
            const name = (typeof nameCell === 'object' && nameCell.text) ? nameCell.text.trim() : String(nameCell).trim();

            // 点数
            const scoreVal = row.getCell(COL_SCORE_READ).value;
            let finalScore = null;
            if (scoreVal && typeof scoreVal === 'object' && 'result' in scoreVal) finalScore = scoreVal.result;
            else if (scoreVal !== null) finalScore = scoreVal;

            // 点数がなければスキップ
            if (finalScore === null || typeof finalScore !== 'number') return;
            
            finalScore = Math.round(finalScore); 

            // 学期の取得（エクセルから）
            let semester = null;
            for (const [colIdx, semName] of Object.entries(SEMESTER_MAP)) {
                if (row.getCell(parseInt(colIdx)).value) {
                    semester = semName;
                    break;
                }
            }
            if (!semester) {
                return; 
            }

            upsertMap.set(name, {
                browser_id: CURRENT_BROWSER_ID,
                student_number: studentNumber,
                subject_name: name,
                semester: semester,
                score: finalScore,
                updated_at: new Date()
            });
        });

        const upsertData = Array.from(upsertMap.values());

        if (upsertData.length > 0) {
            const { error } = await supabase
                .from('student_grades')
                .upsert(upsertData, { onConflict: 'browser_id, subject_name' });

            if (error) throw error;

            await fetchUserGrades();
            renderTimetable();
            document.getElementById('exportBtn').disabled = false;
            alert(`${upsertData.length}件の成績を保存しました。`);
        } else {
            alert('点数が入力されている科目が見つかりませんでした。');
        }

    } catch (e) {
        console.error(e);
        alert('読み込みエラー: ' + e.message);
    }
}

// --- Excelダウンロード処理 ---
async function handleExportWithUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        // 1. 選択されたファイルを読み込む
        const arrayBuffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);
        
        // 3シート目を取得（インデックス2）
        const worksheet = workbook.worksheets[2]; 

        let updateCount = 0;

        // 2. 行を走査してデータを書き込む
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber < 6) return; // ヘッダーなどはスキップ

            // C列（3列目）の科目名を取得
            const nameCell = row.getCell(COL_NAME).value;
            if (!nameCell) return;
            
            // ExcelJSのセル値がオブジェクトの場合の対応
            const name = (typeof nameCell === 'object' && nameCell.text) 
                ? nameCell.text.trim() 
                : String(nameCell).trim();

            // DB上のデータ（state.userGrades）から科目名で検索
            const match = state.userGrades.find(g => g.subject_name === name);

            // データが見つかり、かつ学期情報がある場合のみ更新
            if (match && match.semester) {
                const colIndex = SEMESTER_TO_COLUMN[match.semester];
                if (colIndex) {
                    const cell = row.getCell(colIndex);
                    
                    // 点数をセット（nullなら空にする）
                    cell.value = match.score !== null ? match.score : null;
                    
                    // 必要に応じてスタイル調整（任意）
                    // cell.alignment = { horizontal: 'center' }; 
                    
                    updateCount++;
                }
            }
        });

        // 3. 書き換えたファイルをダウンロード
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        
        // ファイル名は元のファイル名に "_updated" をつけたものにする
        const newFileName = file.name.replace('.xlsx', '_updated.xlsx');
        saveAs(blob, newFileName);
        
        alert(`処理完了！\n${updateCount}件の成績を更新して保存しました。`);

    } catch (e) {
        console.error(e);
        alert('エクスポートエラー: ' + e.message);
    } finally {
        // 同じファイルを再度選べるように入力をリセット
        event.target.value = '';
    }
}