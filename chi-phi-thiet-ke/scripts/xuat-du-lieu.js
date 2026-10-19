#!/usr/bin/env node
/* =============================================================================
   xuat-du-lieu.js — Lấy dữ liệu của tool "Tính chi phí thiết kế dự án" ra file.

   Chạy đúng bộ máy tính trong index.html (tables.js, calc.js, seed.js, bomon.js
   và phần chuẩn hoá dữ liệu của app.js) bằng Node, không cần trình duyệt:
     · du-lieu/chi-phi-thiet-ke.json   — kho dự án, cùng định dạng nút "Lưu .json"
                                         nên mở lại được bằng nút "Mở .json"
     · du-lieu/ket-qua-tinh.json       — kết quả tính từng hạng mục, từng dự án
     · du-lieu/ket-qua-hang-muc.csv    — bảng hạng mục, mở thẳng bằng Excel

   Cách chạy:
     node scripts/xuat-du-lieu.js                    → kho mẫu (seed) trong index.html
     node scripts/xuat-du-lieu.js duong-dan.json     → kho lưu từ app bằng "Lưu .json"
   ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const GOC = path.join(__dirname, '..');
const RA = path.join(GOC, 'du-lieu');

/* ---------- nạp các khối <script> của index.html ---------- */
const html = fs.readFileSync(path.join(GOC, 'index.html'), 'utf8');
const khoi = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const tim = (ten) => {
  const k = khoi.find((s) => s.includes(ten));
  if (!k) throw new Error(`Không thấy khối ${ten} trong index.html`);
  return k;
};

/* app.js đụng DOM ngay khi nạp, nên chỉ cắt riêng đoạn chuẩn hoá dữ liệu */
const app = tim('app.js — Giao diện');
const dau = app.indexOf('function moiId');
const cuoi = app.indexOf('/** Báo khi file mở ra');
if (dau < 0 || cuoi < 0) throw new Error('Không cắt được đoạn chuẩn hoá trong app.js');

const ctx = vm.createContext({ console, Intl, Math, JSON, Object, Array, String, Number, Set, Map, Infinity });
for (const ten of ['tables.js', 'calc.js', 'seed.js', 'bomon.js']) vm.runInContext(tim(ten), ctx, { filename: ten });
vm.runInContext(app.slice(dau, cuoi), ctx, { filename: 'app.js (chuẩn hoá)' });
const chay = (code) => vm.runInContext(code, ctx);

/* ---------- dựng kho: seed, hoặc file .json người dùng đưa vào ---------- */
const nguon = process.argv[2];
const vao = nguon
  ? JSON.parse(fs.readFileSync(nguon, 'utf8').replace(/^﻿/, ''))
  : chay('JSON.parse(JSON.stringify(SEED))');
ctx.__vao = vao.duAns ? vao : { donGia: vao.donGia, duAns: [{ ten: vao.ten, items: vao.items }] };
const kho = chay('chuanHoa(__vao)');

/* id ngẫu nhiên → id cố định, để file lưu vào git không đổi mỗi lần chạy */
kho.duAns.forEach((d, i) => {
  if (!nguon) d.id = 'da' + (i + 1);
  d.items.forEach((it, j) => { if (!nguon) it.id = `da${i + 1}-hm${j + 1}`; });
});

const PHIEN_BAN = chay('PHIEN_BAN');
const goi = Object.assign({ phienBan: PHIEN_BAN }, kho);
delete goi.loaiLa;

/* ---------- tính ---------- */
ctx.__kho = kho;
const K = chay('tinhKho(__kho)');
const boMon = (rows) => {
  ctx.__rows = rows;
  return chay(`(() => {
    const ds = __rows.map(({ it, r }) => { const pb = phanBoBoMon(it, r); return { it, r, pb, db: dinhBienBoMon(r, pb, __kho.donGia) }; });
    const t = congBoMon(ds), gop = dinhBienGop(ds, __kho.donGia);
    return BO_MON_KEY.filter((k) => t.tien[k] > 0.5 || gop.nguoi[k])
      .map((k) => ({ boMon: BO_MON[k].ten, sanLuong: Math.round(t.tien[k]), tyTrong: t.tien[k] / t.tongTien, dinhBien: gop.nguoi[k] }))
      .concat([{ boMon: 'TỔNG', sanLuong: Math.round(t.tongTien), tyTrong: 1, dinhBien: gop.tongNguoi }]);
  })()`);
};

const tron = (n) => Math.round(+n || 0);
const ptQLTK = +kho.donGia.ptQLTK || 0;
const hangMuc = (it, r) => ({
  ten: it.ten, loai: it.loai, nhom: r.nhom, pk: it.pk, quyMo_m2: +it.d || 0,
  soTang: it.soTang, soHam: it.soHam, cap: r.cap || undefined, buocTK: r.mode === 'suat' ? r.buocTK : undefined,
  soToa: it.ntoa, soToaBienThe: it.nbt, mucGia: r.mucGia || undefined,
  heSoVung: r.f || undefined, vung: r.vung || undefined,
  cpXayDung_m2: r.g || undefined, cpThietBi_m2: r.h || undefined,
  giaTriTraDinhMuc_ty: r.Lty || undefined, tyLeTKCS: r.m || undefined, tyLeTKBVTC: r.n || undefined,
  heSoNhanBan: r.hsNhanBan || undefined, tyLeGiamGia: r.mode === 'suat' ? r.s : undefined,
  concept: tron(r.T), tkcs: tron(r.U), tkkt: tron(r.UKT), tkbvtc: tron(r.V), hsbh: tron(r.W),
  tongChuaConcept: tron(r.X), tongCPTK: tron(r.X + r.T), dinhBien: r.AI,
  nguonSuatVon: r.nguonSV || undefined, nguonVung: r.nguonVung || undefined,
});
const tongCua = (t) => ({
  quyMo_m2: tron(t.D), concept: tron(t.T), tkcs: tron(t.U), tkkt: tron(t.UKT), tkbvtc: tron(t.V), hsbh: tron(t.W),
  tongChuaConcept: tron(t.X), tongCPTK: tron(t.tongCong), qltk: tron(t.tongCong * ptQLTK),
  sanLuong: tron(t.tongCong * (1 + ptQLTK)), tongMucDauTuUoc: tron(t.svTong), dinhBienCongCotAI: t.AI,
});

const ketQua = {
  lapNgay: new Date().toISOString().slice(0, 10),
  nguon: nguon ? path.basename(nguon) : 'seed trong index.html (Dự án Long Biên - PHÂN KỲ I)',
  canCu: ['TT 38/2026/TT-BXD Phụ lục VIII', 'QĐ 425/QĐ-BXD ngày 30/3/2026', 'QĐ 409/QĐ-BXD ngày 11/4/2025 Bảng 100'],
  donGia: kho.donGia,
  duAns: K.ds.map((kq) => ({
    ten: kq.duAn.ten, diaDiem: kq.duAn.diaDiem, vung: kq.vung,
    tong: tongCua(kq.tong), theoBoMon: boMon(kq.rows),
    hangMuc: kq.rows.map(({ it, r }) => hangMuc(it, r)),
  })),
  tongKho: Object.assign(tongCua(K.tong), { theoBoMon: boMon(K.ds.flatMap((k) => k.rows)) }),
};

/* ---------- ghi file ---------- */
fs.mkdirSync(RA, { recursive: true });
const ten = nguon ? path.basename(nguon, path.extname(nguon)) : 'chi-phi-thiet-ke';
if (!nguon) fs.writeFileSync(path.join(RA, 'chi-phi-thiet-ke.json'), JSON.stringify(goi, null, 2) + '\n');
fs.writeFileSync(path.join(RA, nguon ? `${ten}.ket-qua.json` : 'ket-qua-tinh.json'), JSON.stringify(ketQua, null, 2) + '\n');

const COT = ['ten', 'loai', 'pk', 'quyMo_m2', 'soTang', 'cap', 'soToa', 'soToaBienThe', 'mucGia', 'heSoVung',
  'cpXayDung_m2', 'cpThietBi_m2', 'giaTriTraDinhMuc_ty', 'tyLeTKCS', 'tyLeTKBVTC', 'heSoNhanBan', 'tyLeGiamGia',
  'concept', 'tkcs', 'tkkt', 'tkbvtc', 'hsbh', 'tongChuaConcept', 'tongCPTK', 'dinhBien'];
const o = (v) => (v == null ? '' : /[",\n;]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
const dong = [['duAn', ...COT].join(',')];
for (const d of ketQua.duAns) for (const h of d.hangMuc) dong.push([d.ten, ...COT.map((k) => h[k])].map(o).join(','));
fs.writeFileSync(path.join(RA, nguon ? `${ten}.hang-muc.csv` : 'ket-qua-hang-muc.csv'), '﻿' + dong.join('\n') + '\n');

/* ---------- tóm tắt ra màn hình ---------- */
const f = (n) => new Intl.NumberFormat('vi-VN').format(n);
for (const d of ketQua.duAns) {
  console.log(`${d.ten} — ${d.diaDiem || 'chưa chọn địa điểm'}${d.vung ? ' (Vùng ' + d.vung + ')' : ''} — ${d.hangMuc.length} hạng mục`);
  console.log(`  Tổng CPTK (gồm concept): ${f(d.tong.tongCPTK)} đ · chưa concept: ${f(d.tong.tongChuaConcept)} đ`);
  console.log(`  Sản lượng (TK + QLTK ${ptQLTK * 100}%): ${f(d.tong.sanLuong)} đ · định biên gộp: ${d.theoBoMon.at(-1).dinhBien} người`);
}
console.log(`Đã ghi vào ${path.relative(process.cwd(), RA) || '.'}`);
