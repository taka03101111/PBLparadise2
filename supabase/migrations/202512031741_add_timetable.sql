-- ------------------------------
-- 時間割テーブル作成
-- ------------------------------

-- テーブルに RLS を有効化
-- 既存のテーブルがあればリセット
DROP TABLE IF EXISTS public.timetable CASCADE;

CREATE TABLE public.timetable (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    semester VARCHAR(10) NOT NULL,
    day_of_week VARCHAR(10) NOT NULL,
    period INTEGER NOT NULL,
    class_type VARCHAR(5),
    subject_name VARCHAR(255),
    is_final BOOLEAN DEFAULT FALSE,
    is_alternate BOOLEAN DEFAULT FALSE
);

-- セキュリティ設定 (RLS)
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for timetable" ON public.timetable FOR SELECT TO anon, authenticated USING (true);

-- ------------------------------
-- 全時間割データ (授業なしは class_type = NULL)
-- ------------------------------
INSERT INTO timetable (year, semester, day_of_week, period, class_type, subject_name, is_final, is_alternate) VALUES
-- 1年前期
(1,'前期','月曜',1,'A','マルチメディア基礎',FALSE,FALSE),
(1,'前期','月曜',1,'B','離散数学',FALSE,FALSE),
(1,'前期','月曜',2,'B','マルチメディア基礎',FALSE,FALSE),
(1,'前期','月曜',2,'A','離散数学',FALSE,FALSE),
(1,'前期','月曜',3,'A','情報工学の世界',FALSE,FALSE),
(1,'前期','月曜',3,'B','情報工学基礎演習',FALSE,FALSE),
(1,'前期','月曜',4,'A','情報工学の世界',FALSE,FALSE),
(1,'前期','月曜',4,'B','情報工学基礎演習',FALSE,FALSE),
(1,'前期','火曜',1,NULL,'人文科学基礎Ⅰ',FALSE,FALSE),
(1,'前期','火曜',1,NULL,'社会科学基礎Ⅰ',FALSE,FALSE),
(1,'前期','火曜',2,NULL,'微分積分Ⅰ',FALSE,FALSE),
(1,'前期','火曜',3,NULL,'化学実験Ⅰ',FALSE,TRUE),
(1,'前期','火曜',4,NULL,'化学実験Ⅰ',FALSE,TRUE),
(1,'前期','火曜',3,NULL,'物理学実験Ⅰ',FALSE,TRUE),
(1,'前期','火曜',4,NULL,'物理学実験Ⅰ',FALSE,TRUE),
(1,'前期','水曜',1,NULL,'体育科学Ⅰ',FALSE,FALSE),
(1,'前期','水曜',2,NULL,'ドイツ語Ⅰ',FALSE,FALSE),
(1,'前期','水曜',2,NULL,'中国語Ⅰ',FALSE,FALSE),
(1,'前期','水曜',2,NULL,'フランス語Ⅰ',FALSE,FALSE),
(1,'前期','水曜',3,'A','英語コミュニケーションⅠ',FALSE,FALSE),
(1,'前期','水曜',3,'B','物理学Ⅰ',FALSE,FALSE),
(1,'前期','水曜',4,'B','英語コミュニケーションⅠ',FALSE,FALSE),
(1,'前期','水曜',4,'A','物理学Ⅰ',FALSE,FALSE),
(1,'前期','木曜',1,NULL,'化学Ⅰ',FALSE,FALSE),
(1,'前期','木曜',2,NULL,'線形代数Ⅰ',FALSE,FALSE),
(1,'前期','木曜',3,'B','コンピューターリテラシー',FALSE,FALSE),
(1,'前期','木曜',3,'A',NULL,FALSE,FALSE),
(1,'前期','木曜',4,'A','コンピューターリテラシー',FALSE,FALSE),
(1,'前期','木曜',4,'B',NULL,FALSE,FALSE),
(1,'前期','金曜',1,NULL,'プログラミング演習Ⅰ',FALSE,TRUE),
(1,'前期','金曜',2,NULL,'プログラミング演習Ⅰ',FALSE,TRUE),
(1,'前期','金曜',3,NULL,NULL,FALSE,FALSE),
(1,'前期','金曜',4,NULL,NULL,FALSE,FALSE),
(1,'前期','金曜',5,NULL,'理工学概論',FALSE,FALSE),

-- 1年後期
(1,'後期','月曜',1,'A','テクニカルリテラシー',FALSE,FALSE),
(1,'後期','月曜',1,'B','確率・統計',FALSE,FALSE),
(1,'後期','月曜',2,'B','テクニカルリテラシー',FALSE,FALSE),
(1,'後期','月曜',2,'A','確率・統計',FALSE,FALSE),
(1,'後期','月曜',3,'A','情報通信ネットワーク',FALSE,FALSE),
(1,'後期','月曜',3,'B','コンピュータアーキテクチャⅠ',FALSE,FALSE),
(1,'後期','月曜',4,'A','情報通信ネットワーク',FALSE,FALSE),
(1,'後期','月曜',4,'B','コンピュータアーキテクチャⅠ',FALSE,FALSE),
(1,'後期','月曜',5,NULL,'離散数学',TRUE,FALSE),
(1,'後期','火曜',1,NULL,'人文科学基礎Ⅱ',FALSE,FALSE),
(1,'後期','火曜',1,NULL,'社会科学基礎Ⅱ',FALSE,FALSE),
(1,'後期','火曜',2,NULL,'微分積分Ⅱ',FALSE,FALSE),
(1,'後期','火曜',3,NULL,'化学実験Ⅱ',FALSE,TRUE),
(1,'後期','火曜',4,NULL,'化学実験Ⅱ',FALSE,TRUE),
(1,'後期','火曜',3,NULL,'物理学実験Ⅱ',FALSE,TRUE),
(1,'後期','火曜',4,NULL,'物理学実験Ⅱ',FALSE,TRUE),
(1,'後期','火曜',5,NULL,'マルチメディア基礎',TRUE,FALSE),
(1,'後期','水曜',1,NULL,'体育科学Ⅱ',FALSE,FALSE),
(1,'後期','水曜',2,NULL,'ドイツ語Ⅱ',FALSE,FALSE),
(1,'後期','水曜',2,NULL,'中国語Ⅱ',FALSE,FALSE),
(1,'後期','水曜',2,NULL,'フランス語Ⅱ',FALSE,FALSE),
(1,'後期','水曜',3,'A','英語コミュニケーションⅡ',FALSE,FALSE),
(1,'後期','水曜',3,'B','物理学Ⅱ',FALSE,FALSE),
(1,'後期','水曜',4,'B','英語コミュニケーションⅡ',FALSE,FALSE),
(1,'後期','水曜',4,'A','物理学Ⅱ',FALSE,FALSE),
(1,'後期','水曜',5,NULL,NULL,FALSE,FALSE),
(1,'後期','水曜',6,NULL,'プログラミング演習Ⅰ',TRUE,FALSE);

-- ------------------------------
-- 2年前期
-- ------------------------------
INSERT INTO timetable (year, semester, day_of_week, period, class_type, subject_name, is_final, is_alternate) VALUES
-- 月曜
(2,'前期','月曜',1,'A','オペレーティングシステム',FALSE,FALSE),
(2,'前期','月曜',1,'B','アルゴリズム・データ構造',FALSE,FALSE),
(2,'前期','月曜',2,'B','オペレーティングシステム',FALSE,FALSE),
(2,'前期','月曜',2,'A','アルゴリズム・データ構造',FALSE,FALSE),
(2,'前期','月曜',3,NULL,'プログラミング演習Ⅲ',FALSE,TRUE),
(2,'前期','月曜',3,NULL,'研究開発リテラシー',FALSE,TRUE),
(2,'前期','月曜',4,NULL,'プログラミング演習Ⅲ',FALSE,TRUE),
(2,'前期','月曜',4,NULL,'研究開発リテラシー',FALSE,TRUE),
(2,'前期','月曜',5,NULL,'コンピュータアーキテクチャⅠ',TRUE,FALSE),
(2,'前期','月曜',6,NULL,'人文科学基礎Ⅰ',TRUE,FALSE),
(2,'前期','月曜',6,NULL,'社会科学基礎Ⅰ',TRUE,FALSE),
-- 火曜
(2,'前期','火曜',1,'A','情報工学実験Ⅰ',FALSE,TRUE),
(2,'前期','火曜',2,'A','情報工学実験Ⅰ',FALSE,TRUE),
(2,'前期','火曜',1,NULL,NULL,FALSE,FALSE),
(2,'前期','火曜',2,NULL,NULL,FALSE,FALSE),
(2,'前期','火曜',3,'B','情報工学実験Ⅰ',FALSE,TRUE),
(2,'前期','火曜',4,'B','情報工学実験Ⅰ',FALSE,TRUE),
(2,'前期','火曜',3,NULL,NULL,FALSE,FALSE),
(2,'前期','火曜',4,NULL,NULL,FALSE,FALSE),
(2,'前期','火曜',5,NULL,'情報通信ネットワーク',TRUE,FALSE),
(2,'前期','火曜',5,NULL,'英語コミュニケーションⅠ',TRUE,FALSE),
(2,'前期','火曜',6,NULL,'物理学Ⅰ',TRUE,FALSE),
-- 水曜
(2,'前期','水曜',1,'A','ディジタル信号処理Ⅰ',FALSE,FALSE),
(2,'前期','水曜',1,'B','ディジタル回路Ⅰ',FALSE,FALSE),
(2,'前期','水曜',2,'B','ディジタル信号処理Ⅰ',FALSE,FALSE),
(2,'前期','水曜',2,'A','ディジタル回路Ⅰ',FALSE,FALSE),
(2,'前期','水曜',3,'A','英語コミュニケーションⅢ',FALSE,FALSE),
(2,'前期','水曜',3,'B','電気電子回路Ⅰ',FALSE,FALSE),
(2,'前期','水曜',4,'B','英語コミュニケーションⅢ',FALSE,FALSE),
(2,'前期','水曜',4,'A','電気電子回路Ⅰ',FALSE,FALSE),
(2,'前期','水曜',5,NULL,'プログラミング演習Ⅱ',TRUE,FALSE),
(2,'前期','水曜',6,NULL,'確率・統計',TRUE,FALSE),
(2,'前期','水曜',6,NULL,'線形代数Ⅰ',TRUE,FALSE),
-- 木曜
(2,'前期','木曜',1,NULL,'ドイツ語Ⅲ',FALSE,FALSE),
(2,'前期','木曜',1,NULL,'中国語Ⅲ',FALSE,FALSE),
(2,'前期','木曜',1,NULL,'フランス語Ⅲ',FALSE,FALSE),
(2,'前期','木曜',2,NULL,NULL,FALSE,FALSE),
(2,'前期','木曜',3,NULL,NULL,FALSE,FALSE),
(2,'前期','木曜',4,NULL,NULL,FALSE,FALSE),
(2,'前期','木曜',5,NULL,'体育科学Ⅲ',FALSE,FALSE),
-- 金曜
(2,'前期','金曜',2,NULL,'アジア文化論Ⅰ',FALSE,FALSE),
(2,'前期','金曜',2,NULL,'欧米文化論Ⅰ',FALSE,FALSE),
(2,'前期','金曜',3,'A','データサイエンス基礎',FALSE,FALSE),
(2,'前期','金曜',3,'B','データベース',FALSE,FALSE),
(2,'前期','金曜',4,'B','データサイエンス基礎',FALSE,FALSE),
(2,'前期','金曜',4,'A','データベース',FALSE,FALSE),
(2,'前期','金曜',5,NULL,NULL,FALSE,FALSE),
(2,'前期','金曜',6,NULL,'微分積分Ⅰ',TRUE,FALSE);

-- ------------------------------
-- 2年後期
-- ------------------------------
INSERT INTO timetable (year, semester, day_of_week, period, class_type, subject_name, is_final, is_alternate) VALUES
-- 月曜
(2,'後期','月曜',1,'A','情報工学実験Ⅱ',FALSE,TRUE),
(2,'後期','月曜',2,'A','情報工学実験Ⅱ',FALSE,TRUE),
(2,'後期','月曜',1,NULL,NULL,FALSE,FALSE),
(2,'後期','月曜',2,NULL,NULL,FALSE,FALSE),
(2,'後期','月曜',3,'B','情報工学実験Ⅱ',FALSE,TRUE),
(2,'後期','月曜',4,'B','情報工学実験Ⅱ',FALSE,TRUE),
(2,'後期','月曜',3,NULL,NULL,FALSE,FALSE),
(2,'後期','月曜',4,NULL,NULL,FALSE,FALSE),
(2,'後期','月曜',5,NULL,'データサイエンス基礎',TRUE,FALSE),
(2,'後期','月曜',6,NULL,'人文科学基礎Ⅱ',TRUE,FALSE),
(2,'後期','月曜',6,NULL,'社会科学基礎Ⅱ',TRUE,FALSE),
-- 火曜
(2,'後期','火曜',1,NULL,'プログラミング演習Ⅲ',FALSE,TRUE),
(2,'後期','火曜',2,NULL,'プログラミング演習Ⅲ',FALSE,TRUE),
(2,'後期','火曜',3,'A','ソフトウェア工学',FALSE,FALSE),
(2,'後期','火曜',3,'B','ディジタル回路Ⅱ',FALSE,FALSE),
(2,'後期','火曜',4,'A','ディジタル回路Ⅱ',FALSE,FALSE),
(2,'後期','火曜',4,'B','ソフトウェア工学',FALSE,FALSE),
(2,'後期','火曜',5,NULL,'電気電子回路Ⅰ',TRUE,FALSE),
(2,'後期','火曜',5,NULL,'PBL概論',TRUE,FALSE),
(2,'後期','火曜',5,NULL,'英語コミュニケーションⅡ',TRUE,FALSE),
(2,'後期','火曜',6,NULL,'物理学Ⅱ',TRUE,FALSE),
-- 水曜
(2,'後期','水曜',1,'A','画像処理',FALSE,FALSE),
(2,'後期','水曜',1,'B','アプリケーション開発',FALSE,FALSE),
(2,'後期','水曜',2,'B','画像処理',FALSE,FALSE),
(2,'後期','水曜',2,'A','アプリケーション開発',FALSE,FALSE),
(2,'後期','水曜',3,'A','英語コミュニケーションⅣ',FALSE,FALSE),
(2,'後期','水曜',3,'B','言語・オートマトン',FALSE,FALSE),
(2,'後期','水曜',4,'B','英語コミュニケーションⅣ',FALSE,FALSE),
(2,'後期','水曜',4,'A','言語・オートマトン',FALSE,FALSE),
(2,'後期','水曜',5,NULL,'PBL概論',FALSE,FALSE),
(2,'後期','水曜',5,NULL,'ディジタル回路Ⅰ',TRUE,FALSE),
(2,'後期','水曜',6,NULL,'線形代数Ⅱ',TRUE,FALSE),
-- 木曜
(2,'後期','木曜',1,NULL,'ドイツ語Ⅳ',FALSE,FALSE),
(2,'後期','木曜',1,NULL,'中国語Ⅳ',FALSE,FALSE),
(2,'後期','木曜',1,NULL,'フランス語Ⅳ',FALSE,FALSE),
(2,'後期','木曜',2,NULL,NULL,FALSE,FALSE),
(2,'後期','木曜',3,NULL,NULL,FALSE,FALSE),
(2,'後期','木曜',4,NULL,NULL,FALSE,FALSE),
(2,'後期','木曜',5,NULL,'体育科学Ⅲ',FALSE,FALSE),
-- 金曜
(2,'後期','金曜',1,NULL,NULL,FALSE,FALSE),
(2,'後期','金曜',2,NULL,'アジア文化論Ⅱ',FALSE,FALSE),
(2,'後期','金曜',2,NULL,'欧米文化論Ⅱ',FALSE,FALSE),
(2,'後期','金曜',3,'A','情報理論',FALSE,FALSE),
(2,'後期','金曜',3,'B','ディジタル信号処理Ⅱ',FALSE,FALSE),
(2,'後期','金曜',4,'B','情報理論',FALSE,FALSE),
(2,'後期','金曜',4,'A','ディジタル信号処理Ⅱ',FALSE,FALSE),
(2,'後期','金曜',5,NULL,'アルゴリズム・データ構造',TRUE,FALSE),
(2,'後期','金曜',6,NULL,'微分積分Ⅱ',TRUE,FALSE);

-- ------------------------------
-- 3年前期
-- ------------------------------
INSERT INTO timetable (year, semester, day_of_week, period, class_type, subject_name, is_final, is_alternate) VALUES
-- 月曜
(3,'前期','月曜',1,'A','電気電子回路Ⅱ',FALSE,TRUE),
(3,'前期','月曜',2,'B','電気電子回路Ⅱ',FALSE,TRUE),
(3,'前期','月曜',1,'B','情報セキュリティ',FALSE,FALSE),
(3,'前期','月曜',2,'A','情報セキュリティ',FALSE,FALSE),
(3,'前期','月曜',3,NULL,'システム制御',FALSE,FALSE),
(3,'前期','月曜',4,NULL,'数値解析',FALSE,FALSE),
-- 火曜
(3,'前期','火曜',1,NULL,NULL,FALSE,FALSE),
(3,'前期','火曜',2,NULL,'国際経済論',FALSE,FALSE),
(3,'前期','火曜',2,NULL,'心理学',FALSE,FALSE),
(3,'前期','火曜',3,'A','コンピュータグラフィックス',FALSE,FALSE),
(3,'前期','火曜',3,'B','コンパイラ',FALSE,FALSE),
(3,'前期','火曜',3,NULL,'プラクティカル・イングリッシュⅠ',FALSE,FALSE),
(3,'前期','火曜',4,'B','コンピュータグラフィックス',FALSE,FALSE),
(3,'前期','火曜',4,'A','コンパイラ',FALSE,FALSE),
(3,'前期','火曜',4,NULL,'プラクティカル・イングリッシュⅠ',FALSE,FALSE),
(3,'前期','火曜',5,NULL,'ディジタル回路Ⅱ',TRUE,FALSE),
(3,'前期','火曜',5,NULL,'地学実験Ⅰ',TRUE,FALSE),
(3,'前期','火曜',5,NULL,'ドイツ語Ⅲ',TRUE,FALSE),
(3,'前期','火曜',6,NULL,'ソフトウェア工学',TRUE,FALSE),
(3,'前期','火曜',6,NULL,'職業指導論',TRUE,FALSE),
-- 水曜
(3,'前期','水曜',1,'A','先進プロジェクト実験Ⅰ',FALSE,TRUE),
(3,'前期','水曜',2,'A','先進プロジェクト実験Ⅰ',FALSE,TRUE),
(3,'前期','水曜',1,'B',NULL,FALSE,FALSE),
(3,'前期','水曜',2,'B',NULL,FALSE,FALSE),
(3,'前期','水曜',3,'B','先進プロジェクト実験Ⅰ',FALSE,TRUE),
(3,'前期','水曜',4,'B','先進プロジェクト実験Ⅰ',FALSE,TRUE),
(3,'前期','水曜',3,'A',NULL,FALSE,FALSE),
(3,'前期','水曜',4,'A',NULL,FALSE,FALSE),
(3,'前期','水曜',5,NULL,'画像処理',TRUE,FALSE),
(3,'前期','水曜',6,NULL,'言語・オートマトン',TRUE,FALSE),
-- 木曜
(3,'前期','木曜',1,NULL,'情報工学総合ゼミナール',FALSE,TRUE),
(3,'前期','木曜',2,NULL,'情報工学総合ゼミナール',FALSE,TRUE),
(3,'前期','木曜',1,NULL,'先進プロジェクトゼミナール',FALSE,TRUE),
(3,'前期','木曜',2,NULL,'先進プロジェクトゼミナール',FALSE,TRUE),
(3,'前期','木曜',3,NULL,'プラクティカル・イングリッシュⅠ',FALSE,FALSE),
(3,'前期','木曜',4,NULL,'プラクティカル・イングリッシュⅠ',FALSE,FALSE),
-- 金曜
(3,'前期','金曜',1,NULL,NULL,FALSE,FALSE),
(3,'前期','金曜',2,NULL,NULL,FALSE,FALSE),
(3,'前期','金曜',3,'A','人工知能',FALSE,FALSE),
(3,'前期','金曜',3,'B','コンピュータアーキテクチャⅡ',FALSE,FALSE),
(3,'前期','金曜',4,'B','人工知能',FALSE,FALSE),
(3,'前期','金曜',4,'A','コンピュータアーキテクチャⅡ',FALSE,FALSE),
(3,'前期','金曜',5,NULL,'キャリアゼミナール',FALSE,FALSE),
(3,'前期','金曜',6,NULL,'情報理論',TRUE,FALSE);

-- ------------------------------
-- 3年後期
-- ------------------------------
INSERT INTO timetable (year, semester, day_of_week, period, class_type, subject_name, is_final, is_alternate) VALUES
-- 月曜
(3,'後期','月曜',1,NULL,NULL,FALSE,FALSE),
(3,'後期','月曜',2,NULL,'コンピュータービジョン',FALSE,FALSE),
(3,'後期','月曜',3,NULL,'感性情報処理',FALSE,FALSE),
(3,'後期','月曜',4,NULL,'音声音響信号処理',FALSE,FALSE),
-- 火曜
(3,'後期','火曜',1,NULL,'情報通信システム',FALSE,FALSE),
(3,'後期','火曜',2,NULL,'国際関係論',FALSE,FALSE),
(3,'後期','火曜',2,NULL,'文学',FALSE,FALSE),
(3,'後期','火曜',2,NULL,'日本国憲法',FALSE,FALSE),
(3,'後期','火曜',3,NULL,'先進プロジェクト実験Ⅱ',FALSE,TRUE),
(3,'後期','火曜',4,NULL,'先進プロジェクト実験Ⅱ',FALSE,TRUE),
(3,'後期','火曜',3,NULL,'プラクティカル・イングリッシュⅡ',FALSE,FALSE),
(3,'後期','火曜',4,NULL,'プラクティカル・イングリッシュⅡ',FALSE,FALSE),
(3,'後期','火曜',5,NULL,'地学実験Ⅱ',FALSE,FALSE),
(3,'後期','火曜',5,NULL,'ドイツ語Ⅳ',TRUE,FALSE),
-- 水曜
(3,'後期','水曜',1,'A','情報技術の応用と職',FALSE,FALSE),
(3,'後期','水曜',1,'B',NULL,FALSE,FALSE),
(3,'後期','水曜',2,'B','情報技術の応用と職',FALSE,FALSE),
(3,'後期','水曜',2,'A',NULL,FALSE,FALSE),
(3,'後期','水曜',3,NULL,'パターン認識',FALSE,FALSE),
(3,'後期','水曜',4,NULL,'信号伝送論',FALSE,FALSE),
-- 木曜
(3,'後期','木曜',1,NULL,'研究ゼミナール',FALSE,FALSE),
(3,'後期','木曜',2,NULL,NULL,FALSE,FALSE),
(3,'後期','木曜',3,NULL,'プラクティカル・イングリッシュⅡ',FALSE,FALSE),
(3,'後期','木曜',4,NULL,'プラクティカル・イングリッシュⅡ',FALSE,FALSE),
-- 金曜
(3,'後期','金曜',1,NULL,NULL,FALSE,FALSE),
(3,'後期','金曜',2,NULL,'ハードウェア記述言語',FALSE,FALSE),
(3,'後期','金曜',3,NULL,'プログラミング言語論',FALSE,FALSE),
(3,'後期','金曜',4,NULL,'フィジカルコンピューティング',FALSE,FALSE);

-- ------------------------------
-- 4年前期
-- ------------------------------
INSERT INTO timetable (year, semester, day_of_week, period, class_type, subject_name, is_final, is_alternate) VALUES
-- 月曜
(4,'前期','月曜',1,NULL,NULL,FALSE,FALSE),
(4,'前期','月曜',2,NULL,'センサ工学',FALSE,FALSE),
(4,'前期','月曜',3,NULL,'集積回路設計',FALSE,FALSE),
-- 火曜
(4,'前期','火曜',1,NULL,NULL,FALSE,FALSE),
(4,'前期','火曜',2,NULL,'バーチャルリアリティ',FALSE,FALSE),
-- 水曜
(4,'前期','水曜',1,NULL,NULL,FALSE,FALSE),
(4,'前期','水曜',2,NULL,'応用アルゴリズム',FALSE,FALSE),
(4,'前期','水曜',3,NULL,'言語情報処理',FALSE,FALSE),
-- 木曜
(4,'前期','木曜',1,NULL,NULL,FALSE,FALSE),
(4,'前期','木曜',2,NULL,NULL,FALSE,FALSE),
(4,'前期','木曜',3,NULL,NULL,FALSE,FALSE),
(4,'前期','木曜',4,NULL,NULL,FALSE,FALSE),
(4,'前期','木曜',5,NULL,NULL,FALSE,FALSE),
-- 金曜
(4,'前期','金曜',1,NULL,NULL,FALSE,FALSE),
(4,'前期','金曜',2,NULL,'ワイヤレス通信',FALSE,FALSE),
(4,'前期','金曜',3,NULL,'数理計画法',FALSE,FALSE),
(4,'前期','金曜',4,NULL,'符号理論',FALSE,FALSE);

-- ------------------------------
-- 4年後期
-- ------------------------------
INSERT INTO timetable (year, semester, day_of_week, period, class_type, subject_name, is_final, is_alternate) VALUES
-- 全て研究
(4,'後期','月曜',1,NULL,'研究',FALSE,FALSE),
(4,'後期','月曜',2,NULL,'研究',FALSE,FALSE),
(4,'後期','月曜',3,NULL,'研究',FALSE,FALSE),
(4,'後期','月曜',4,NULL,'研究',FALSE,FALSE),
(4,'後期','月曜',5,NULL,'研究',FALSE,FALSE),
(4,'後期','月曜',6,NULL,'研究',FALSE,FALSE),
(4,'後期','火曜',1,NULL,'研究',FALSE,FALSE),
(4,'後期','火曜',2,NULL,'研究',FALSE,FALSE),
(4,'後期','火曜',3,NULL,'研究',FALSE,FALSE),
(4,'後期','火曜',4,NULL,'研究',FALSE,FALSE),
(4,'後期','火曜',5,NULL,'研究',FALSE,FALSE),
(4,'後期','火曜',6,NULL,'研究',FALSE,FALSE),
(4,'後期','水曜',1,NULL,'研究',FALSE,FALSE),
(4,'後期','水曜',2,NULL,'研究',FALSE,FALSE),
(4,'後期','水曜',3,NULL,'研究',FALSE,FALSE),
(4,'後期','水曜',4,NULL,'研究',FALSE,FALSE),
(4,'後期','水曜',5,NULL,'研究',FALSE,FALSE),
(4,'後期','水曜',6,NULL,'研究',FALSE,FALSE),
(4,'後期','木曜',1,NULL,'研究',FALSE,FALSE),
(4,'後期','木曜',2,NULL,'研究',FALSE,FALSE),
(4,'後期','木曜',3,NULL,'研究',FALSE,FALSE),
(4,'後期','木曜',4,NULL,'研究',FALSE,FALSE),
(4,'後期','木曜',5,NULL,'研究',FALSE,FALSE),
(4,'後期','金曜',1,NULL,'研究',FALSE,FALSE),
(4,'後期','金曜',2,NULL,'研究',FALSE,FALSE),
(4,'後期','金曜',3,NULL,'研究',FALSE,FALSE),
(4,'後期','金曜',4,NULL,'研究',FALSE,FALSE),
(4,'後期','金曜',5,NULL,'研究',FALSE,FALSE),
(4,'後期','金曜',6,NULL,'研究',FALSE,FALSE);

-- ---------------------------------------------------
--  授業カタログテーブル (course_catalog) の空箱作成
-- ---------------------------------------------------

DROP TABLE IF EXISTS public.course_catalog CASCADE;

CREATE TABLE public.course_catalog (
    id SERIAL PRIMARY KEY,
    subject_name TEXT UNIQUE NOT NULL, -- 授業名（紐付けキー）
    credits INT,                       -- 単位数
    category TEXT,                     -- 種類
    program_designation JSONB,         -- プログラム指定
    semesters JSONB,                   -- 開講時期
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- セキュリティ設定 (RLS)
ALTER TABLE public.course_catalog ENABLE ROW LEVEL SECURITY;

-- 読み取り許可
CREATE POLICY "Public read access for catalog" 
ON public.course_catalog FOR SELECT 
TO anon, authenticated 
USING (true);

--  Node.jsからの書き込みを許可
CREATE POLICY "Allow insert for everyone" 
ON public.course_catalog FOR ALL 
USING (true) 
WITH CHECK (true);


-- --------------------------------------------------
--  自動紐付けビュー (timetable_details) の作成
-- --------------------------------------------------

CREATE OR REPLACE VIEW public.timetable_details AS
SELECT 
    t.id AS timetable_id,
    t.year,
    t.semester,
    t.day_of_week,
    t.period,
    t.class_type,
    t.subject_name,
    t.is_final,
    t.is_alternate,
    c.credits,                 -- カタログから来た単位数
    c.category,                -- カタログから来た種類
    c.program_designation      -- カタログから来たプログラム指定
FROM timetable t
LEFT JOIN course_catalog c
    ON t.subject_name = c.subject_name;