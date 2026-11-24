/**
 * Hệ thống Học tập STEM Robotic cấp Trung học
 * Mô-đun đánh giá mã nguồn và kết quả kiểm thử bài nộp (XLBN.02 - XLBN.03 - KQBN.01)
 */

const DEFAULT_TIME_LIMIT_MS = 3000;
const DEFAULT_PASS_THRESHOLD = 8.0;

/**
 * Đánh giá kết quả kiểm thử bài nộp mã nguồn
 * @param {Object} baiNop - Thông tin bài nộp (MaBaiNop, MaHocSinh, MaBaiTap)
 * @param {Array} danhSachKetQuaTest - Danh sách kết quả chạy từng test case
 * @param {Object} cauHinh - Cấu hình tùy chọn (gioiHanThoiGian_ms, nguongDiemDat)
 * @returns {Object} Kết quả đánh giá bài nộp
 */
function evaluateCodeSubmission(baiNop, danhSachKetQuaTest, cauHinh = {}) {
  // 1. Kiểm tra dữ liệu đầu vào (Validation)
  if (
    !baiNop ||
    typeof baiNop !== 'object' ||
    !baiNop.MaBaiNop ||
    (typeof baiNop.MaBaiNop === 'string' && baiNop.MaBaiNop.trim() === '') ||
    !baiNop.MaHocSinh ||
    (typeof baiNop.MaHocSinh === 'string' && baiNop.MaHocSinh.trim() === '') ||
    !baiNop.MaBaiTap ||
    (typeof baiNop.MaBaiTap === 'string' && baiNop.MaBaiTap.trim() === '')
  ) {
    throw new Error('Thieu thong tin dinh danh bai nop');
  }

  if (!Array.isArray(danhSachKetQuaTest) || danhSachKetQuaTest.length === 0) {
    throw new Error('Danh sach ket qua Test Case khong duoc rong');
  }

  let tongTrongSo = 0;
  for (const item of danhSachKetQuaTest) {
    if (typeof item.ThoiGianChay_ms !== 'number' || item.ThoiGianChay_ms < 0) {
      throw new Error('ThoiGianChay_ms khong duoc nho hon 0');
    }
    if (typeof item.TrongSoDiem !== 'number' || item.TrongSoDiem < 0) {
      throw new Error('TrongSoDiem khong duoc nho hon 0');
    }
    tongTrongSo += item.TrongSoDiem;
  }

  if (tongTrongSo <= 0) {
    throw new Error('Tong TrongSoDiem cua bo Test Case phai lon hon 0');
  }

  // 2. Thiết lập cấu hình đánh giá
  const gioiHanThoiGian_ms =
    typeof cauHinh.gioiHanThoiGian_ms === 'number'
      ? cauHinh.gioiHanThoiGian_ms
      : DEFAULT_TIME_LIMIT_MS;

  const nguongDiemDat =
    typeof cauHinh.nguongDiemDat === 'number'
      ? cauHinh.nguongDiemDat
      : DEFAULT_PASS_THRESHOLD;

  let trongSoDat = 0;
  let coQuaThoiGian = false;
  let coLoiThucThi = false;
  const DanhSachLogLoi = [];
  const ChiTietKetQua = [];

  // 3. Xử lý từng kết quả kiểm thử
  for (const item of danhSachKetQuaTest) {
    const maTC = item.MaTestCase || 'UNKNOWN_TC';
    let datTestCase = false;

    if (item.ThoiGianChay_ms > gioiHanThoiGian_ms) {
      coQuaThoiGian = true;
      DanhSachLogLoi.push(
        `[${maTC}] Time Limit Exceeded: Thoi gian chay ${item.ThoiGianChay_ms}ms vuot qua gioi han ${gioiHanThoiGian_ms}ms`
      );
    }

    if (item.TrangThai === 'Error') {
      coLoiThucThi = true;
      const chiTietLoi = item.LogLoi ? item.LogLoi : 'Runtime/Syntax Error';
      DanhSachLogLoi.push(`[${maTC}] ${chiTietLoi}`);
    } else if (item.TrangThai === 'Fail') {
      const chiTietLoi = item.LogLoi ? item.LogLoi : 'Ket qua khong khop';
      DanhSachLogLoi.push(`[${maTC}] ${chiTietLoi}`);
    } else if (item.TrangThai === 'Pass' && item.ThoiGianChay_ms <= gioiHanThoiGian_ms) {
      datTestCase = true;
      trongSoDat += item.TrongSoDiem;
    }

    ChiTietKetQua.push({
      MaTestCase: maTC,
      TrangThai: item.TrangThai,
      ThoiGianChay_ms: item.ThoiGianChay_ms,
      TrongSoDiem: item.TrongSoDiem,
      Dat: datTestCase
    });
  }

  // 4. Tính điểm tổng và quy đổi thang điểm 10
  const DiemTong = Math.round((trongSoDat / tongTrongSo) * 10 * 100) / 100;

  // 5. Trigger điều hướng trạng thái bài nộp
  const DatDieuKienCode = !coQuaThoiGian && !coLoiThucThi && DiemTong >= nguongDiemDat;
  const TrangThaiBaiNop = DatDieuKienCode ? 'CHO_DUYET_VIDEO' : 'CAN_SUA_CODE';
  const BuocTiepTheo = DatDieuKienCode
    ? 'KQBN.01_KIEM_DUYET_VIDEO'
    : 'XLBN.03_SUA_VA_NOP_LAI';

  return {
    MaBaiNop: baiNop.MaBaiNop,
    MaHocSinh: baiNop.MaHocSinh,
    MaBaiTap: baiNop.MaBaiTap,
    DiemTong,
    DatDieuKienCode,
    TrangThaiBaiNop,
    BuocTiepTheo,
    DanhSachLogLoi,
    ChiTietKetQua
  };
}

module.exports = {
  evaluateCodeSubmission,
  DEFAULT_TIME_LIMIT_MS,
  DEFAULT_PASS_THRESHOLD
};
