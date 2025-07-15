// api/charge.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { token_id, amount } = req.body;
  const secretKey = process.env.XENDIT_SECRET_KEY;

  if (!secretKey) {
    return res.status(500).json({ success: false, error: 'Missing XENDIT_SECRET_KEY env var' });
  }

  const chargePayload = {
    token_id,
    external_id: 'booking-' + Date.now(),
    amount: parseInt(amount, 10),
    capture: true, // set to false if you want to pre-authorize instead of immediately charging
  };

  try {
    const response = await fetch('https://api.xendit.co/credit_card_charges', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(secretKey + ':').toString('base64'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chargePayload),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: data });
    }

    res.status(200).json({ success: true, charge: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
