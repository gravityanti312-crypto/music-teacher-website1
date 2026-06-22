// Serverless function: receives a booking from the form, emails Julie a styled
// notification AND sends the student a styled confirmation, both via Resend.
// The Resend API key is read from the RESEND_API_KEY environment variable in Vercel.

const TO_EMAIL = 'juliekokaliares@gmail.com';
const FROM_EMAIL = 'Julie Durrant Music Studio <bookings@juliedurrantmusic.com>';
const STUDIO_PHONE = '480-292-4799';

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Shared branded email shell (navy & gold, matches the website).
function emailShell(innerHtml) {
  return `
  <div style="margin:0;padding:0;background:#f1ece1;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1ece1;padding:28px 12px;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fbf6ec;border-radius:18px;overflow:hidden;border:1px solid #e7ddc6;box-shadow:0 14px 40px rgba(15,29,53,0.12);">

          <!-- Header -->
          <tr><td style="background:#0f1d35;padding:30px 32px;text-align:center;">
            <div style="display:inline-block;width:46px;height:46px;line-height:46px;border-radius:50%;background:linear-gradient(135deg,#e2c989,#c9a961);color:#0f1d35;font-size:22px;font-weight:bold;">&#9834;</div>
            <div style="margin-top:12px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#f7f1e6;letter-spacing:0.3px;">
              Julie Durrant <span style="color:#e2c989;font-style:italic;">Music Studio</span>
            </div>
          </td></tr>

          <!-- Body -->
          <tr><td style="padding:34px 32px;font-family:Arial,Helvetica,sans-serif;color:#2b2b2b;font-size:15px;line-height:1.6;">
            ${innerHtml}
          </td></tr>

          <!-- Footer -->
          <tr><td style="background:#0f1d35;padding:22px 32px;text-align:center;font-family:Arial,Helvetica,sans-serif;color:#aeb6c6;font-size:12px;line-height:1.6;">
            <div style="color:#e2c989;font-family:Georgia,serif;font-size:15px;margin-bottom:4px;">Julie Durrant Music Studio</div>
            Piano &middot; Violin &nbsp;|&nbsp; Mesa, Arizona<br/>
            <a href="tel:${STUDIO_PHONE.replace(/[^0-9]/g, '')}" style="color:#e2c989;text-decoration:none;">${STUDIO_PHONE}</a>
          </td></tr>

        </table>
      </td></tr>
    </table>
  </div>`;
}

function row(label, value) {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #ece3d0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8a7c5c;text-transform:uppercase;letter-spacing:0.5px;width:42%;vertical-align:top;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #ece3d0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#2b2b2b;font-weight:600;">${value || '&mdash;'}</td>
    </tr>`;
}

// Email #1 — notification to Julie
function julieEmail(d) {
  const inner = `
    <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#a8893f;">New Lesson Booking</p>
    <h1 style="margin:0 0 22px;font-family:Georgia,serif;font-size:26px;color:#0f1d35;font-weight:normal;">${escapeHtml(d.name)} wants to book a lesson &#127929;</h1>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${row('Name', escapeHtml(d.name))}
      ${row('Phone', `<a href="tel:${escapeHtml(d.phone).replace(/[^0-9]/g, '')}" style="color:#0f1d35;text-decoration:none;">${escapeHtml(d.phone)}</a>`)}
      ${row('Email', `<a href="mailto:${escapeHtml(d.email)}" style="color:#0f1d35;text-decoration:none;">${escapeHtml(d.email)}</a>`)}
      ${row('Student age', escapeHtml(d.age))}
      ${row('Instrument', escapeHtml(d.instrument))}
      ${row('Preferred days', escapeHtml(d.days))}
      ${row('Preferred time', escapeHtml(d.time))}
    </table>

    ${d.message ? `
      <div style="background:#f3ecdb;border-left:3px solid #c9a961;border-radius:8px;padding:16px 18px;margin-bottom:8px;">
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.5px;text-transform:uppercase;color:#8a7c5c;margin-bottom:6px;">Their message</div>
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#2b2b2b;line-height:1.6;">${escapeHtml(d.message)}</div>
      </div>` : ''}

    <p style="margin:24px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8a7c5c;">Just hit reply to email ${escapeHtml(d.name)} back &mdash; this message replies straight to them.</p>
  `;
  return emailShell(inner);
}

// Email #2 — confirmation to the student/parent
function studentEmail(d) {
  const inner = `
    <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#a8893f;">Request Received</p>
    <h1 style="margin:0 0 18px;font-family:Georgia,serif;font-size:26px;color:#0f1d35;font-weight:normal;">Thank you, ${escapeHtml(d.name)}! &#127881;</h1>

    <p style="margin:0 0 18px;">Your lesson request has been sent to Julie. She'll personally reach out <strong>within 24 hours</strong> to confirm your time and share the home studio address here in Mesa, Arizona.</p>

    <div style="background:#f3ecdb;border-radius:12px;padding:20px 22px;margin:0 0 24px;">
      <div style="font-family:Georgia,serif;font-size:16px;color:#0f1d35;margin-bottom:12px;">Here's what you requested:</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${row('Instrument', escapeHtml(d.instrument))}
        ${row('Preferred days', escapeHtml(d.days))}
        ${row('Preferred time', escapeHtml(d.time))}
      </table>
    </div>

    <p style="margin:0 0 22px;">Can't wait? You're always welcome to call or text Julie directly:</p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 6px;">
      <tr><td style="border-radius:50px;background:linear-gradient(135deg,#e2c989,#c9a961);">
        <a href="tel:${STUDIO_PHONE.replace(/[^0-9]/g, '')}" style="display:inline-block;padding:14px 34px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#0f1d35;text-decoration:none;">&#128222; ${STUDIO_PHONE}</a>
      </td></tr>
    </table>

    <p style="margin:26px 0 0;font-family:Georgia,serif;font-style:italic;font-size:16px;color:#0f1d35;text-align:center;">See you at the piano soon! &#127925;</p>
  `;
  return emailShell(inner);
}

async function sendEmail(apiKey, payload) {
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const detail = await resp.text();
    throw new Error(`Resend ${resp.status}: ${detail}`);
  }
  return resp.json();
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

  const d = {
    name: (data.name || '').toString().trim(),
    phone: (data.phone || '').toString().trim(),
    email: (data.email || '').toString().trim(),
    age: (data.age || '').toString().trim(),
    instrument: (data.instrument || '').toString().trim(),
    days: (data.days || '').toString().trim(),
    time: (data.time || '').toString().trim(),
    message: (data.message || '').toString().trim(),
  };

  if (!d.name || !d.phone || !d.email) {
    return res.status(400).json({ error: 'Please fill in your name, phone, and email.' });
  }

  try {
    // 1) Notify Julie (required). Reply goes straight to the student.
    await sendEmail(apiKey, {
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      reply_to: d.email,
      subject: `New lesson booking from ${d.name}`,
      html: julieEmail(d),
    });
  } catch (err) {
    console.error('Failed to notify Julie:', err);
    return res.status(502).json({ error: 'Could not send the booking right now.' });
  }

  // 2) Confirmation to the student (best-effort — don't fail the booking if this hiccups).
  try {
    await sendEmail(apiKey, {
      from: FROM_EMAIL,
      to: [d.email],
      reply_to: TO_EMAIL,
      subject: 'We got your request — Julie Durrant Music Studio',
      html: studentEmail(d),
    });
  } catch (err) {
    console.error('Failed to send student confirmation:', err);
  }

  return res.status(200).json({ ok: true });
}
