// Serverless function: receives a booking from the form and emails it to Julie via Resend.
// The Resend API key is read from the RESEND_API_KEY environment variable set in Vercel.

const TO_EMAIL = 'juliekokaliares@gmail.com';
const FROM_EMAIL = 'Julie Durrant Music Studio <bookings@juliedurrantmusic.com>';

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Email is not configured yet.' });
  }

  // Body may arrive parsed (object) or as a raw string depending on the runtime.
  let data = req.body;
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch { data = {}; }
  }
  data = data || {};

  const name = (data.name || '').toString().trim();
  const phone = (data.phone || '').toString().trim();
  const email = (data.email || '').toString().trim();
  const age = (data.age || '').toString().trim();
  const instrument = (data.instrument || '').toString().trim();
  const days = (data.days || '').toString().trim();
  const time = (data.time || '').toString().trim();
  const message = (data.message || '').toString().trim();

  if (!name || !phone || !email) {
    return res.status(400).json({ error: 'Please fill in your name, phone, and email.' });
  }

  const html = `
    <h2>New lesson booking</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Student age:</strong> ${escapeHtml(age) || '—'}</p>
    <hr/>
    <p><strong>Instrument:</strong> ${escapeHtml(instrument) || '—'}</p>
    <p><strong>Preferred days:</strong> ${escapeHtml(days) || '—'}</p>
    <p><strong>Preferred time:</strong> ${escapeHtml(time) || '—'}</p>
    <hr/>
    <p><strong>Message:</strong><br/>${escapeHtml(message) || '—'}</p>
  `;

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        reply_to: email,
        subject: `New lesson booking from ${name}`,
        html,
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      console.error('Resend error:', resp.status, detail);
      return res.status(502).json({ error: 'Could not send the booking right now.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Send failed:', err);
    return res.status(500).json({ error: 'Something went wrong sending the booking.' });
  }
}
