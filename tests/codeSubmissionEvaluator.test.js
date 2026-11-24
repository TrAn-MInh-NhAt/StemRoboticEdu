/**
 * Hệ thống Học tập STEM Robotic cấp Trung học
 * Bộ kịch bản kiểm thử đơn vị: codeSubmissionEvaluator.test.js
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  evaluateCodeSubmission,
  DEFAULT_TIME_LIMIT_MS,
  DEFAULT_PASS_THRESHOLD
} = require('../src/services/codeSubmissionEvaluator');

describe('Hệ thống Học tập STEM Robotic cấp Trung học - Kiểm thử đánh giá mã nguồn', () => {
  // Nhóm 1: Tính DiemTong & kích hoạt luồng KQBN.01
  describe('Nhóm 1: Tính DiemTong & kích hoạt luồng KQBN.01', () => {
    it('UT-01: Đạt 100% Test Case (trọng số 30, 30, 30) -> DiemTong = 9, TrangThaiBaiNop = CHO_DUYET_VIDEO', () => {
      const baiNop = {
        MaBaiNop: 'BN_001',
        MaHocSinh: 'HS_001',
        MaBaiTap: 'BT_ROBOT_01'
      };
      const danhSachKetQuaTest = [
        { MaTestCase: 'TC_01', TrongSoDiem: 30, ThoiGianChay_ms: 250, TrangThai: 'Pass' },
        { MaTestCase: 'TC_02', TrongSoDiem: 30, ThoiGianChay_ms: 320, TrangThai: 'Pass' },
        { MaTestCase: 'TC_03', TrongSoDiem: 40, ThoiGianChay_ms: 410, TrangThai: 'Pass' }
      ];

      const ketQua = evaluateCodeSubmission(baiNop, danhSachKetQuaTest);

      assert.equal(ketQua.DiemTong, 10);
      assert.equal(ketQua.DatDieuKienCode, true);
      assert.equal(ketQua.TrangThaiBaiNop, 'CHO_DUYET_VIDEO');
      assert.equal(ketQua.BuocTiepTheo, 'KQBN.01_KIEM_DUYET_VIDEO');
      assert.equal(ketQua.DanhSachLogLoi.length, 0);
    });

    it('UT-02: Biên hợp lệ đạt đúng ngưỡng 8.0 (đạt 80/100 trọng số) -> DiemTong = 8, DatDieuKienCode = true', () => {
      const baiNop = {
        MaBaiNop: 'BN_002',
        MaHocSinh: 'HS_002',
        MaBaiTap: 'BT_ROBOT_01'
      };
      const danhSachKetQuaTest = [
        { MaTestCase: 'TC_01', TrongSoDiem: 80, ThoiGianChay_ms: 300, TrangThai: 'Pass' },
        { MaTestCase: 'TC_02', TrongSoDiem: 20, ThoiGianChay_ms: 200, TrangThai: 'Fail', LogLoi: 'Sai lech goc quay dong co' }
      ];

      const ketQua = evaluateCodeSubmission(baiNop, danhSachKetQuaTest);

      assert.equal(ketQua.DiemTong, 8);
      assert.equal(ketQua.DatDieuKienCode, true);
      assert.equal(ketQua.TrangThaiBaiNop, 'CHO_DUYET_VIDEO');
      assert.equal(ketQua.BuocTiepTheo, 'KQBN.01_KIEM_DUYET_VIDEO');
    });

    it('UT-03: Biên dưới ngưỡng đạt 7.9 < 8.0 (đạt 79/100 trọng số) -> DiemTong = 7.9, TrangThaiBaiNop = CAN_SUA_CODE', () => {
      const baiNop = {
        MaBaiNop: 'BN_003',
        MaHocSinh: 'HS_003',
        MaBaiTap: 'BT_ROBOT_01'
      };
      const danhSachKetQuaTest = [
        { MaTestCase: 'TC_01', TrongSoDiem: 79, ThoiGianChay_ms: 400, TrangThai: 'Pass' },
        { MaTestCase: 'TC_02', TrongSoDiem: 21, ThoiGianChay_ms: 220, TrangThai: 'Fail', LogLoi: 'Toc do banh xe khong dong deu' }
      ];

      const ketQua = evaluateCodeSubmission(baiNop, danhSachKetQuaTest);

      assert.equal(ketQua.DiemTong, 7.9);
      assert.equal(ketQua.DatDieuKienCode, false);
      assert.equal(ketQua.TrangThaiBaiNop, 'CAN_SUA_CODE');
      assert.equal(ketQua.BuocTiepTheo, 'XLBN.03_SUA_VA_NOP_LAI');
    });

    it('UT-06: Làm tròn 2 chữ số thập phân với trọng số lẻ (1/3 trọng số, ngưỡng 5.0) -> DiemTong = 3.33, TrangThaiBaiNop = CAN_SUA_CODE', () => {
      const baiNop = {
        MaBaiNop: 'BN_006',
        MaHocSinh: 'HS_006',
        MaBaiTap: 'BT_ROBOT_02'
      };
      const danhSachKetQuaTest = [
        { MaTestCase: 'TC_01', TrongSoDiem: 10, ThoiGianChay_ms: 150, TrangThai: 'Pass' },
        { MaTestCase: 'TC_02', TrongSoDiem: 10, ThoiGianChay_ms: 180, TrangThai: 'Fail', LogLoi: 'Cam bien hong ngoai sai nguong' },
        { MaTestCase: 'TC_03', TrongSoDiem: 10, ThoiGianChay_ms: 160, TrangThai: 'Fail', LogLoi: 'Khong dung dung vat can' }
      ];
      const cauHinh = { nguongDiemDat: 5.0 };

      const ketQua = evaluateCodeSubmission(baiNop, danhSachKetQuaTest, cauHinh);

      assert.equal(ketQua.DiemTong, 3.33);
      assert.equal(ketQua.DatDieuKienCode, false);
      assert.equal(ketQua.TrangThaiBaiNop, 'CAN_SUA_CODE');
      assert.equal(ketQua.BuocTiepTheo, 'XLBN.03_SUA_VA_NOP_LAI');
    });
  });

  // Nhóm 2: Giới hạn thời gian Timeout & Lỗi biên dịch XLBN.02
  describe('Nhóm 2: Giới hạn thời gian Timeout & Lỗi biên dịch XLBN.02', () => {
    it('UT-04: Test Case 2 có ThoiGianChay_ms = 3500 > 3000 -> hủy điểm TC2, DanhSachLogLoi chứa Time Limit Exceeded, TrangThaiBaiNop = CAN_SUA_CODE', () => {
      const baiNop = {
        MaBaiNop: 'BN_004',
        MaHocSinh: 'HS_004',
        MaBaiTap: 'BT_ROBOT_01'
      };
      const danhSachKetQuaTest = [
        { MaTestCase: 'TC_01', TrongSoDiem: 50, ThoiGianChay_ms: 500, TrangThai: 'Pass' },
        { MaTestCase: 'TC_02', TrongSoDiem: 50, ThoiGianChay_ms: 3500, TrangThai: 'Pass' }
      ];

      const ketQua = evaluateCodeSubmission(baiNop, danhSachKetQuaTest);

      assert.equal(ketQua.DiemTong, 5);
      assert.equal(ketQua.DatDieuKienCode, false);
      assert.equal(ketQua.TrangThaiBaiNop, 'CAN_SUA_CODE');
      assert.equal(ketQua.BuocTiepTheo, 'XLBN.03_SUA_VA_NOP_LAI');
      assert.ok(ketQua.DanhSachLogLoi.some(log => log.includes('Time Limit Exceeded')));
    });

    it('UT-05: Test Case gặp TrangThai = Error với LogLoi = SyntaxError at line 12 -> DiemTong = 0, DanhSachLogLoi chứa SyntaxError at line 12', () => {
      const baiNop = {
        MaBaiNop: 'BN_005',
        MaHocSinh: 'HS_005',
        MaBaiTap: 'BT_ROBOT_01'
      };
      const danhSachKetQuaTest = [
        {
          MaTestCase: 'TC_01',
          TrongSoDiem: 100,
          ThoiGianChay_ms: 80,
          TrangThai: 'Error',
          LogLoi: 'SyntaxError at line 12'
        }
      ];

      const ketQua = evaluateCodeSubmission(baiNop, danhSachKetQuaTest);

      assert.equal(ketQua.DiemTong, 0);
      assert.equal(ketQua.DatDieuKienCode, false);
      assert.equal(ketQua.TrangThaiBaiNop, 'CAN_SUA_CODE');
      assert.equal(ketQua.BuocTiepTheo, 'XLBN.03_SUA_VA_NOP_LAI');
      assert.ok(ketQua.DanhSachLogLoi.some(log => log.includes('SyntaxError at line 12')));
    });
  });

  // Nhóm 3: Kiểm tra ngoại lệ dữ liệu đầu vào — Validation
  describe('Nhóm 3: Kiểm tra ngoại lệ dữ liệu đầu vào — Validation', () => {
    it('UT-07: Thiếu MaBaiNop (chuỗi rỗng) -> ném lỗi Thieu thong tin dinh danh bai nop', () => {
      const baiNop = {
        MaBaiNop: '',
        MaHocSinh: 'HS_007',
        MaBaiTap: 'BT_ROBOT_01'
      };
      const danhSachKetQuaTest = [
        { MaTestCase: 'TC_01', TrongSoDiem: 100, ThoiGianChay_ms: 100, TrangThai: 'Pass' }
      ];

      assert.throws(
        () => evaluateCodeSubmission(baiNop, danhSachKetQuaTest),
        { message: 'Thieu thong tin dinh danh bai nop' }
      );
    });

    it('UT-08: Mảng danhSachKetQuaTest rỗng [] -> ném lỗi Danh sach ket qua Test Case khong duoc rong', () => {
      const baiNop = {
        MaBaiNop: 'BN_008',
        MaHocSinh: 'HS_008',
        MaBaiTap: 'BT_ROBOT_01'
      };
      const danhSachKetQuaTest = [];

      assert.throws(
        () => evaluateCodeSubmission(baiNop, danhSachKetQuaTest),
        { message: 'Danh sach ket qua Test Case khong duoc rong' }
      );
    });

    it('UT-09: ThoiGianChay_ms = -50 -> ném lỗi ThoiGianChay_ms khong duoc nho hon 0', () => {
      const baiNop = {
        MaBaiNop: 'BN_009',
        MaHocSinh: 'HS_009',
        MaBaiTap: 'BT_ROBOT_01'
      };
      const danhSachKetQuaTest = [
        { MaTestCase: 'TC_01', TrongSoDiem: 100, ThoiGianChay_ms: -50, TrangThai: 'Pass' }
      ];

      assert.throws(
        () => evaluateCodeSubmission(baiNop, danhSachKetQuaTest),
        { message: 'ThoiGianChay_ms khong duoc nho hon 0' }
      );
    });

    it('UT-10: Tổng TrongSoDiem = 0 -> ném lỗi Tong TrongSoDiem cua bo Test Case phai lon hon 0', () => {
      const baiNop = {
        MaBaiNop: 'BN_010',
        MaHocSinh: 'HS_010',
        MaBaiTap: 'BT_ROBOT_01'
      };
      const danhSachKetQuaTest = [
        { MaTestCase: 'TC_01', TrongSoDiem: 0, ThoiGianChay_ms: 100, TrangThai: 'Pass' },
        { MaTestCase: 'TC_02', TrongSoDiem: 0, ThoiGianChay_ms: 120, TrangThai: 'Pass' }
      ];

      assert.throws(
        () => evaluateCodeSubmission(baiNop, danhSachKetQuaTest),
        { message: 'Tong TrongSoDiem cua bo Test Case phai lon hon 0' }
      );
    });
  });
});
