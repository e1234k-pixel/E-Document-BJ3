-- Migration: 0001_seed_data.sql
-- Seed data for BJ3 Academic Submission & Progress Tracking System

-- 1. Departments
INSERT OR IGNORE INTO departments (id, name, code, head_name) VALUES
(1, 'กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี', 'SCI', 'นายเดชา วิทยากร'),
(2, 'กลุ่มสาระการเรียนรู้คณิตศาสตร์', 'MATH', 'นางรัตนา เลขาคำนวณ'),
(3, 'กลุ่มสาระการเรียนรู้ภาษาไทย', 'THAI', 'นางมณี คำสละสลวย'),
(4, 'กลุ่มสาระการเรียนรู้ภาษาต่างประเทศ', 'ENG', 'Mr. John Smith'),
(5, 'กลุ่มสาระการเรียนรู้สังคมศึกษา ศาสนา และวัฒนธรรม', 'SOC', 'นายณัฐวุฒิ วัฒนธรรม'),
(6, 'กลุ่มสาระการเรียนรู้สุขศึกษาและพลศึกษา', 'PE', 'นายปิยะ วิ่งเร็ว'),
(7, 'กลุ่มสาระการเรียนรู้ศิลปะ', 'ART', 'น.ส.วิจิตรา ศิลป์งาม'),
(8, 'กลุ่มสาระการเรียนรู้การงานอาชีพ', 'WORK', 'นายสุรชัย พัฒนางาน'),
(9, 'กลุ่มสาระกิจกรรมพัฒนาผู้เรียน', 'ACT', 'ยังไม่กำหนด');

-- 2. Users (5 Roles)
-- Password for all demo users is simple for quick testing: admin123, exec123, acad123, head123, teacher123
INSERT OR IGNORE INTO users (id, username, password_hash, title, name, email, phone, role, department_id, status) VALUES
-- Administrator
(1, 'admin', 'admin123', 'นาย', 'สมศักดิ์ พัฒนาระบบ', 'admin@bj3.ac.th', '081-111-2222', 'admin', 1, 'active'),
-- Executive (Director)
(2, 'director', 'exec123', 'ดร.', 'วิชาญ บริหารการศึกษา', 'director@bj3.ac.th', '081-222-3333', 'executive', NULL, 'active'),
-- Academic Officer
(3, 'academic', 'acad123', 'นาง', 'นภาพร วิชาการเลิศ', 'academic@bj3.ac.th', '081-333-4444', 'academic', 1, 'active'),
-- Department Heads
(4, 'head_sci', 'head123', 'นาย', 'เดชา วิทยากร', 'decha.sci@bj3.ac.th', '081-444-5555', 'department_head', 1, 'active'),
(5, 'head_math', 'head123', 'นาง', 'รัตนา เลขาคำนวณ', 'rattana.math@bj3.ac.th', '081-555-6666', 'department_head', 2, 'active'),
-- Teachers (Science)
(6, 'teacher_somchai', 'teacher123', 'นาย', 'สมชาย ขยันสอน', 'somchai@bj3.ac.th', '089-111-0001', 'teacher', 1, 'active'),
(7, 'teacher_siriporn', 'teacher123', 'น.ส.', 'ศิริพร ใจดี', 'siriporn@bj3.ac.th', '089-111-0002', 'teacher', 1, 'active'),
(8, 'teacher_anant', 'teacher123', 'นาย', 'อนันต์ นวัตกรรม', 'anant@bj3.ac.th', '089-111-0003', 'teacher', 1, 'active'),
-- Teachers (Math)
(9, 'teacher_kannika', 'teacher123', 'นาง', 'กรรณิการ์ รักเรียน', 'kannika@bj3.ac.th', '089-222-0001', 'teacher', 2, 'active'),
(10, 'teacher_prasert', 'teacher123', 'นาย', 'ประเสริฐ สอนดี', 'prasert@bj3.ac.th', '089-222-0002', 'teacher', 2, 'active'),
-- Teachers (Thai)
(11, 'teacher_manee', 'teacher123', 'นาง', 'มณี คำสละสลวย', 'manee@bj3.ac.th', '089-333-0001', 'teacher', 3, 'active'),
(12, 'teacher_thongchai', 'teacher123', 'นาย', 'ธงชัย กาพย์กลอน', 'thongchai@bj3.ac.th', '089-333-0002', 'teacher', 3, 'active'),
-- Teachers (Foreign Language)
(13, 'teacher_john', 'teacher123', 'Mr.', 'John Smith', 'john@bj3.ac.th', '089-444-0001', 'teacher', 4, 'active'),
(14, 'teacher_alisa', 'teacher123', 'น.ส.', 'อลิสา สนทนา', 'alisa@bj3.ac.th', '089-444-0002', 'teacher', 4, 'active'),
-- Teachers (Social Studies)
(15, 'teacher_natthawut', 'teacher123', 'นาย', 'ณัฐวุฒิ วัฒนธรรม', 'natthawut@bj3.ac.th', '089-555-0001', 'teacher', 5, 'active'),
-- Teachers (PE & Health)
(16, 'teacher_piya', 'teacher123', 'นาย', 'ปิยะ วิ่งเร็ว', 'piya@bj3.ac.th', '089-666-0001', 'teacher', 6, 'active'),
-- Teachers (Arts)
(17, 'teacher_vijitra', 'teacher123', 'น.ส.', 'วิจิตรา ศิลป์งาม', 'vijitra@bj3.ac.th', '089-777-0001', 'teacher', 7, 'active'),
-- Teachers (Work & Career)
(18, 'teacher_surachai', 'teacher123', 'นาย', 'สุรชัย พัฒนางาน', 'surachai@bj3.ac.th', '089-888-0001', 'teacher', 8, 'active');

-- 3. Academic Campaigns
INSERT OR IGNORE INTO campaigns (id, title, description, academic_year, semester, doc_type, start_date, due_date, status, allow_late) VALUES
(1, 'ส่งแผนการจัดการเรียนรู้ ภาคเรียนที่ 2/2569', 'การส่งแผนการจัดการเรียนรู้รายวิชาพื้นฐานและเพิ่มเติม ประจำภาคเรียนที่ 2 ปีการศึกษา 2569 ตามเกณฑ์ ว PA', 2569, 2, 'lesson_plan', '2026-10-01', '2026-11-15', 'active', 1),
(2, 'ส่งงานวิจัยในชั้นเรียน ภาคเรียนที่ 1/2569', 'รายงานการวิจัยปฏิบัติการในชั้นเรียนเพื่อแก้ปัญหาหรือพัฒนาการเรียนรู้ของผู้เรียน ภาคเรียนที่ 1/2569', 2569, 1, 'research', '2026-09-01', '2026-10-20', 'active', 1);

-- 4. Sample Submissions across diverse statuses
INSERT OR IGNORE INTO submissions (id, campaign_id, user_id, subject_name, subject_code, grade_level, document_url, submission_type, status, is_late, submitted_at) VALUES
-- Somchai: Campaign 1 Approved, Campaign 2 Approved
(1, 1, 6, 'วิทยาศาสตร์กายภาพ 2', 'ว31102', 'ม.4', 'https://drive.google.com/drive/folders/1BJ3-Demo-Folder-Sci-401?usp=sharing', 'google_drive', 'approved', 0, '2026-10-05 10:30:00'),
(2, 2, 6, 'การแก้ปัญหาผลสัมฤทธิ์ฟิสิกส์ด้วยแบบจำลอง', 'ว31101', 'ม.4', 'https://drive.google.com/file/d/1BJ3-Sci-Research-Paper/view?usp=sharing', 'google_drive', 'approved', 0, '2026-09-15 14:20:00'),

-- Siriporn: Campaign 1 Revision Required, Campaign 2 Under Review
(3, 1, 7, 'เคมีเบื้องต้น', 'ว32102', 'ม.5', 'https://drive.google.com/drive/folders/1BJ3-Demo-Chem-501', 'google_drive', 'revision_required', 0, '2026-10-06 09:15:00'),
(4, 2, 7, 'การจัดการเรียนรู้เคมีสะเต็มศึกษา', 'ว32101', 'ม.5', 'https://drive.google.com/file/d/1BJ3-Chem-Stem-Research/view', 'google_drive', 'under_review', 0, '2026-09-20 11:00:00'),

-- Anant: Campaign 1 Submitted (Wait Review)
(5, 1, 8, 'การออกแบบและเทคโนโลยี', 'ว21102', 'ม.1', 'https://drive.google.com/drive/folders/1BJ3-Tech-Design-101', 'google_drive', 'submitted', 0, '2026-10-07 16:45:00'),

-- Kannika: Campaign 1 Approved, Campaign 2 Late
(6, 1, 9, 'คณิตศาสตร์เพิ่มเติม 4', 'ค32202', 'ม.5', 'https://drive.google.com/drive/folders/1BJ3-Math-Advanced-502', 'google_drive', 'approved', 0, '2026-10-04 11:25:00'),
(7, 2, 9, 'การพัฒนาทักษะการคิดเชิงคำนวณผ่านเกมกระดาน', 'ค32201', 'ม.5', 'https://drive.google.com/file/d/1BJ3-Math-Boardgame-Research', 'google_drive', 'late', 1, '2026-10-22 08:30:00'),

-- Manee: Campaign 1 Under Review, Campaign 2 Approved
(8, 1, 11, 'ภาษาไทย 4', 'ท22102', 'ม.2', 'https://drive.google.com/drive/folders/1BJ3-Thai-Lang-202', 'google_drive', 'under_review', 0, '2026-10-08 13:10:00'),
(9, 2, 11, 'การพัฒนาทักษะการอ่านจับใจความด้วยเทคนิคบันได 6 ขั้น', 'ท22101', 'ม.2', 'https://drive.google.com/file/d/1BJ3-Thai-Reading-Research', 'google_drive', 'approved', 0, '2026-09-18 15:40:00'),

-- John: Campaign 1 Submitted
(10, 1, 13, 'English for Communication 2', 'อ22102', 'ม.2', 'https://drive.google.com/drive/folders/1BJ3-English-202', 'google_drive', 'submitted', 0, '2026-10-09 10:00:00'),

-- Natthawut: Campaign 1 Approved
(11, 1, 15, 'ประวัติศาสตร์สากล', 'ส32102', 'ม.5', 'https://drive.google.com/drive/folders/1BJ3-History-502', 'google_drive', 'approved', 0, '2026-10-03 14:00:00'),

-- Piya: Campaign 1 Revision Required
(12, 1, 16, 'พลศึกษา (บาสเกตบอล)', 'พ23102', 'ม.3', 'https://drive.google.com/drive/folders/1BJ3-PE-Basketball', 'google_drive', 'revision_required', 0, '2026-10-07 10:30:00');

-- (Note: Teachers 10 (Prasert), 12 (Thongchai), 14 (Alisa), 17 (Vijitra), 18 (Surachai) haven't submitted yet for some campaigns to test the Unsubmitted Tracker & LINE Copy button)

-- 5. Reviews
INSERT OR IGNORE INTO reviews (id, submission_id, reviewer_id, status, comment, reviewed_at) VALUES
(1, 1, 4, 'approved', 'แผนการจัดการเรียนรู้สอดคล้องกับมาตรฐาน ว PA และมีบันทึกหลังแผนชัดเจน สมบูรณ์ดีมากครับ', '2026-10-06 14:00:00'),
(2, 3, 4, 'revision_required', 'กรุณาเพิ่มเติมบันทึกหลังการจัดการเรียนรู้ และระบุเครื่องมือการวัดและประเมินผลให้ครบถ้วนในแผนที่ 3-5 ครับ', '2026-10-07 11:20:00'),
(3, 6, 5, 'approved', 'เนื้อหาละเอียด ตรงตามโครงสร้างหลักสูตร ผ่านการรับรองครับ', '2026-10-05 16:30:00'),
(4, 12, 3, 'revision_required', 'ลิงก์ Google Drive ยังไม่ได้เปิดสิทธิ์เข้าถึง (ต้องขอสิทธิ์) กรุณาตั้งค่าเป็น "ทุกคนที่มีลิงก์สามารถดูได้" แล้วส่งใหม่อีกครั้งครับ', '2026-10-08 09:15:00');

-- 6. Submission History
INSERT OR IGNORE INTO submission_history (id, submission_id, user_id, action, old_status, new_status, note, created_at) VALUES
(1, 1, 6, 'submit', NULL, 'submitted', 'ส่งแผนการจัดการเรียนรู้ครั้งแรกผ่าน Google Drive', '2026-10-05 10:30:00'),
(2, 1, 4, 'review_approve', 'submitted', 'approved', 'หัวหน้ากลุ่มสาระฯ ตรวจสอบและอนุมัติ', '2026-10-06 14:00:00'),
(3, 3, 7, 'submit', NULL, 'submitted', 'ส่งแผนเคมีเบื้องต้น', '2026-10-06 09:15:00'),
(4, 3, 4, 'review_revision', 'submitted', 'revision_required', 'ส่งกลับแก้ไข: กรุณาเพิ่มเติมบันทึกหลังการจัดกิจกรรม', '2026-10-07 11:20:00');

-- 7. Notifications
INSERT OR IGNORE INTO notifications (id, user_id, title, message, read_status, link, created_at) VALUES
(1, 7, '⚠️ เอกสารของคุณต้องแก้ไข', 'หัวหน้ากลุ่มสาระฯ ส่งกลับแผนการจัดการเรียนรู้ ว32102: กรุณาเพิ่มเติมบันทึกหลังการจัดการเรียนรู้', 0, '/teacher', '2026-10-07 11:20:00'),
(2, 16, '⚠️ ลิงก์เอกสารเปิดไม่ได้', 'ฝ่ายวิชาการแจ้งเตือน: ลิงก์ Google Drive ยังไม่ได้ตั้งค่าเป็นสาธารณะ', 0, '/teacher', '2026-10-08 09:15:00'),
(3, 6, '✅ เอกสารผ่านการตรวจแล้ว', 'แผนการจัดการเรียนรู้ ว31102 ผ่านการตรวจรับรองเรียบร้อยแล้ว', 1, '/teacher', '2026-10-06 14:00:00');
