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

    // 4. 前回の学籍番号とクラス種別を復元
    const savedStudentNum = localStorage.getItem('grade_manager_student_num');
    if (savedStudentNum) {
        document.getElementById('studentNumberInput').value = savedStudentNum;
    }

    const savedClassType = localStorage.getItem('grade_manager_class_type');
    if (savedClassType) {
        state.classType = savedClassType;
        const radioToSelect = document.querySelector(`input[name="classType"][value="${savedClassType}"]`);
        if (radioToSelect) {
            radioToSelect.checked = true;
        }
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
    document.getElementById('yearSelect').addEventListener('change', (e) => { 
        state.year = parseInt(e.target.value); renderTimetable(); 
    });
    document.getElementById('semesterSelect').addEventListener('change', (e) => { 
        state.semester = e.target.value; renderTimetable(); 
    });
    document.querySelectorAll('input[name="classType"]').forEach(r => {
        r.addEventListener('change', (e) => { 
            state.classType = e.target.value;
            localStorage.setItem('grade_manager_class_type', state.classType);
            renderTimetable(); 
        });
    });

    document.getElementById('fileInput').addEventListener('change', handleFileUpload);

    document.getElementById('exportBtn').addEventListener('click', () => {
        if (state.userGrades.length === 0) {
            alert('出力する成績データがありません。');
            return;
        }
        document.getElementById('exportFileInput').click();
    });

    document.getElementById('deleteAllBtn').addEventListener('click', handleDeleteAll);

    document.getElementById('exportFileInput').addEventListener('change', handleExportWithUpload);

    const studentInput = document.getElementById('studentNumberInput');
    const importLabel = document.getElementById('importExcelLabel');

    const updateImportButtonState = () => {
        if (studentInput.value.trim().length > 0) {
            importLabel.classList.remove('disabled');
        } else {
            importLabel.classList.add('disabled');
        }
    };

    studentInput.addEventListener('input', updateImportButtonState);
    setTimeout(updateImportButtonState, 100);
}

function getSemesterValue(semesterStr) {
    if (!semesterStr) return 0;
    const year = parseInt(semesterStr); 
    const isLate = semesterStr.includes('後期');
    return year * 10 + (isLate ? 5 : 0);
}

// --- 時間割描画ロジック ---
function renderTimetable() {
    document.getElementById('timetableTitle').textContent = 
        `${state.year}年 ${state.semester} の時間割 (クラス: ${state.classType})`;

    const tbody = document.getElementById('timetableBody');
    tbody.innerHTML = '';

    const currentViewSemesterStr = `${state.year}年${state.semester}`;
    const currentViewValue = getSemesterValue(currentViewSemesterStr);

    PERIODS.forEach(period => {
        const tr = document.createElement('tr');
        
        const th = document.createElement('td');
        th.textContent = `${period}限`;
        th.style.textAlign = 'center';
        th.style.fontWeight = 'bold';
        th.style.verticalAlign = 'middle';
        th.style.background = '#f3f4f6';
        tr.appendChild(th);

        DAYS.forEach(day => {
            const td = document.createElement('td');
            
            const subjects = state.masterData.filter(m => 
                m.year === state.year &&
                m.semester === state.semester &&
                m.day_of_week === day &&
                m.period === period &&
                (m.class_type === null || m.class_type === state.classType)
            );

            subjects.forEach(subj => {
                const allGradesForSubject = state.userGrades.filter(g => g.subject_name === subj.subject_name);
                const currentGrade = allGradesForSubject.find(g => g.semester === currentViewSemesterStr);
                
                let isRetake = false;
                if (currentGrade) {
                    const hasOlderGrade = allGradesForSubject.some(g => {
                        return g.semester && getSemesterValue(g.semester) < currentViewValue;
                    });
                    if (hasOlderGrade) {
                        isRetake = true;
                    }
                }

                let cardClass = 'master'; 
                if (isRetake) {
                    cardClass = 'retake'; 
                } else if (currentGrade) {
                    cardClass = 'registered'; 
                }

                const card = document.createElement('div');
                card.className = `subject-card ${cardClass}`;
                
                // ★修正点：成績データ(currentGrade)を渡す
                card.onclick = () => openScoreModal(subj, currentGrade);

                let html = `<div style="font-weight:600; margin-bottom:4px;">${subj.subject_name}</div>`;
                
                if (currentGrade && currentGrade.score !== null) {
                    let badgeClass = "score-badge";
                    if (currentGrade.score < 60) {
                        badgeClass += " failed";
                    }
                    html += `<span class="${badgeClass}">${currentGrade.score}点</span>`;
                } else if (currentGrade) {
                    html += `<span class="score-badge" style="background:#aaa;">履修中</span>`;
                }
                
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

function openScoreModal(subjectData, currentGrade) {
    // 1. 科目名を保存・表示（★前回抜けていた部分を追加）
    currentEditingSubject = subjectData.subject_name;
    document.getElementById('modalSubjectName').textContent = subjectData.subject_name;

    // 2. 削除ボタンの表示制御（★エラー回避のため関数の先頭に移動！）
    const deleteBtn = document.getElementById('deleteScoreBtn');
    if (currentGrade) {
        // 成績データが存在するなら表示
        deleteBtn.style.display = 'block';
    } else {
        // 未履修なら非表示
        deleteBtn.style.display = 'none';
    }

    // 3. 点数セット
    // currentGradeがundefinedの場合も考慮して安全に取得
    const currentScore = (currentGrade && currentGrade.score !== null) ? currentGrade.score : null;
    document.getElementById('modalScoreInput').value = currentScore !== null ? currentScore : '';

    // 4. 科目区分 (category) セット
    const categoryEl = document.getElementById('modalCategory');
    categoryEl.textContent = subjectData.category || '指定なし';

    // 5. プログラムタグ (program_tags) セット
    const tagsContainer = document.getElementById('modalTags');
    tagsContainer.innerHTML = ''; 

    try {
        const tags = subjectData.program_tags;
        if (tags && typeof tags === 'object' && Object.keys(tags).length > 0) {
            Object.entries(tags).forEach(([key, val]) => {
                const badge = document.createElement('span');
                badge.className = 'program-badge';
                badge.textContent = `${key} : ${val}`;
                tagsContainer.appendChild(badge);
            });
        } else {
            const noTag = document.createElement('span');
            noTag.className = 'no-tags';
            noTag.textContent = '該当なし';
            tagsContainer.appendChild(noTag);
        }
    } catch (e) {
        console.error("タグ表示エラー:", e);
    }

    // モーダル表示
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
    
    const studentNum = document.getElementById('studentNumberInput').value.trim();

    if (!currentEditingSubject) return;

    // 現在表示中の学期を取得（★重要：これがないと登録が消えます）
    const semesterStr = `${state.year}年${state.semester}`;

    const upsertData = {
        browser_id: CURRENT_BROWSER_ID,
        student_number: studentNum || null,
        subject_name: currentEditingSubject,
        semester: semesterStr, // ★学期情報も保存する
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

// --- 成績削除処理 ---
async function deleteScore() {
    if (!currentEditingSubject) return;

    const isConfirmed = confirm(`「${currentEditingSubject}」の登録情報を削除しますか？\nこの操作は取り消せません。`);
    if (!isConfirmed) return;

    try {
        const { error } = await supabase
            .from('student_grades')
            .delete()
            .eq('browser_id', CURRENT_BROWSER_ID)
            .eq('subject_name', currentEditingSubject);

        if (error) throw error;

        closeScoreModal();
        await fetchUserGrades(); 
        renderTimetable();       
        alert('削除しました。');

    } catch (e) {
        console.error(e);
        alert('削除エラー: ' + e.message);
    }
}

// --- Excelアップロード処理 ---
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const studentNumber = document.getElementById('studentNumberInput').value.trim();
    if (!studentNumber) {
        alert("先に「学籍番号」を入力してください。");
        event.target.value = ""; 
        return;
    }
    localStorage.setItem('grade_manager_student_num', studentNumber);

    try {
        state.rawFileBuffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(state.rawFileBuffer);
        const worksheet = workbook.worksheets[2]; 

        const upsertMap = new Map();

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber < 6) return;

            const nameCell = row.getCell(COL_NAME).value;
            if (!nameCell) return;
            const name = (typeof nameCell === 'object' && nameCell.text) ? nameCell.text.trim() : String(nameCell).trim();

            const scoreVal = row.getCell(COL_SCORE_READ).value;
            let finalScore = null;
            if (scoreVal && typeof scoreVal === 'object' && 'result' in scoreVal) finalScore = scoreVal.result;
            else if (scoreVal !== null) finalScore = scoreVal;

            if (finalScore === null || typeof finalScore !== 'number') return;
            
            finalScore = Math.round(finalScore); 

            let semester = null;
            for (const [colIdx, semName] of Object.entries(SEMESTER_MAP)) {
                if (row.getCell(parseInt(colIdx)).value) {
                    semester = semName;
                    break;
                }
            }
            if (!semester) return; 

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
            alert(`${upsertData.length}件の成績を保存しました。`);
        } else {
            alert('点数が入力されている科目が見つかりませんでした。');
        }

    } catch (e) {
        console.error(e);
        alert('読み込みエラー: ' + e.message);
    }
}

// --- Excel出力処理（ファイル選択版） ---
async function handleExportWithUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);
        
        const worksheet = workbook.worksheets[2]; 

        let updateCount = 0;

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber < 6) return; 

            const nameCell = row.getCell(COL_NAME).value;
            if (!nameCell) return;
            
            const name = (typeof nameCell === 'object' && nameCell.text) 
                ? nameCell.text.trim() 
                : String(nameCell).trim();

            const match = state.userGrades.find(g => g.subject_name === name);

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
        
        const newFileName = file.name.replace('.xlsx', '_updated.xlsx');
        saveAs(blob, newFileName);
        
        alert(`処理完了！\n${updateCount}件の成績を更新して保存しました。`);

    } catch (e) {
        console.error(e);
        alert('エクスポートエラー: ' + e.message);
    } finally {
        event.target.value = '';
    }
}


// --- 全データ削除処理 ---
async function handleDeleteAll() {
    // データがない場合は何もしない
    if (state.userGrades.length === 0) {
        alert("削除するデータがありません。");
        return;
    }

    // 誤操作防止のための2段階確認
    const confirm1 = confirm("【警告】\n登録されている全ての成績データを削除しますか？\nこの操作は元に戻せません。");
    if (!confirm1) return;

    const confirm2 = confirm("本当に削除してよろしいですか？\nExcelファイルなどへのバックアップがない場合、データは完全に失われます。");
    if (!confirm2) return;

    try {
        // Supabaseから、自分のブラウザIDのデータを全て削除
        const { error } = await supabase
            .from('student_grades')
            .delete()
            .eq('browser_id', CURRENT_BROWSER_ID);

        if (error) throw error;

        // 画面側のデータをクリアして再描画
        state.userGrades = [];
        renderTimetable();
        
        alert("全てのデータを削除しました。");

    } catch (e) {
        console.error(e);
        alert('削除エラー: ' + e.message);
    }
}