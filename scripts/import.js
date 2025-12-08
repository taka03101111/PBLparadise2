const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://qlsqyymfamslyrzhcggn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsc3F5eW1mYW1zbHlyemhjZ2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MjA0NDEsImV4cCI6MjA3ODQ5NjQ0MX0._jEWZGK3yDZKy95jPibMFh7c9u3nnJxsIek0UrvRjbQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function importJsonFiles() {
  try {
    console.log('ファイルを読み込んでいます...');

    const jsonPath = path.join(__dirname, 'lectures_data_A.json');
    const rawA = fs.readFileSync(jsonPath, 'utf8');

    const dataA = JSON.parse(rawA);
    
    // 1. 単純に結合する
    const rawAllData = [...dataA];
    console.log(`元データ合計: ${rawAllData.length} 件`);

    // 2. 重複を取り除く（「授業名」が同じなら、あと勝ちで上書き）
    const uniqueMap = new Map();
    for (const item of rawAllData) {
        // 授業名をキーにしてMapに登録（同じ名前が来たら上書きされる）
        uniqueMap.set(item['授業名'], item);
    }
    // 重複なしの配列に戻す
    const allData = Array.from(uniqueMap.values());

    console.log(`重複削除後: ${allData.length} 件のデータを送信します...`);

    // 3. データベースの列名に合わせて変換
    const formattedData = allData.map(item => ({
      subject_name: item['授業名'],
      credits: item['単位数'],
      category: item['種類'],
      program_tags: item['プログラム指定']
      //program_designation: item['プログラム指定'],
      //semesters: item['開講時期']
    }));

    // 4. 送信（100件ずつ）
    const chunkSize = 100;
    for (let i = 0; i < formattedData.length; i += chunkSize) {
      const chunk = formattedData.slice(i, i + chunkSize);
      
      const { error } = await supabase
        .from('course_details')
        .upsert(chunk, { onConflict: 'subject_name' });

      if (error) throw error;
      console.log(`${Math.min(i + chunkSize, formattedData.length)} / ${formattedData.length} 件 完了`);
    }

    console.log('すべてのインポートが完了しました！');

  } catch (err) {
    console.error('エラー:', err.message);
  }
}

importJsonFiles();