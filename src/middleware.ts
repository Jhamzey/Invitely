export const config = {
  matcher: ['/invite/:token*', '/vendors/:id*'],
};

const BOT_UA =
  /facebookexternalhit|WhatsApp|Twitterbot|LinkedInBot|Slackbot|TelegramBot|Discordbot/i;

// TODO Phase 2: confirm these two endpoints once the backend ships them.
const API_BASE = 'https://invitely-backend.onrender.com/api';

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default async function middleware(request: Request) {
  const ua = request.headers.get('user-agent') || '';
  if (!BOT_UA.test(ua)) {
    return; // real users -> let the normal Angular app handle it
  }

  const url = new URL(request.url);
  const parts = url.pathname.split('/').filter(Boolean); // ['invite', 'TOKEN'] or ['vendors', 'ID']

  let preview = {
    title: 'Invitely — Beautiful Digital Invitations',
    description:
      'Create beautiful digital invitations for weddings, birthdays and owambe.',
    image: `${url.origin}/social-preview.png`,
    url: url.toString(),
  };

  try {
    if (parts[0] === 'invite' && parts[1]) {
      const res = await fetch(`${API_BASE}/public/invite-preview/${parts[1]}`);
      if (res.ok) {
        const data = await res.json();
        preview = {
          title: `You're invited: ${data.eventName}`,
          description: data.eventDate
            ? `Join us on ${data.eventDate}. Tap to view your invitation.`
            : 'Tap to view your invitation.',
          image: data.coverImage || preview.image,
          url: url.toString(),
        };
      }
    } else if (parts[0] === 'vendors' && parts[1]) {
      const res = await fetch(`${API_BASE}/public/vendor-preview/${parts[1]}`);
      if (res.ok) {
        const data = await res.json();
        preview = {
          title: `${data.name} — Invitely Vendors`,
          description: data.description || 'View this vendor on Invitely.',
          image: data.coverImage || preview.image,
          url: url.toString(),
        };
      }
    }
  } catch {
    // network hiccup -> fall back to generic branding, never break the request
  }

  const html = `<!doctype html><html><head>
<meta charset="utf-8">
<title>${escapeHtml(preview.title)}</title>
<meta property="og:title" content="${escapeHtml(preview.title)}">
<meta property="og:description" content="${escapeHtml(preview.description)}">
<meta property="og:image" content="${escapeHtml(preview.image)}">
<meta property="og:url" content="${escapeHtml(preview.url)}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0;url=${escapeHtml(preview.url)}">
</head><body></body></html>`;

  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}