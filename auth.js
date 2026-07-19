// 共通認証・セッション管理スクリプト
// ※ デモ/プロトタイプ用の簡易実装です。Supabase匿名キーはブラウザに埋め込まれており、
//   本番運用に耐えるセキュリティレベルではありません（パスワードはSHA-256ハッシュのみ）。

var SUPABASE_URL = 'https://aljqmldikmnnprxucnva.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsanFtbGRpa21ubnByeHVjbnZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0NjczMjgsImV4cCI6MjEwMDA0MzMyOH0.D5pB45t0QUE3hj0WtO8zxufVqKVVOfJhowHpbAUEJrE';
var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

var LMS_SESSION_KEY = 'lms_session';

function sha256Hex(text) {
  var enc = new TextEncoder().encode(text);
  return crypto.subtle.digest('SHA-256', enc).then(function (buf) {
    var bytes = Array.from(new Uint8Array(buf));
    return bytes.map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  });
}

function saveSession(user) {
  localStorage.setItem(LMS_SESSION_KEY, JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    company_id: user.company_id,
    company_name: user.company_name || null
  }));
}

function getSession() {
  var raw = localStorage.getItem(LMS_SESSION_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

function clearSession() {
  localStorage.removeItem(LMS_SESSION_KEY);
}

// ページ読み込み時にロールをチェックし、許可されていなければログイン画面へ戻す
function requireRole(allowedRoles) {
  var session = getSession();
  if (!session || allowedRoles.indexOf(session.role) === -1) {
    window.location.href = 'index.html';
    return null;
  }
  return session;
}

function roleHomePage(role) {
  if (role === 'company_admin') return 'admin.html';
  if (role === 'operator') return 'operator.html';
  return 'mypage.html';
}

function logout() {
  var session = getSession();
  var redirectTo = 'index.html';
  if (session && session.role === 'company_admin') redirectTo = 'admin-login.html';
  if (session && session.role === 'operator') redirectTo = 'operator-login.html';
  clearSession();
  window.location.href = redirectTo;
}
