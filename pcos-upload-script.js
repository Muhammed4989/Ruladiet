/**
 * PCOS Course Video Upload Script
 * Injects a control panel into the Systeme.io editor page.
 * User selects the videos folder ONCE, then all 33 videos upload automatically.
 *
 * HOW TO USE:
 * 1. Open https://systeme.io/dashboard/page/41865775/edit in Chrome
 * 2. Open DevTools Console (F12)
 * 3. Paste this entire script and press Enter
 * 4. Click the red panel that appears → select the "pcos-course" folder
 * 5. Wait — all 33 videos will upload and pages will be saved automatically
 */

(function () {

  // =====================
  // LECTURE DATA
  // =====================
  const LECTURES = [
    { pageId: 41865775, file: '02 - ما معنى اللخبطة الحقيقية في الدورة الشهرية.mp4', title: 'ما معنى اللخبطة الحقيقية في الدورة الشهرية', desc: 'تعرفي على الفرق بين الاضطراب البسيط في الدورة الشهرية واللخبطة الحقيقية، وما هي العلامات التي يجب الانتباه إليها.' },
    { pageId: 41865867, file: '03 - أسباب اللخبطة في الدورة الشهرية.mp4', title: 'أسباب اللخبطة في الدورة الشهرية', desc: 'نستعرض في هذا الدرس الأسباب الشائعة والطبية التي تؤدي إلى عدم انتظام الدورة الشهرية.' },
    { pageId: 41865931, file: '04 - فشل المبايض المبكر.mp4', title: 'فشل المبايض المبكر', desc: 'ما هو فشل المبايض المبكر؟ كيف يتم تشخيصه؟ وما الفرق بينه وبين انقطاع الطمث الطبيعي؟' },
    { pageId: 41866126, file: '05 - هرمون الحليب.mp4', title: 'هرمون الحليب', desc: 'نتعرف على هرمون البرولاكتين ودوره في الجسم وأثره على الدورة الشهرية والخصوبة.' },
    { pageId: 41866166, file: '06 - هل يصيب ارتفاع هرمون الحليب الرجال ؟.mp4', title: 'هل يصيب ارتفاع هرمون الحليب الرجال ؟', desc: 'ارتفاع هرمون البرولاكتين لا يقتصر على النساء فقط. في هذا الدرس نشرح كيف يؤثر على الرجال أيضاً.' },
    { pageId: 41866625, file: '07 - ما هي متلازمة تكيس المبايض ؟.mp4', title: 'ما هي متلازمة تكيس المبايض', desc: 'تعريف شامل بمتلازمة تكيس المبايض (PCOS)، ما هي، كيف تحدث، ومن هن الأكثر عرضة للإصابة بها.' },
    { pageId: 41866637, file: '08 - أعراض تكيس المبايض.mp4', title: 'أعراض تكيس المبايض', desc: 'دليل شامل بالأعراض الجسدية والهرمونية التي قد تشير إلى الإصابة بمتلازمة تكيس المبايض.' },
    { pageId: 41866704, file: '09 - تشخيص تكيس المبايض.mp4', title: 'تشخيص تكيس المبايض', desc: 'كيف يتم تشخيص تكيس المبايض؟ ما هي المعايير الطبية المعتمدة والفحوصات اللازمة للتشخيص الصحيح؟' },
    { pageId: 41866705, file: '10 - هل التكيس يعني الإصابة بالمتلازمة.mp4', title: 'هل التكيس يعني الإصابة بالمتلازمة ؟', desc: 'هناك فرق مهم بين وجود أكياس على المبايض وبين الإصابة الفعلية بمتلازمة تكيس المبايض.' },
    { pageId: 41866707, file: '11 - معلومة لطيفة.mp4', title: 'معلومة لطيفة', desc: 'معلومة طبية مفيدة ومبسطة تخص تكيس المبايض تساعدك على فهم حالتك بشكل أفضل.' },
    { pageId: 41866708, file: '12 - متى نقوم بعمل التحاليل.mp4', title: 'متى نقوم بعمل التحاليل', desc: 'التوقيت الصحيح لإجراء تحاليل الهرمونات مهم جداً للحصول على نتائج دقيقة. اكتشفي متى وكيف.' },
    { pageId: 41866709, file: '13 - أسئلة شائعة حول التكيس.mp4', title: 'أسئلة شائعة حول التكيس', desc: 'إجابات واضحة ومبسطة على الأسئلة الأكثر شيوعاً حول تكيس المبايض.' },
    { pageId: 41866710, file: '14 - الفرق بين الكيس والتكيس.mp4', title: 'الفرق بين الكيس والتكيس', desc: 'ما الفرق بين الكيس البسيط على المبيض ومتلازمة تكيس المبايض؟ وضوح كامل في هذا الدرس.' },
    { pageId: 41866713, file: '15 - علاج التكيس.mp4', title: 'علاج التكيس', desc: 'استعراض شامل لخيارات علاج متلازمة تكيس المبايض، من التغييرات في نمط الحياة إلى العلاجات الطبية.' },
    { pageId: 41866714, file: '16 - الحبوب الهرمونية.mp4', title: 'الحبوب الهرمونية', desc: 'كيف تعمل حبوب منع الحمل الهرمونية في علاج تكيس المبايض؟ من تناسبها ومن لا تناسبها؟' },
    { pageId: 41866715, file: '17 - فئات يمنع عليها أخذ حبوب أستروجين مع بروجسترون.mp4', title: 'فئات يمنع عليها أخذ حبوب الاستروجين مع بروجسترون', desc: 'تعرفي على الحالات الصحية والفئات التي لا يُنصح فيها باستخدام حبوب الاستروجين مع البروجسترون.' },
    { pageId: 41866716, file: '18 - الأعراض الجانبية لحبوب منع الحمل.mp4', title: 'الأعراض الجانبية لحبوب منع الحمل', desc: 'ما هي الأعراض الجانبية المحتملة لحبوب منع الحمل وكيفية التعامل معها؟' },
    { pageId: 41866717, file: '19 - الفحوصات اللازمة قبل أخذ الحبوب.mp4', title: 'الفحوصات اللازمة قبل أخذ الحبوب', desc: 'قبل البدء بأي علاج هرموني، هناك فحوصات أساسية يجب إجراؤها. تعرفي عليها في هذا الدرس.' },
    { pageId: 41866718, file: '20 - أهم الأسئلة حول أدوية التكيس.mp4', title: 'أهم الأسئلة حول أدوية التكيس', desc: 'إجابات مفصلة على الأسئلة الأكثر تكراراً حول الأدوية المستخدمة في علاج تكيس المبايض.' },
    { pageId: 41866719, file: '21 - الميتفورمين والجلوكوفاج.mp4', title: 'الميتفورمين والجلوكوفاج', desc: 'كل ما تحتاجين معرفته عن الميتفورمين (الجلوكوفاج) ودوره في علاج تكيس المبايض ومقاومة الأنسولين.' },
    { pageId: 41866720, file: '22 - لو كان المنظم يسبب إقياء غثيان إسهال.mp4', title: 'لو كان المنظم يسبب إقياء أو غثيان أو إسهال', desc: 'نصائح عملية للتعامل مع الآثار الجانبية الهضمية للميتفورمين وكيفية التخفيف منها.' },
    { pageId: 41866721, file: '23 - متى تؤخذ المكملات وماهي.mp4', title: 'متى تؤخذ المكملات وماهي', desc: 'المكملات الغذائية التي ثبتت فائدتها في تكيس المبايض، ومتى يُفضَّل تناولها للحصول على أفضل النتائج.' },
    { pageId: 41866722, file: '24 - الوزن وعلاقته بتكيس المبايض.mp4', title: 'الوزن وعلاقته بتكيس المبايض', desc: 'شرح العلاقة بين الوزن الزائد وتكيس المبايض، وكيف يمكن أن يساعد إنقاص الوزن في تحسين الأعراض.' },
    { pageId: 41866724, file: '25 - كيف نعرف تناسب الوزن مع الطول.mp4', title: 'كيف نعرف تناسب الطول مع الوزن', desc: 'استخدام مؤشر كتلة الجسم (BMI) ومحيط الخصر لتقييم الوزن المثالي وصحة الجسم.' },
    { pageId: 41866725, file: '26 - هل مقاومة الأنسولين تمنع نزول الوزن.mp4', title: 'هل مقاومة الأنسولين تمنع نزول الوزن ؟', desc: 'فهم العلاقة بين مقاومة الأنسولين وصعوبة خسارة الوزن، وما يمكن فعله للتغلب على هذه العقبة.' },
    { pageId: 41866726, file: '27 - النظام الغذائي لتكيسات المبايض.mp4', title: 'النظام الغذائي لتكيسات المبايض', desc: 'دليل غذائي متكامل خاص بمريضات تكيس المبايض، يشمل الأطعمة المفيدة والتي يجب تجنبها.' },
    { pageId: 41866727, file: '28 - أدوية خسارة الوزن.mp4', title: 'أدوية خسارة الوزن', desc: 'نظرة شاملة على الأدوية المعتمدة لخسارة الوزن وكيفية استخدامها بالتزامن مع علاج التكيس.' },
    { pageId: 41866728, file: '29 - فئات يمنع عليها استخدام الإبر.mp4', title: 'فئات يمنع عليها استخدام الأبر', desc: 'من هي الفئات التي لا تستطيع استخدام حقن خسارة الوزن؟ معلومات مهمة قبل البدء بالعلاج.' },
    { pageId: 41866729, file: '30 - ملاحظات حول أدوية خسارة الوزن.mp4', title: 'ملاحظات حول أدوية خسارة الوزن', desc: 'تنبيهات وملاحظات مهمة يجب معرفتها عند استخدام أدوية خسارة الوزن لمريضات تكيس المبايض.' },
    { pageId: 41866730, file: '31 - الحمل وتكيس المبايض.mp4', title: 'الحمل وتكيس المبايض', desc: 'كيف يؤثر تكيس المبايض على الحمل والخصوبة، وما هي الخطوات التي تساعد على تحسين فرص الإنجاب.' },
    { pageId: 41866731, file: '32 - تحاليل التبويض.mp4', title: 'تحاليل التبويض', desc: 'الفحوصات والتحاليل التي تساعد على متابعة التبويض ومعرفة مدى انتظامه لمريضات تكيس المبايض.' },
    { pageId: 41866732, file: '33 - زيادة فرص الحمل بعلاج تكيس المبايض.mp4', title: 'زيادة فرص الحمل بعلاج تكيس المبايض', desc: 'استراتيجيات وعلاجات طبية تساعد على زيادة فرص الحمل لمريضات تكيس المبايض.' },
    { pageId: 41866733, file: '34 - أسئلة عامة حول الحمل والتبويض.mp4', title: 'أسئلة عامة حول الحمل والتبويض', desc: 'إجابات شاملة على أكثر الأسئلة شيوعاً حول الحمل والتبويض لمريضات تكيس المبايض.' },
  ];

  // =====================
  // PAGE CONTENT BUILDER
  // =====================
  function buildPageContent(pageId, title, videoUrl, description) {
    const BODY_ID = 'bcc19201-dc2a-4822-a3bd-278b9a123a62';
    const SEC_ID  = 'c1ean001-0001-0001-0001-000000000001';
    const ROW_ID  = 'c1ean002-0002-0002-0002-000000000002';
    const COL_ID  = 'c1ean003-0003-0003-0003-000000000003';
    const TTL_ID  = 'c1ean004-0004-0004-0004-000000000004';
    const VID_ID  = 'dc013265-4295-4a53-898e-d2c27e7c38f8';
    const DSC_ID  = 'c1ean005-0005-0005-0005-000000000005';

    const E = {};
    E[BODY_ID] = { id: BODY_ID, type: 'Body', childIds: [SEC_ID], background: [], mobileBackground: [], htmlAttrId: 'body-6138a7a7', isAffiliateBadgeVisible: false };
    E[SEC_ID]  = { id: SEC_ID, type: 'Section', childIds: [ROW_ID], parentId: BODY_ID, margin: {marginTop:0,marginLeft:0,marginRight:0,marginBottom:0}, mobileMargin: {marginTop:0,marginLeft:0,marginRight:0,marginBottom:0}, padding: {paddingTop:0,paddingLeft:0,paddingRight:0,paddingBottom:0}, mobilePadding: {paddingTop:0,paddingLeft:0,paddingRight:0,paddingBottom:0}, appearance: {mobile:true,desktop:true}, background: {backgroundSize:'initial',backgroundRepeat:'no-repeat',backgroundPosition:'50% 0%',backgroundAttachment:'initial'}, backgroundColor: 'rgba(255,255,255,1)', htmlAttrId: 'section-c1ean01', contentWidth: 'wide' };
    E[ROW_ID]  = { id: ROW_ID, type: 'Row', childIds: [COL_ID], parentId: SEC_ID, margin: {marginTop:0,marginLeft:0,marginRight:0,marginBottom:0}, mobileMargin: {marginTop:0,marginLeft:0,marginRight:0,marginBottom:20}, padding: {paddingTop:40,paddingLeft:40,paddingRight:40,paddingBottom:40}, mobilePadding: {paddingTop:15,paddingLeft:15,paddingRight:15,paddingBottom:20}, appearance: {mobile:true,desktop:true}, background: [], backgroundColor: 'rgba(255,255,255,1)', htmlAttrId: 'row-c1ean02' };
    E[COL_ID]  = { id: COL_ID, type: 'Column', size: 12, childIds: [TTL_ID, VID_ID, DSC_ID], parentId: ROW_ID, alignSelf: 'flex-start', htmlAttrId: 'column-c1ean03' };
    E[TTL_ID]  = { id: TTL_ID, type: 'Text', content: `<h2 style="text-align:right;direction:rtl">${title}</h2>`, fontSize: 26, mobileFontSize: 22, mobileLineHeight: 34, fontFamily: 'Mulish', fontWeight: '700', fontStyle: 'normal', textAlign: 'right', margin: {marginTop:0,marginLeft:0,marginRight:0,marginBottom:15}, mobileMargin: {marginTop:0,marginLeft:0,marginRight:0,marginBottom:15}, padding: {paddingTop:0,paddingLeft:0,paddingRight:0,paddingBottom:0}, mobilePadding: {paddingTop:0,paddingLeft:0,paddingRight:0,paddingBottom:0}, parentId: COL_ID, appearance: {mobile:true,desktop:true}, htmlAttrId: 'text-c1ean04', styles: [], options: [] };
    E[VID_ID]  = { id: VID_ID, type: 'Video', url: videoUrl, margin: {marginTop:0,marginLeft:0,marginRight:0,marginBottom:20}, mobileMargin: {marginTop:0,marginLeft:0,marginRight:0,marginBottom:20}, styles: [], options: [], parentId: COL_ID, appearance: {mobile:true,desktop:true}, htmlAttrId: 'video-b3f2bc26' };
    E[DSC_ID]  = { id: DSC_ID, type: 'Text', content: `<p style="text-align:right;direction:rtl">${description}</p>`, fontSize: 18, mobileFontSize: 16, mobileLineHeight: 26, fontFamily: 'Mulish', fontWeight: '400', fontStyle: 'normal', textAlign: 'right', margin: {marginTop:0,marginLeft:0,marginRight:0,marginBottom:0}, mobileMargin: {marginTop:0,marginLeft:0,marginRight:0,marginBottom:0}, padding: {paddingTop:0,paddingLeft:0,paddingRight:0,paddingBottom:0}, mobilePadding: {paddingTop:0,paddingLeft:0,paddingRight:0,paddingBottom:0}, parentId: COL_ID, appearance: {mobile:true,desktop:true}, htmlAttrId: 'text-c1ean05', styles: [], options: [] };

    return { entities: E, lastPopupNumber: 0, id: pageId, seo: { title, author: '', keywords: '', description, socialImage: null }, tracking: { footerCode: '', headerCode: '', facebookPixelId: '' }, globalColor: null, doubleOptIn: false, globalSettings: { linkColor: 'rgba(52, 113, 184, 1)', textColor: 'rgba(33, 37, 41, 1)', fontFamily: 'Mulish', textFontSize: '20px', mobileTextFontSize: '16px', fontStyle: 'normal', fontWeight: '400' } };
  }

  // =====================
  // API HELPERS
  // =====================
  async function uploadVideo(file) {
    // 1. Validate → get presigned S3 URL
    const vRes = await fetch('/dashboard/editor/api/files/validate-and-get-upload-options', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ editor_api_data_file: { fileName: file.name, fileSize: file.size, mimeType: 'video/mp4', isCommon: false } })
    });
    if (!vRes.ok) throw new Error(`validate failed: ${vRes.status}`);
    const { id, uploadOptions: o } = await vRes.json();

    // 2. Upload to S3
    const fd = new FormData();
    fd.append('key', o.key);
    fd.append('acl', o.acl);
    fd.append('Content-Type', o.contentType);
    fd.append('Cache-Control', o.cacheControl);
    fd.append('X-Amz-Date', o.date);
    fd.append('X-Amz-Credential', o.credential);
    fd.append('X-Amz-Algorithm', o.algorithm);
    fd.append('Policy', o.policy);
    fd.append('X-Amz-Signature', o.signature);
    fd.append('file', file);
    const uRes = await fetch(o.url, { method: 'POST', body: fd });
    if (!uRes.ok) throw new Error(`S3 upload failed: ${uRes.status}`);

    // 3. Activate
    await fetch(`/dashboard/editor/api/files/${id}/activate-file`, {
      method: 'POST', credentials: 'include',
      headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' }
    });

    return `${o.url}/${o.key}`;
  }

  async function savePage(pageId, title, videoUrl, desc) {
    const content = buildPageContent(pageId, title, videoUrl, desc);
    const res = await fetch(`/dashboard/editor/api/page/${pageId}/save/v2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content: JSON.stringify(content), locale: 'en' })
    });
    if (!res.ok) throw new Error(`save failed: ${res.status}`);
  }

  // =====================
  // UI PANEL
  // =====================
  // Remove existing panel if any
  document.getElementById('pcos-upload-panel')?.remove();

  const panel = document.createElement('div');
  panel.id = 'pcos-upload-panel';
  panel.style.cssText = 'position:fixed;top:60px;right:20px;width:360px;background:#fff;border:2px solid #c0392b;border-radius:10px;padding:15px;z-index:999999;font-family:Arial,sans-serif;font-size:13px;box-shadow:0 4px 25px rgba(0,0,0,0.35);direction:rtl;';
  panel.innerHTML = `
    <h3 style="margin:0 0 8px;color:#c0392b;font-size:15px;">🎬 رفع فيديوهات كورس تكيس المبايض</h3>
    <p style="margin:0 0 10px;color:#555;font-size:12px;">اضغط الزر، اختاري مجلد <strong>pcos-course</strong> مرة واحدة — سيتم رفع الـ 33 فيديو تلقائياً وحفظ كل صفحة.</p>
    <div id="pcos-progress" style="display:none;margin:10px 0;">
      <div id="pcos-current" style="color:#333;font-weight:bold;margin-bottom:5px;font-size:12px;"></div>
      <div style="background:#eee;border-radius:4px;height:10px;overflow:hidden;">
        <div id="pcos-bar" style="background:#c0392b;height:100%;width:0%;transition:width 0.4s;"></div>
      </div>
      <div id="pcos-pct" style="color:#999;font-size:11px;margin-top:3px;text-align:left;direction:ltr;"></div>
    </div>
    <div id="pcos-log" style="max-height:180px;overflow-y:auto;font-size:11px;line-height:1.6;margin-top:8px;border-top:1px solid #eee;padding-top:6px;"></div>
    <button id="pcos-btn" style="background:#c0392b;color:#fff;border:none;padding:10px;border-radius:6px;cursor:pointer;width:100%;font-size:13px;font-weight:bold;margin-top:12px;">📁 اختاري مجلد الفيديوهات</button>
    <button id="pcos-close" style="background:#eee;color:#555;border:none;padding:6px;border-radius:4px;cursor:pointer;width:100%;font-size:11px;margin-top:5px;">✕ إغلاق</button>
  `;
  document.body.appendChild(panel);

  const $log = panel.querySelector('#pcos-log');
  const $bar = panel.querySelector('#pcos-bar');
  const $cur = panel.querySelector('#pcos-current');
  const $pct = panel.querySelector('#pcos-pct');
  const $prg = panel.querySelector('#pcos-progress');
  const $btn = panel.querySelector('#pcos-btn');

  function log(msg, color) {
    const d = document.createElement('div');
    d.style.color = color || '#333';
    d.textContent = msg;
    $log.appendChild(d);
    $log.scrollTop = $log.scrollHeight;
  }

  panel.querySelector('#pcos-close').onclick = () => panel.remove();

  $btn.onclick = async () => {
    $btn.disabled = true;
    $btn.textContent = '⏳ جاري العمل...';
    $prg.style.display = 'block';

    let dirHandle;
    try {
      dirHandle = await window.showDirectoryPicker({ mode: 'read' });
    } catch (e) {
      log('❌ تم إلغاء اختيار المجلد', '#c0392b');
      $btn.disabled = false;
      $btn.textContent = '📁 اختاري مجلد الفيديوهات';
      return;
    }
    log('✅ تم اختيار المجلد', '#27ae60');

    let done = 0, errors = 0;
    for (let i = 0; i < LECTURES.length; i++) {
      const lec = LECTURES[i];
      $cur.textContent = `(${i + 1}/${LECTURES.length}) ${lec.title}`;
      $bar.style.width = Math.round((i / LECTURES.length) * 100) + '%';
      $pct.textContent = `${i + 1} / ${LECTURES.length}`;

      try {
        const fh = await dirHandle.getFileHandle(lec.file);
        const file = await fh.getFile();
        log(`⬆️  رفع: ${lec.title} (${(file.size / 1024 / 1024).toFixed(0)} MB)`, '#2980b9');
        const videoUrl = await uploadVideo(file);
        log(`💾 حفظ الصفحة...`, '#888');
        await savePage(lec.pageId, lec.title, videoUrl, lec.desc);
        log(`✅ ${lec.title}`, '#27ae60');
        done++;
      } catch (e) {
        log(`❌ خطأ: ${lec.title} — ${e.message}`, '#c0392b');
        errors++;
      }
    }

    $bar.style.width = '100%';
    $cur.textContent = errors === 0 ? '🎉 اكتمل بنجاح!' : `⚠️ اكتمل (${done} نجاح، ${errors} أخطاء)`;
    $pct.textContent = `${done}/${LECTURES.length}`;
    $btn.textContent = '✅ تم';
    log(`--- اكتمل: ${done}/${LECTURES.length} فيديو ---`, '#555');
  };

  console.log('%c✅ PCOS Upload Panel Ready — click the red panel to start', 'color:green;font-weight:bold;font-size:14px');

})();
