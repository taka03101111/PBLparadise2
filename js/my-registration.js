// ============================================
// 履修登録ページのJavaScript
// ============================================

// グローバル変数
let myCourses = [];
let currentSemester = '前期';

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    loadCourses();
    setupEventListeners();
});

// イベントリスナーの設定
function setupEventListeners() {
    // 学期選択
    document.getElementById('semesterSelect').addEventListener('change', function() {
        currentSemester = this.value;
        updateTimetable();
        updateCourseList();
        updateCredits();
    });
    
    // 科目追加フォーム
    document.getElementById('addCourseForm').addEventListener('submit', handleAddCourse);
}

// 科目データの読み込み
async function loadCourses() {
    try {
        const response = await fetch('tables/my_courses?limit=100');
        const data = await response.json();
        myCourses = data.data || [];
        updateTimetable();
        updateCourseList();
        updateCredits();
    } catch (error) {
        console.error('科目の読み込みエラー:', error);
        showMessage('科目の読み込みに失敗しました。', 'error');
    }
}

// モーダルを開く
function openCourseModal(day, period) {
    document.getElementById('modalDay').value = day;
    document.getElementById('modalPeriod').value = period;
    document.getElementById('modalSemester').value = currentSemester;
    document.getElementById('courseModal').classList.add('active');
}

// モーダルを閉じる
function closeCourseModal() {
    document.getElementById('courseModal').classList.remove('active');
    document.getElementById('addCourseForm').reset();
}

// 科目追加処理
async function handleAddCourse(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const courseData = {
        course_name: formData.get('courseName'),
        instructor: formData.get('instructor'),
        day_of_week: formData.get('day'),
        period: parseInt(formData.get('period')),
        semester: formData.get('semester'),
        category: formData.get('category'),
        credits: parseInt(formData.get('credits')),
        room: formData.get('room') || ''
    };
    
    // 重複チェック
    const duplicate = myCourses.find(course => 
        course.day_of_week === courseData.day_of_week && 
        course.period === courseData.period &&
        course.semester === courseData.semester
    );
    
    if (duplicate) {
        showMessage('その時限にはすでに科目が登録されています。', 'error');
        return;
    }
    
    try {
        const response = await fetch('tables/my_courses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(courseData)
        });
        
        if (response.ok) {
            showMessage('科目を追加しました!', 'success');
            closeCourseModal();
            loadCourses();
        } else {
            throw new Error('追加に失敗しました');
        }
    } catch (error) {
        console.error('追加エラー:', error);
        showMessage('科目の追加に失敗しました。', 'error');
    }
}

// 科目削除処理
async function deleteCourse(courseId) {
    if (!confirm('この科目を削除してもよろしいですか?')) {
        return;
    }
    
    try {
        const response = await fetch(`tables/my_courses/${courseId}`, {
            method: 'DELETE'
        });
        
        if (response.ok || response.status === 204) {
            showMessage('科目を削除しました。', 'success');
            loadCourses();
        } else {
            throw new Error('削除に失敗しました');
        }
    } catch (error) {
        console.error('削除エラー:', error);
        showMessage('科目の削除に失敗しました。', 'error');
    }
}

// 時間割表の更新
function updateTimetable() {
    const days = ['月', '火', '水', '木', '金'];
    const periods = [1, 2, 3, 4, 5];
    
    // 現在の学期の科目のみフィルタリング
    const semesterCourses = myCourses.filter(course => 
        course.semester === currentSemester || course.semester === '通年'
    );
    
    // 各セルをリセット
    days.forEach(day => {
        periods.forEach(period => {
            const cell = document.querySelector(`td.course-cell[data-day="${day}"][data-period="${period}"]`);
            if (cell) {
                const course = semesterCourses.find(c => 
                    c.day_of_week === day && c.period === period
                );
                
                if (course) {
                    cell.innerHTML = createCourseItem(course);
                } else {
                    cell.innerHTML = `
                        <button class="add-course-btn" onclick="openCourseModal('${day}', ${period})">
                            <i class="fas fa-plus"></i> 科目を追加
                        </button>
                    `;
                }
            }
        });
    });
}

// 科目アイテムのHTML作成
function createCourseItem(course) {
    let badgeClass = '';
    let badgeText = course.category;
    
    if (course.category === '必修') {
        badgeClass = 'required';
    } else if (course.category === '選択必修') {
        badgeClass = 'elective-required';
    }
    
    return `
        <div class="course-item">
            <button class="delete-course-btn" onclick="deleteCourse('${course.id}')">
                <i class="fas fa-times"></i>
            </button>
            <div class="course-item-name">${escapeHtml(course.course_name)}</div>
            <div class="course-item-instructor">
                <i class="fas fa-user"></i> ${escapeHtml(course.instructor)}
            </div>
            ${course.room ? `<div class="course-item-room"><i class="fas fa-door-open"></i> ${escapeHtml(course.room)}</div>` : ''}
            <span class="course-item-badge ${badgeClass}">${badgeText} ${course.credits}単位</span>
        </div>
    `;
}

// 科目一覧の更新
function updateCourseList() {
    const courseList = document.getElementById('courseList');
    
    // 現在の学期の科目のみフィルタリング
    const semesterCourses = myCourses.filter(course => 
        course.semester === currentSemester || course.semester === '通年'
    );
    
    if (semesterCourses.length === 0) {
        courseList.innerHTML = '<p class="empty-message">まだ科目が登録されていません。</p>';
        return;
    }
    
    // 科目区分ごとにグループ化
    const required = semesterCourses.filter(c => c.category === '必修');
    const electiveRequired = semesterCourses.filter(c => c.category === '選択必修');
    const elective = semesterCourses.filter(c => c.category === '選択');
    
    let html = '';
    
    if (required.length > 0) {
        html += '<h4 style="color: #ef4444; margin-bottom: 1rem;"><i class="fas fa-star"></i> 必修科目</h4>';
        html += '<div class="course-list" style="margin-bottom: 2rem;">';
        html += required.map(course => createCourseListItem(course)).join('');
        html += '</div>';
    }
    
    if (electiveRequired.length > 0) {
        html += '<h4 style="color: #f59e0b; margin-bottom: 1rem;"><i class="fas fa-star-half-alt"></i> 選択必修科目</h4>';
        html += '<div class="course-list" style="margin-bottom: 2rem;">';
        html += electiveRequired.map(course => createCourseListItem(course)).join('');
        html += '</div>';
    }
    
    if (elective.length > 0) {
        html += '<h4 style="color: #10b981; margin-bottom: 1rem;"><i class="fas fa-check-circle"></i> 選択科目</h4>';
        html += '<div class="course-list">';
        html += elective.map(course => createCourseListItem(course)).join('');
        html += '</div>';
    }
    
    courseList.innerHTML = html;
}

// 科目一覧アイテムのHTML作成
function createCourseListItem(course) {
    const days = { '月': '月曜', '火': '火曜', '水': '水曜', '木': '木曜', '金': '金曜' };
    
    return `
        <div class="course-list-item">
            <div class="course-list-name">${escapeHtml(course.course_name)}</div>
            <div class="course-list-details">
                <div><i class="fas fa-chalkboard-teacher"></i> 教員: ${escapeHtml(course.instructor)}</div>
                <div><i class="fas fa-calendar-alt"></i> ${days[course.day_of_week]}日 ${course.period}限</div>
                <div><i class="fas fa-certificate"></i> ${course.credits}単位 (${course.category})</div>
                ${course.room ? `<div><i class="fas fa-door-open"></i> 教室: ${escapeHtml(course.room)}</div>` : ''}
            </div>
        </div>
    `;
}

// 単位数の更新
function updateCredits() {
    // 現在の学期の科目のみフィルタリング
    const semesterCourses = myCourses.filter(course => 
        course.semester === currentSemester || course.semester === '通年'
    );
    
    const totalCredits = semesterCourses.reduce((sum, course) => sum + course.credits, 0);
    const requiredCredits = semesterCourses
        .filter(c => c.category === '必修')
        .reduce((sum, course) => sum + course.credits, 0);
    const electiveRequiredCredits = semesterCourses
        .filter(c => c.category === '選択必修')
        .reduce((sum, course) => sum + course.credits, 0);
    const electiveCredits = semesterCourses
        .filter(c => c.category === '選択')
        .reduce((sum, course) => sum + course.credits, 0);
    
    document.getElementById('totalCredits').textContent = totalCredits;
    document.getElementById('requiredCredits').textContent = requiredCredits;
    document.getElementById('electiveRequiredCredits').textContent = electiveRequiredCredits;
    document.getElementById('electiveCredits').textContent = electiveCredits;
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
    const modal = document.getElementById('courseModal');
    if (e.target === modal) {
        closeCourseModal();
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
async function uploadCsv() {
    const fileInput = document.getElementById("csvUpload");
    const file = fileInput.files[0];
    if (!file) return alert("CSV を選択してください");

    // CSVテキストとして読み込み
    const text = await file.text();
    const rows = text.split("\n").map(row => row.split(","));

    const headers = rows[0].map(h => h.trim());

    const records = rows.slice(1).map(cols => {
        return Object.fromEntries(
            headers.map((h, i) => [h, cols[i]?.trim()])
        );
    });

    // Supabaseに挿入
    const { error } = await supabase
        .from("my_courses")
        .insert(records);

    if (error) {
        alert("アップロード失敗：" + error.message);
    } else {
        alert("アップロード成功！");
    }
}

