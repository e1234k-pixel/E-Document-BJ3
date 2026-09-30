import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env, User, Department, Campaign, Submission, Review, SubmissionHistory, Notification } from '../types';

const app = new Hono<{ Bindings: Env }>().basePath('/api');

// Enable CORS
app.use('*', cors());

// ==========================================
// 1. System Health & DB Check
// ==========================================
app.get('/health', async (c) => {
  try {
    const db = c.env.DB;
    if (!db) {
      return c.json({ status: 'ok', database: 'mock_mode', message: 'No D1 DB binding found in environment' });
    }
    const result = await db.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>();
    return c.json({ status: 'ok', database: 'connected', userCount: result?.count || 0 });
  } catch (err: any) {
    return c.json({ status: 'error', error: err.message }, 500);
  }
});

// ==========================================
// 2. Authentication & Demo Role Switcher
// ==========================================
app.post('/auth/login', async (c) => {
  try {
    const { username, password } = await c.req.json();
    const db = c.env.DB;

    if (!db) {
      return c.json({ error: 'Database not available' }, 500);
    }

    const user = await db
      .prepare(`
        SELECT u.*, d.name as department_name, d.code as department_code
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        WHERE u.username = ?
      `)
      .bind(username)
      .first<any>();

    if (!user) {
      return c.json({ error: 'ไม่พบบัญชีผู้ใช้งานนี้ในระบบ' }, 401);
    }

    // In demo/MVP, accept password match (or default demo passwords)
    if (user.password_hash !== password && password !== 'admin123' && password !== 'teacher123') {
      return c.json({ error: 'รหัสผ่านไม่ถูกต้อง' }, 401);
    }

    if (user.status !== 'active') {
      return c.json({ error: 'บัญชีผู้ใช้นี้ถูกระงับการใช้งาน' }, 403);
    }

    const { password_hash, ...safeUser } = user;
    return c.json({
      success: true,
      user: safeUser,
      token: `demo-token-${user.id}-${Date.now()}`
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.get('/auth/users', async (c) => {
  try {
    const db = c.env.DB;
    if (!db) return c.json([]);

    const { results } = await db
      .prepare(`
        SELECT u.id, u.username, u.title, u.name, u.role, u.department_id, u.status,
               d.name as department_name, d.code as department_code
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        ORDER BY u.role, u.department_id, u.id
      `)
      .all<any>();

    return c.json(results || []);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// ==========================================
// 3. Departments
// ==========================================
app.get('/departments', async (c) => {
  try {
    const db = c.env.DB;
    if (!db) return c.json([]);

    const { results } = await db
      .prepare(`
        SELECT 
          d.id, d.name, d.code, d.created_at,
          COALESCE(
            (SELECT u.title || u.name FROM users u WHERE u.department_id = d.id AND u.role = 'department_head' AND u.status = 'active' LIMIT 1),
            d.head_name
          ) as head_name,
          (SELECT u.id FROM users u WHERE u.department_id = d.id AND u.role = 'department_head' AND u.status = 'active' LIMIT 1) as head_user_id,
          (SELECT COUNT(*) FROM users u WHERE u.department_id = d.id AND u.status = 'active') as teacher_count
        FROM departments d 
        ORDER BY d.id ASC
      `)
      .all<Department>();

    return c.json(results || []);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.post('/departments', async (c) => {
  try {
    const body = await c.req.json();
    const db = c.env.DB;
    if (!body.name || !body.code) {
      return c.json({ error: 'กรุณากรอกชื่อและรหัสย่อกลุ่มสาระ' }, 400);
    }

    let headName: string | null = null;
    if (body.head_user_id) {
      const u = await db
        .prepare('SELECT id, title, name FROM users WHERE id = ?')
        .bind(body.head_user_id)
        .first<{ id: number; title: string; name: string }>();
      if (u) {
        headName = `${u.title || ''}${u.name}`;
      }
    }

    const res = await db
      .prepare('INSERT INTO departments (name, code, head_name) VALUES (?, ?, ?)')
      .bind(body.name.trim(), body.code.trim().toUpperCase(), headName)
      .run();

    const newDeptId = res.meta.last_row_id;

    if (body.head_user_id && newDeptId) {
      await db
        .prepare(`UPDATE users SET department_id = ?, role = 'department_head' WHERE id = ?`)
        .bind(newDeptId, body.head_user_id)
        .run();
    }

    return c.json({ success: true, id: newDeptId });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.put('/departments/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const db = c.env.DB;

    const dept = await db
      .prepare('SELECT * FROM departments WHERE id = ?')
      .bind(id)
      .first<Department>();

    if (!dept) {
      return c.json({ error: 'ไม่พบกลุ่มสาระที่ต้องการแก้ไข' }, 404);
    }

    const name = body.name ? body.name.trim() : dept.name;
    const code = body.code ? body.code.trim().toUpperCase() : dept.code;
    let headName: string | null = null;

    if (body.head_user_id !== undefined) {
      if (body.head_user_id) {
        const u = await db
          .prepare('SELECT id, title, name FROM users WHERE id = ?')
          .bind(body.head_user_id)
          .first<{ id: number; title: string; name: string }>();

        if (u) {
          headName = `${u.title || ''}${u.name}`;

          // Revert any other user in this department who is currently department_head to teacher
          await db
            .prepare(`UPDATE users SET role = 'teacher' WHERE department_id = ? AND role = 'department_head' AND id != ?`)
            .bind(id, u.id)
            .run();

          // Set this user as department_head and ensure department_id is set
          await db
            .prepare(`UPDATE users SET role = 'department_head', department_id = ? WHERE id = ?`)
            .bind(id, u.id)
            .run();
        }
      } else {
        // Clear department head
        await db
          .prepare(`UPDATE users SET role = 'teacher' WHERE department_id = ? AND role = 'department_head'`)
          .bind(id)
          .run();
        headName = null;
      }

      await db
        .prepare('UPDATE departments SET name = ?, code = ?, head_name = ? WHERE id = ?')
        .bind(name, code, headName, id)
        .run();
    } else {
      await db
        .prepare('UPDATE departments SET name = ?, code = ? WHERE id = ?')
        .bind(name, code, id)
        .run();
    }

    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// ==========================================
// 4. Campaigns (รอบการส่งเอกสาร)
// ==========================================
app.get('/campaigns', async (c) => {
  try {
    const db = c.env.DB;
    if (!db) return c.json([]);

    const { results } = await db
      .prepare('SELECT * FROM campaigns ORDER BY status ASC, due_date ASC')
      .all<Campaign>();

    return c.json(results || []);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.post('/campaigns', async (c) => {
  try {
    const body = await c.req.json();
    const db = c.env.DB;

    const query = `
      INSERT INTO campaigns (title, description, academic_year, semester, doc_type, start_date, due_date, status, allow_late)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const res = await db
      .prepare(query)
      .bind(
        body.title,
        body.description || '',
        body.academic_year || 2569,
        body.semester || 2,
        body.doc_type || 'lesson_plan',
        body.start_date,
        body.due_date,
        body.status || 'active',
        body.allow_late ?? 1
      )
      .run();

    return c.json({ success: true, id: res.meta.last_row_id });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.put('/campaigns/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const db = c.env.DB;

    await db
      .prepare(`
        UPDATE campaigns
        SET title = ?, description = ?, academic_year = ?, semester = ?, doc_type = ?,
            start_date = ?, due_date = ?, status = ?, allow_late = ?
        WHERE id = ?
      `)
      .bind(
        body.title,
        body.description,
        body.academic_year,
        body.semester,
        body.doc_type,
        body.start_date,
        body.due_date,
        body.status,
        body.allow_late,
        id
      )
      .run();

    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// ==========================================
// 5. Submissions (ส่งและติดตามเอกสาร)
// ==========================================
app.get('/submissions', async (c) => {
  try {
    const db = c.env.DB;
    if (!db) return c.json([]);

    const campaignId = c.req.query('campaign_id');
    const departmentId = c.req.query('department_id');
    const userId = c.req.query('user_id');
    const status = c.req.query('status');

    let query = `
      SELECT s.*, 
             u.title || u.name as user_name,
             u.email as user_email,
             u.phone as user_phone,
             d.id as department_id,
             d.name as department_name,
             d.code as department_code,
             c.title as campaign_title,
             c.due_date as campaign_due_date,
             r.status as latest_review_status,
             r.comment as latest_review_comment,
             ru.name as reviewer_name
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      JOIN campaigns c ON s.campaign_id = c.id
      LEFT JOIN (
        SELECT r1.* 
        FROM reviews r1
        JOIN (
          SELECT submission_id, MAX(id) as max_id 
          FROM reviews 
          GROUP BY submission_id
        ) r2 ON r1.id = r2.max_id
      ) r ON s.id = r.submission_id
      LEFT JOIN users ru ON r.reviewer_id = ru.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (campaignId) {
      query += ` AND s.campaign_id = ?`;
      params.push(campaignId);
    }
    if (departmentId) {
      query += ` AND u.department_id = ?`;
      params.push(departmentId);
    }
    if (userId) {
      query += ` AND s.user_id = ?`;
      params.push(userId);
    }
    if (status) {
      query += ` AND s.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY s.submitted_at DESC`;

    const stmt = db.prepare(query);
    const { results } = await (params.length > 0 ? stmt.bind(...params) : stmt).all<any>();

    return c.json(results || []);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.get('/submissions/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;

    const submission = await db
      .prepare(`
        SELECT s.*, 
               u.title || u.name as user_name,
               u.email as user_email,
               u.phone as user_phone,
               d.name as department_name,
               c.title as campaign_title,
               c.due_date as campaign_due_date
        FROM submissions s
        JOIN users u ON s.user_id = u.id
        LEFT JOIN departments d ON u.department_id = d.id
        JOIN campaigns c ON s.campaign_id = c.id
        WHERE s.id = ?
      `)
      .bind(id)
      .first<any>();

    if (!submission) {
      return c.json({ error: 'ไม่พบข้อมูลการส่งเอกสาร' }, 404);
    }

    // Get reviews
    const { results: reviews } = await db
      .prepare(`
        SELECT r.*, u.name as reviewer_name, u.role as reviewer_role
        FROM reviews r
        JOIN users u ON r.reviewer_id = u.id
        WHERE r.submission_id = ?
        ORDER BY r.reviewed_at DESC
      `)
      .bind(id)
      .all<any>();

    // Get history timeline
    const { results: history } = await db
      .prepare(`
        SELECT h.*, u.name as user_name
        FROM submission_history h
        JOIN users u ON h.user_id = u.id
        WHERE h.submission_id = ?
        ORDER BY h.created_at DESC
      `)
      .bind(id)
      .all<any>();

    return c.json({
      submission,
      reviews: reviews || [],
      history: history || []
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Submit Document (Create or Upsert)
app.post('/submissions', async (c) => {
  try {
    const body = await c.req.json();
    const db = c.env.DB;

    const {
      campaign_id,
      user_id,
      subject_name,
      subject_code,
      grade_level,
      document_url,
      submission_type = 'google_drive'
    } = body;

    if (!campaign_id || !user_id || !subject_name || !document_url) {
      return c.json({ error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' }, 400);
    }

    // Check campaign deadline
    const campaign = await db
      .prepare('SELECT * FROM campaigns WHERE id = ?')
      .bind(campaign_id)
      .first<Campaign>();

    if (!campaign) {
      return c.json({ error: 'ไม่พบรอบการส่งเอกสารนี้' }, 404);
    }

    const now = new Date();
    const dueDate = new Date(campaign.due_date + 'T23:59:59');
    const isLate = now > dueDate ? 1 : 0;
    const initialStatus = isLate ? 'late' : 'submitted';

    // Check if user already submitted for this campaign
    const existing = await db
      .prepare('SELECT id, status FROM submissions WHERE campaign_id = ? AND user_id = ?')
      .bind(campaign_id, user_id)
      .first<{ id: number; status: string }>();

    let submissionId: number;

    if (existing) {
      // Update existing submission (Resubmit)
      await db
        .prepare(`
          UPDATE submissions 
          SET subject_name = ?, subject_code = ?, grade_level = ?, 
              document_url = ?, submission_type = ?, status = ?, 
              is_late = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `)
        .bind(
          subject_name,
          subject_code,
          grade_level,
          document_url,
          submission_type,
          initialStatus,
          isLate,
          existing.id
        )
        .run();

      submissionId = existing.id;

      // History
      await db
        .prepare(`
          INSERT INTO submission_history (submission_id, user_id, action, old_status, new_status, note)
          VALUES (?, ?, 'resubmit', ?, ?, 'แก้ไขลิงก์และส่งเอกสารฉบับใหม่')
        `)
        .bind(submissionId, user_id, existing.status, initialStatus)
        .run();

    } else {
      // New submission
      const res = await db
        .prepare(`
          INSERT INTO submissions (campaign_id, user_id, subject_name, subject_code, grade_level, document_url, submission_type, status, is_late)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          campaign_id,
          user_id,
          subject_name,
          subject_code,
          grade_level,
          document_url,
          submission_type,
          initialStatus,
          isLate
        )
        .run();

      submissionId = Number(res.meta.last_row_id);

      // History
      await db
        .prepare(`
          INSERT INTO submission_history (submission_id, user_id, action, old_status, new_status, note)
          VALUES (?, ?, 'submit', NULL, ?, ?)
        `)
        .bind(
          submissionId,
          user_id,
          initialStatus,
          isLate ? 'ส่งเอกสาร (หลังกำหนดเวลา)' : 'ส่งเอกสารครั้งแรกเรียบร้อย'
        )
        .run();
    }

    return c.json({
      success: true,
      submission_id: submissionId,
      status: initialStatus,
      is_late: isLate
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// ==========================================
// 6. Reviews & Approval Workflow
// ==========================================
app.post('/submissions/:id/review', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const db = c.env.DB;

    const { reviewer_id, status, comment } = body;
    // status: 'approved' | 'revision_required' | 'under_review'

    if (!reviewer_id || !status) {
      return c.json({ error: 'ข้อมูลการตรวจไม่ครบถ้วน' }, 400);
    }

    const submission = await db
      .prepare(`
        SELECT s.*, u.name as teacher_name, c.title as campaign_title
        FROM submissions s
        JOIN users u ON s.user_id = u.id
        JOIN campaigns c ON s.campaign_id = c.id
        WHERE s.id = ?
      `)
      .bind(id)
      .first<any>();

    if (!submission) {
      return c.json({ error: 'ไม่พบรายการส่งเอกสารนี้' }, 404);
    }

    const oldStatus = submission.status;

    // 1. Insert review
    await db
      .prepare(`
        INSERT INTO reviews (submission_id, reviewer_id, status, comment)
        VALUES (?, ?, ?, ?)
      `)
      .bind(id, reviewer_id, status, comment || '')
      .run();

    // 2. Update submission status
    await db
      .prepare(`
        UPDATE submissions 
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(status, id)
      .run();

    // 3. Add to submission history
    const actionName = status === 'approved' ? 'review_approve' : status === 'revision_required' ? 'review_revision' : 'review_under_review';
    await db
      .prepare(`
        INSERT INTO submission_history (submission_id, user_id, action, old_status, new_status, note)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(id, reviewer_id, actionName, oldStatus, status, comment || (status === 'approved' ? 'ผ่านการตรวจรับรอง' : 'ส่งกลับแก้ไข'))
      .run();

    // 4. Create in-app notification for the teacher
    const notifTitle = status === 'approved' ? '✅ เอกสารผ่านการตรวจแล้ว' : '⚠️ เอกสารของคุณต้องแก้ไข';
    const notifMsg = status === 'approved'
      ? `เอกสาร "${submission.subject_name}" (${submission.campaign_title}) ได้รับการอนุมัติแล้ว`
      : `เอกสาร "${submission.subject_name}" (${submission.campaign_title}) มีข้อคิดเห็น: ${comment || 'กรุณาตรวจสอบและส่งฉบับแก้ไข'}`;

    await db
      .prepare(`
        INSERT INTO notifications (user_id, title, message, link)
        VALUES (?, ?, ?, '/teacher')
      `)
      .bind(submission.user_id, notifTitle, notifMsg)
      .run();

    return c.json({ success: true, new_status: status });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// ==========================================
// 7. Executive & Academic Analytics & Matrix
// ==========================================
app.get('/analytics/kpis', async (c) => {
  try {
    const db = c.env.DB;
    if (!db) return c.json({});

    const campaignId = c.req.query('campaign_id') || '1';
    const departmentId = c.req.query('department_id');
    // Total teachers count (including department heads who have teaching duty)
    let teacherQuery = `SELECT COUNT(*) as count FROM users WHERE role IN ('teacher', 'department_head') AND status = 'active'`;
    if (departmentId) {
      teacherQuery += ` AND department_id = ${Number(departmentId)}`;
    }
    const totalTeachers = (await db.prepare(teacherQuery).first<{ count: number }>())?.count || 0;

    // Submissions breakdown for this campaign
    let subQuery = `
      SELECT s.status, COUNT(*) as count
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      WHERE s.campaign_id = ?
    `;
    const params: any[] = [campaignId];

    if (departmentId) {
      subQuery += ` AND u.department_id = ?`;
      params.push(departmentId);
    }
    subQuery += ` GROUP BY s.status`;

    const { results } = await db.prepare(subQuery).bind(...params).all<{ status: string; count: number }>();

    const statusCounts: Record<string, number> = {
      submitted: 0,
      under_review: 0,
      revision_required: 0,
      approved: 0,
      late: 0,
    };

    let totalSubmissions = 0;
    results?.forEach((r) => {
      statusCounts[r.status] = r.count;
      totalSubmissions += r.count;
    });

    const notSubmitted = Math.max(0, totalTeachers - totalSubmissions);
    const submissionRate = totalTeachers > 0 ? Number(((totalSubmissions / totalTeachers) * 100).toFixed(2)) : 0;
    const approvalRate = totalTeachers > 0 ? Number(((statusCounts.approved / totalTeachers) * 100).toFixed(2)) : 0;

    return c.json({
      totalTeachers,
      totalSubmissions,
      submitted: statusCounts.submitted,
      underReview: statusCounts.under_review,
      revisionRequired: statusCounts.revision_required,
      approved: statusCounts.approved,
      late: statusCounts.late,
      notSubmitted,
      submissionRate,
      approvalRate
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Department Progress Breakdown
app.get('/analytics/department-progress', async (c) => {
  try {
    const db = c.env.DB;
    if (!db) return c.json([]);

    const campaignId = c.req.query('campaign_id') || '1';

    const { results: depts } = await db
      .prepare(`
        SELECT 
          d.id, d.name, d.code,
          COALESCE(
            (SELECT u.title || u.name FROM users u WHERE u.department_id = d.id AND u.role = 'department_head' AND u.status = 'active' LIMIT 1),
            d.head_name
          ) as head_name
        FROM departments d 
        ORDER BY d.id
      `)
      .all<any>();

    const progressList = [];

    for (const d of depts || []) {
      const teacherCount = (await db
        .prepare(`SELECT COUNT(*) as count FROM users WHERE role IN ('teacher', 'department_head') AND department_id = ? AND status = 'active'`)
        .bind(d.id)
        .first<{ count: number }>())?.count || 0;

      const { results: subStats } = await db
        .prepare(`
          SELECT s.status, COUNT(*) as count
          FROM submissions s
          JOIN users u ON s.user_id = u.id
          WHERE s.campaign_id = ? AND u.department_id = ?
          GROUP BY s.status
        `)
        .bind(campaignId, d.id)
        .all<{ status: string; count: number }>();

      const counts: Record<string, number> = { submitted: 0, under_review: 0, revision_required: 0, approved: 0, late: 0 };
      let totalSubmitted = 0;

      subStats?.forEach((s) => {
        counts[s.status] = s.count;
        totalSubmitted += s.count;
      });

      const notSubmitted = Math.max(0, teacherCount - totalSubmitted);
      const percentage = teacherCount > 0 ? Number(((totalSubmitted / teacherCount) * 100).toFixed(1)) : 0;

      progressList.push({
        id: d.id,
        name: d.name,
        code: d.code,
        head_name: d.head_name,
        totalTeachers: teacherCount,
        totalSubmitted,
        approved: counts.approved,
        underReview: counts.under_review + counts.submitted,
        revision: counts.revision_required,
        notSubmitted,
        percentage
      });
    }

    return c.json(progressList);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Submission Matrix (Teachers x Campaigns)
app.get('/analytics/matrix', async (c) => {
  try {
    const db = c.env.DB;
    if (!db) return c.json([]);

    const departmentId = c.req.query('department_id');

    let teacherQuery = `
      SELECT u.id, u.title, u.name, u.role, u.department_id, d.name as department_name, d.code as department_code
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.role IN ('teacher', 'department_head') AND u.status = 'active'
    `;
    if (departmentId) {
      teacherQuery += ` AND u.department_id = ${Number(departmentId)}`;
    }
    teacherQuery += ` ORDER BY u.department_id, u.id`;

    const { results: teachers } = await db.prepare(teacherQuery).all<any>();
    const { results: campaigns } = await db.prepare('SELECT id, title, academic_year, semester FROM campaigns ORDER BY id').all<any>();
    const { results: submissions } = await db.prepare('SELECT id, campaign_id, user_id, status, document_url, updated_at FROM submissions').all<any>();

    const subMap = new Map<string, any>();
    submissions?.forEach((s) => {
      subMap.set(`${s.user_id}_${s.campaign_id}`, s);
    });

    const matrix = teachers?.map((t) => {
      const campStatuses: Record<number, any> = {};
      campaigns?.forEach((c) => {
        const sub = subMap.get(`${t.id}_${c.id}`);
        campStatuses[c.id] = sub ? {
          submission_id: sub.id,
          status: sub.status,
          document_url: sub.document_url,
          updated_at: sub.updated_at
        } : {
          status: 'not_submitted'
        };
      });

      return {
        teacher: t,
        campaigns: campStatuses
      };
    });

    return c.json({ campaigns: campaigns || [], matrix: matrix || [] });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Missing Submissions List (ผู้ยังไม่ส่งสำหรับทำข้อความแจ้งเตือน LINE)
app.get('/analytics/unsubmitted', async (c) => {
  try {
    const db = c.env.DB;
    if (!db) return c.json([]);

    const campaignId = c.req.query('campaign_id') || '1';
    const departmentId = c.req.query('department_id');

    const campaign = await db.prepare('SELECT * FROM campaigns WHERE id = ?').bind(campaignId).first<Campaign>();
    if (!campaign) {
      return c.json({ error: 'ไม่พบ Campaign' }, 404);
    }

    let query = `
      SELECT u.id, u.title, u.name, u.phone, u.email, d.name as department_name, d.code as department_code
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.role IN ('teacher', 'department_head') AND u.status = 'active'
        AND u.id NOT IN (
          SELECT user_id FROM submissions WHERE campaign_id = ?
        )
    `;
    const params: any[] = [campaignId];

    if (departmentId) {
      query += ` AND u.department_id = ?`;
      params.push(departmentId);
    }
    query += ` ORDER BY u.department_id, u.name`;

    const { results } = await db.prepare(query).bind(...params).all<any>();

    // Calculate days remaining
    const now = new Date();
    const dueDate = new Date(campaign.due_date + 'T23:59:59');
    const diffTime = dueDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return c.json({
      campaign,
      daysRemaining,
      isOverdue: daysRemaining < 0,
      unsubmittedCount: results?.length || 0,
      teachers: results || []
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// ==========================================
// 8. In-App Notifications
// ==========================================
app.get('/notifications', async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.req.query('user_id');

    if (!db || !userId) return c.json([]);

    const { results } = await db
      .prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20')
      .bind(userId)
      .all<Notification>();

    return c.json(results || []);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// ==========================================
// 9. Admin User Management (เพิ่ม/แก้ไข/ลบ/นำเข้าครู)
// ==========================================
app.post('/admin/users', async (c) => {
  try {
    const db = c.env.DB;
    const body = await c.req.json();
    const {
      username,
      password = 'password123',
      title = 'ครู',
      name,
      email = '',
      phone = '',
      role = 'teacher',
      department_id,
      status = 'active'
    } = body;

    if (!username || !name) {
      return c.json({ error: 'กรุณากรอกชื่อและ Username ให้ครบถ้วน' }, 400);
    }

    // Check unique username
    const existing = await db.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
    if (existing) {
      return c.json({ error: `Username "${username}" มีในระบบแล้ว กรุณาใช้ชื่ออื่น` }, 400);
    }

    const res = await db.prepare(`
      INSERT INTO users (username, password_hash, title, name, email, phone, role, department_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(username, password, title, name, email, phone, role, department_id ? Number(department_id) : null, status).run();

    return c.json({ success: true, id: res.meta.last_row_id });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.post('/admin/users/bulk', async (c) => {
  try {
    const db = c.env.DB;
    const { users } = await c.req.json();
    if (!Array.isArray(users) || users.length === 0) {
      return c.json({ error: 'ไม่พบข้อมูลครูที่ต้องการนำเข้า' }, 400);
    }

    let insertedCount = 0;
    const errors: string[] = [];

    for (const u of users) {
      try {
        if (!u.name || !u.name.trim()) continue;
        const username = u.username ? u.username.trim() : `teacher_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const password = u.password || '123456';
        const title = u.title || 'ครู';
        const role = u.role || 'teacher';
        const deptId = u.department_id ? Number(u.department_id) : null;
        const email = u.email || '';
        const phone = u.phone || '';

        // Check existing
        const exist = await db.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
        if (exist) {
          errors.push(`Username ${username} ซ้ำ ข้ามการนำเข้า`);
          continue;
        }

        await db.prepare(`
          INSERT INTO users (username, password_hash, title, name, email, phone, role, department_id, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
        `).bind(username, password, title, u.name.trim(), email, phone, role, deptId).run();

        insertedCount++;
      } catch (e: any) {
        errors.push(`ครู ${u.name}: ${e.message}`);
      }
    }

    return c.json({ success: true, insertedCount, errors });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.put('/admin/users/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;
    const body = await c.req.json();
    const { title, name, username, password, email, phone, role, department_id, status } = body;

    let query = `
      UPDATE users 
      SET title = ?, name = ?, username = ?, email = ?, phone = ?, role = ?, department_id = ?, status = ?
    `;
    const params: any[] = [title, name, username, email, phone, role, department_id ? Number(department_id) : null, status];

    if (password && password.trim()) {
      query += `, password_hash = ?`;
      params.push(password.trim());
    }

    query += ` WHERE id = ?`;
    params.push(id);

    await db.prepare(query).bind(...params).run();
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Helper function to safely delete user with all foreign key constraints cleared
async function deleteUserCascade(db: any, userId: number | string) {
  const uid = Number(userId);
  // 1. Delete notifications for this user
  await db.prepare('DELETE FROM notifications WHERE user_id = ?').bind(uid).run();
  // 2. Delete reviews made by this user
  await db.prepare('DELETE FROM reviews WHERE reviewer_id = ?').bind(uid).run();
  // 3. Delete submission history entries made by this user
  await db.prepare('DELETE FROM submission_history WHERE user_id = ?').bind(uid).run();
  // 4. Delete reviews & submission_history for submissions owned by this user
  await db.prepare('DELETE FROM reviews WHERE submission_id IN (SELECT id FROM submissions WHERE user_id = ?)').bind(uid).run();
  await db.prepare('DELETE FROM submission_history WHERE submission_id IN (SELECT id FROM submissions WHERE user_id = ?)').bind(uid).run();
  // 5. Delete submissions owned by this user
  await db.prepare('DELETE FROM submissions WHERE user_id = ?').bind(uid).run();
  // 6. Finally delete the user
  await db.prepare('DELETE FROM users WHERE id = ?').bind(uid).run();
}

app.delete('/admin/users/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;
    await deleteUserCascade(db, id);
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Bulk Delete Users
app.post('/admin/users/bulk-delete', async (c) => {
  try {
    const db = c.env.DB;
    const { user_ids } = await c.req.json();
    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return c.json({ error: 'ไม่พบรายการผู้ใช้ที่ต้องการลบ' }, 400);
    }

    for (const uid of user_ids) {
      await deleteUserCascade(db, uid);
    }

    return c.json({ success: true, deletedCount: user_ids.length });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Bulk Update Users (แก้ไขกลุ่มสาระ, บทบาท, สถานะ, รีเซ็ตรหัสผ่านพร้อมกัน)
app.post('/admin/users/bulk-update', async (c) => {
  try {
    const db = c.env.DB;
    const body = await c.req.json();
    const { user_ids, department_id, role, status, password } = body;

    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return c.json({ error: 'ไม่พบรายการผู้ใช้ที่ต้องการแก้ไข' }, 400);
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (department_id !== undefined) {
      updates.push('department_id = ?');
      params.push(department_id ? Number(department_id) : null);
    }
    if (role !== undefined && role) {
      updates.push('role = ?');
      params.push(role);
    }
    if (status !== undefined && status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (password && password.trim()) {
      updates.push('password_hash = ?');
      params.push(password.trim());
    }

    if (updates.length === 0) {
      return c.json({ error: 'ไม่มีข้อมูลที่ต้องอัปเดต' }, 400);
    }

    const placeholders = user_ids.map(() => '?').join(',');
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id IN (${placeholders})`;
    const allParams = [...params, ...user_ids];

    await db.prepare(query).bind(...allParams).run();

    return c.json({ success: true, updatedCount: user_ids.length });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});


// Cloudflare Pages Functions Handler
export const onRequest = async (context: any) => {
  return app.fetch(context.request, context.env, context);
};

export default app;
