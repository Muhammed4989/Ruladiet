/**
 * Systeme.io – Bulk Course Enrollment Script
 *
 * SETUP:
 *   Windows:  set SYSTEME_API_KEY=your_key_here
 *   Mac/Linux: export SYSTEME_API_KEY=your_key_here
 *
 * USAGE:
 *   node enroll-users.js --list-courses          → عرض كل الكورسات مع الـ ID
 *   node enroll-users.js --course massar         → تسجيل طلاب المسار الصحي
 *   node enroll-users.js --course pcos           → تسجيل طلاب التعافي من تكيس المبايض
 */

const API_KEY  = process.env.SYSTEME_API_KEY;
const BASE_URL = 'https://api.systeme.io/api';

// ── Course IDs ────────────────────────────────────────────────────────────────
const COURSES = {
  massar: {
    id: 633013,
    name: 'المسار الصحي',
    emails: [
      'So.so2005@yahoo.com',
      'ghazal.jreda@gmail.com',
      'mimona232@gmail.com',
      'alaatalji@icloud.com',
      'alaatalji@gmail.com',
      'alzoubernz@gmail.com',
      'teebireham@gmail.com',
      'mennatullah.ahmad@gmail.com',
      'huda-Baroudi@hotmail.com',
      'Raghad.shannon1996@hotmail.com',
      'heba.heba98.ha@gmail.com',
      'amaloman968@gmail.com',
      'tibatalib81@gmail.com',
      'ayakseibeh@gmail.com',
      'eng.rula.alloush@live.com',
      'dietitianrula@gmail.com',
    ]
  },
  pcos: {
    id: 636274,
    name: 'التعافي من تكيس المبايض',
    emails: [
      'zeinaothman2@gmail.com',
      'ranadardar6@gmail.com',
      'muhraindiana@gmail.com',
      'zzdd237@yahoo.com',
      'Phsarra@hotmail.com',
      'ranom.zedano@gmail.com',
      'otabshi@gmail.com',
    ]
  },
  emotional: {
    id: null, // ← شغّل --list-courses وضع هنا ID كورس "التعافي من الشهية الانفعالية"
    name: 'التعافي من الشهية الانفعالية',
    emails: [
      'shahd.ya@molhamteam.com',
      'eng.rula.alloush@live.com',
      'huda.sm88@gmail.com',
      'moza.n.alkuwari@gmail.com',
    ]
  }
};
// ─────────────────────────────────────────────────────────────────────────────

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'X-API-Key': API_KEY }
  });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify(body)
  });
  return { status: res.status, data: await res.json().catch(() => ({})) };
}

async function findContactByEmail(email) {
  const data = await apiGet(`/contacts?email=${encodeURIComponent(email)}&limit=10`);
  const items = data.items || [];
  return items.find(c => c.email.toLowerCase() === email.toLowerCase()) || null;
}

async function createContact(email) {
  const { status, data } = await apiPost('/contacts', { email, locale: 'ar' });
  if (status === 201) return data;
  throw new Error(`إنشاء جهة اتصال فشل ${status}: ${JSON.stringify(data)}`);
}

// ── Step 1: List courses ──────────────────────────────────────────────────────

async function listCourses() {
  console.log('\n📚 جلب الكورسات من Systeme.io...\n');
  const data = await apiGet('/school/courses?limit=50');
  const courses = data.items || [];
  if (!courses.length) {
    console.log('لا توجد كورسات.');
    return;
  }
  console.log('ID\t\tالاسم');
  console.log('──────────────────────────────────');
  courses.forEach(c => console.log(`${c.id}\t\t${c.name}`));
  console.log('\n✅ انسخ ID المطلوب وضعه في COURSES أعلاه.');
}

// ── Step 2: Enroll users ──────────────────────────────────────────────────────

async function enrollAll(courseKey) {
  const course = COURSES[courseKey];
  if (!course) {
    console.error(`❌ كورس غير معروف: ${courseKey}. الخيارات: massar, pcos, emotional`);
    process.exit(1);
  }
  if (!course.id) {
    console.error(`❌ ID كورس "${course.name}" فارغ. شغّل أولاً: node enroll-users.js --list-courses`);
    process.exit(1);
  }

  console.log(`\n🎓 تسجيل ${course.emails.length} مستخدم في: ${course.name} (ID: ${course.id})\n`);

  let ok = 0, fail = 0;

  for (const email of course.emails) {
    try {
      // 1. Find or create contact
      let contact = await findContactByEmail(email);
      if (!contact) {
        console.log(`➕ ${email} — إنشاء جهة اتصال جديدة...`);
        contact = await createContact(email);
        console.log(`   ✅ تم الإنشاء (ID: ${contact.id})`);
        await sleep(600);
      }

      // 2. Enroll in course
      const { status, data } = await apiPost(`/school/courses/${course.id}/enrollments`, {
        contactId: contact.id,
        accessType: 'full_access'
      });

      if (status === 201 || status === 200) {
        console.log(`✅ ${email}`);
        ok++;
      } else if (status === 422) {
        console.log(`⚠️  ${email} — مسجّل مسبقاً`);
        ok++;
      } else {
        console.log(`❌ ${email} — خطأ ${status}: ${JSON.stringify(data)}`);
        fail++;
      }
    } catch (err) {
      console.log(`❌ ${email} — ${err.message}`);
      fail++;
    }

    await sleep(1100);
  }

  console.log(`\n──────────────────────────────────`);
  console.log(`✅ نجح: ${ok}   ❌ فشل: ${fail}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

if (!API_KEY) {
  console.error('❌ SYSTEME_API_KEY غير موجود. اضبطه أولاً كمتغير بيئي.');
  process.exit(1);
}

const args = process.argv.slice(2);

if (args.includes('--list-courses')) {
  listCourses().catch(console.error);
} else {
  const courseIdx = args.indexOf('--course');
  const courseKey = courseIdx !== -1 ? args[courseIdx + 1] : null;
  if (!courseKey) {
    console.error('❌ حدد الكورس: node enroll-users.js --course massar   أو   --course pcos   أو   --course emotional');
    process.exit(1);
  }
  enrollAll(courseKey).catch(console.error);
}
