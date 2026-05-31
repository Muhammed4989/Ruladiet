module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { email, firstName, lastName } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const apiKey = process.env.SYSTEME_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

    try {
        const response = await fetch('https://api.systeme.io/api/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
            body: JSON.stringify({ email, firstName: firstName || '', lastName: lastName || '' })
        });

        if (response.ok) {
            return res.status(200).json({ success: true, message: 'تم الاشتراك بنجاح' });
        }

        const data = await response.json();
        let message = 'حدث خطأ. حاول مرة أخرى لاحقاً.';
        if (data.violations && data.violations.length > 0) {
            const msg = data.violations[0].message;
            if (msg.includes('invalid') || msg.includes('Invalid')) {
                message = 'عنوان البريد الإلكتروني غير صالح. يرجى التحقق من الإملاء.';
            } else if (msg.includes('already used') || msg.includes('already')) {
                message = 'هذا البريد الإلكتروني مسجل بالفعل.';
            } else {
                message = msg;
            }
        } else if (data.detail) {
            message = data.detail;
        }
        return res.status(200).json({ success: false, message });
    } catch (error) {
        return res.status(200).json({ success: false, message: 'حدث خطأ في الاتصال. حاول مرة أخرى.' });
    }
};
