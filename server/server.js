require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express = require('express');
const path = require('path');
const session = require('express-session');
const { connectDB } = require('./config/db');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const communityRoutes = require('./routes/community');
const reportsRoutes = require('./routes/reports');
const submissionRoutes = require('./routes/submissions');
const examRoutes = require('./routes/exam');
const materialsRoutes = require('./routes/materials');
const supportRoutes = require('./routes/support');
const judgeProxyRoutes = require('./routes/judgeProxy');
const pageRoutes = require('./routes/pages');

const app = express();
const PORT = process.env.PORT || 80;

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'stemrobotic_secret_2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 86400000 }
}));

// Static files
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/css', express.static(path.join(__dirname, '../public/css')));
app.use('/js', express.static(path.join(__dirname, '../public/js')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/judge', judgeProxyRoutes);
app.use('/api', submissionRoutes);
app.use('/', pageRoutes);

// Bắt lỗi toàn cục ngăn server sập đột ngột (Unhandled Exceptions / Rejections)
process.on('uncaughtException', (err) => {
  console.error('⚠️ [Cảnh báo Hệ thống] Đã bắt ngoại lệ UncaughtException:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ [Cảnh báo Hệ thống] Đã bắt UnhandledRejection:', reason);
});

// Start server after DB connection
(async () => {
  try {
    await connectDB();
    console.log('✅ Kết nối SQL Server thành công!');
    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Lỗi kết nối SQL Server:', err.message);
    process.exit(1);
  }
})();
