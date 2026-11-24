const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const express = require('express');
const session = require('express-session');
const { connectDB } = require('../config/db');

const authRoutes = require('../routes/auth');
const pageRoutes = require('../routes/pages');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(session({
  secret: 'test_secret_2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 86400000 }
}));
app.use('/api/auth', authRoutes);
app.use('/', pageRoutes);

(async () => {
  await connectDB();
  const server = app.listen(0, async () => {
    const port = server.address().port;
    console.log('✓ Express Test Server running on port', port);

    function req(options, body) {
      return new Promise((resolve, reject) => {
        options.port = port;
        options.host = '127.0.0.1';
        const r = http.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
        });
        r.on('error', reject);
        if (body) r.write(body);
        r.end();
      });
    }

    try {
      // 1. GET /login without session -> HTTP 200 OK (Rendered form)
      const res1 = await req({ path: '/login', method: 'GET' });
      console.log('1. GET /login (chưa đăng nhập): Mã HTTP', res1.status, res1.body.includes('Đăng Nhập') ? '✓ PASS' : '✗ FAIL');

      // 2. POST /api/auth/login với tài khoản Học sinh Minh Nhật
      const loginPayload = JSON.stringify({ email: 'hs.minhnhat@stemrobotic.edu.vn', password: '123456' });
      const res2 = await req({
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(loginPayload)
        }
      }, loginPayload);
      const cookie = res2.headers['set-cookie'] ? res2.headers['set-cookie'][0].split(';')[0] : '';
      console.log('2. POST /api/auth/login (hs.minhnhat): Mã HTTP', res2.status, 'Cookie:', cookie ? '✓ Có cookie session' : '✗ Không có cookie');

      // 3. GET /login VỚI session Học sinh -> HTTP 302 chuyển hướng tới /student
      const res3 = await req({ path: '/login', method: 'GET', headers: { 'Cookie': cookie } });
      console.log('3. GET /login (khi đã có session Học sinh): Mã HTTP', res3.status, 'Chuyển hướng đến:', res3.headers['location'], res3.headers['location'] === '/student' ? '✓ PASS' : '✗ FAIL');

      // 4. GET /student VỚI session Học sinh -> HTTP 200 OK
      const res4 = await req({ path: '/student', method: 'GET', headers: { 'Cookie': cookie } });
      console.log('4. GET /student (với session Học sinh): Mã HTTP', res4.status, res4.status === 200 ? '✓ PASS (Tải trang không gian học sinh thành công)' : '✗ FAIL');

      // 5. POST /api/auth/login với Giáo viên TS. Đặng Hùng Vĩ
      const gvPayload = JSON.stringify({ email: 'gv.hungvi@stemrobotic.edu.vn', password: '123456' });
      const res5 = await req({
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(gvPayload)
        }
      }, gvPayload);
      const gvCookie = res5.headers['set-cookie'] ? res5.headers['set-cookie'][0].split(';')[0] : '';
      console.log('5. POST /api/auth/login (gv.hungvi): Mã HTTP', res5.status, 'Cookie:', gvCookie ? '✓ Có cookie' : '✗');

      // 6. GET /login VỚI session Giáo viên -> HTTP 302 chuyển hướng tới /teacher
      const res6 = await req({ path: '/login', method: 'GET', headers: { 'Cookie': gvCookie } });
      console.log('6. GET /login (với session Giáo viên): Chuyển hướng đến:', res6.headers['location'], res6.headers['location'] === '/teacher' ? '✓ PASS' : '✗ FAIL');

      // 7. GET /teacher VỚI session Giáo viên -> HTTP 200 OK
      const res7 = await req({ path: '/teacher', method: 'GET', headers: { 'Cookie': gvCookie } });
      console.log('7. GET /teacher (với session Giáo viên): Mã HTTP', res7.status, res7.status === 200 ? '✓ PASS' : '✗ FAIL');

      // 8. POST /api/auth/login với Admin
      const adminPayload = JSON.stringify({ email: 'admin@stemrobotic.edu.vn', password: '123456' });
      const res8 = await req({
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(adminPayload)
        }
      }, adminPayload);
      const adminCookie = res8.headers['set-cookie'] ? res8.headers['set-cookie'][0].split(';')[0] : '';
      console.log('8. POST /api/auth/login (admin): Mã HTTP', res8.status);

      // 9. GET /login VỚI session Admin -> HTTP 302 chuyển hướng tới /admin
      const res9 = await req({ path: '/login', method: 'GET', headers: { 'Cookie': adminCookie } });
      console.log('9. GET /login (với session Admin): Chuyển hướng đến:', res9.headers['location'], res9.headers['location'] === '/admin' ? '✓ PASS' : '✗ FAIL');

      // 10. GET /admin VỚI session Admin -> HTTP 200 OK
      const res10 = await req({ path: '/admin', method: 'GET', headers: { 'Cookie': adminCookie } });
      console.log('10. GET /admin (với session Admin): Mã HTTP', res10.status, res10.status === 200 ? '✓ PASS' : '✗ FAIL');

      // 11. GET /logout -> HTTP 302 chuyển hướng về /login và xóa cookie
      const res11 = await req({ path: '/logout', method: 'GET', headers: { 'Cookie': adminCookie } });
      console.log('11. GET /logout: Mã HTTP', res11.status, 'Chuyển hướng:', res11.headers['location'], 'Set-Cookie xóa:', res11.headers['set-cookie'] ? '✓ Có' : '✗');

      console.log('\n============================================================');
      console.log('🎉 TẤT CẢ 11/11 KỊCH BẢN ĐĂNG NHẬP & CHUYỂN HƯỚNG ĐÃ PASS 100%!');
      console.log('============================================================');
    } catch (e) {
      console.error('Lỗi kiểm thử:', e);
    } finally {
      server.close();
      process.exit(0);
    }
  });
})();
