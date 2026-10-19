# Công cụ tính chi phí thiết kế dự án

Dữ liệu của phiên làm việc **"Tính chi phí thiết kế dự án"**, lấy về để dùng tiếp ở các phiên sau.

- **Nguồn:** artifact của bạn tại https://claude.ai/artifact/HD4SUs8VB85X3fg9AuFAgU, bản cập nhật ngày 07/10/2026, phiên bản định dạng dữ liệu `PHIEN_BAN = 4`.
- **Thư mục gốc trên máy bạn:** `D:\chi-phi-thiet-ke`. Thư mục này còn chứa hai app con là `tmb-quy-hoach` và `san-luong-vtk`; cả hai dùng chung `bomon.js`.
- **Lấy về ngày:** 19/10/2026.

## Trong thư mục này

| File | Nội dung |
|---|---|
| `index.html` | Toàn bộ mã nguồn của công cụ (một file, chạy offline, mở thẳng bằng trình duyệt). Gồm các khối `tables.js` · `calc.js` · `seed.js` · `bomon.js` · `xlsx.js` · `baocao.js` · `app.js`. |
| `du-lieu/chi-phi-thiet-ke.json` | Kho dự án theo đúng định dạng của nút **Lưu .json**. Mở lại được bằng nút **Mở .json**. |
| `du-lieu/ket-qua-tinh.json` | Kết quả tính đầy đủ: từng hạng mục, tổng dự án, sản lượng và định biên theo bộ môn, bộ đơn giá đang dùng. |
| `du-lieu/ket-qua-hang-muc.csv` | Bảng hạng mục, mở thẳng bằng Excel (UTF-8 có BOM). |
| `scripts/xuat-du-lieu.js` | Chạy đúng bộ máy tính trong `index.html` bằng Node rồi xuất ba file trên. |

```bash
node scripts/xuat-du-lieu.js                 # tính lại kho mẫu (seed) trong index.html
node scripts/xuat-du-lieu.js kho-cua-toi.json # tính một file lưu từ app bằng "Lưu .json"
```

## ⚠ Dữ liệu bạn đã nhập trên app KHÔNG có ở đây

App lưu kho dự án vào **localStorage của trình duyệt** (khoá `cptk.kho.v2`; bản cũ dùng `cptk.duan.v1`). Dữ liệu đó chỉ nằm trên máy và trình duyệt bạn đã dùng, không nằm trong artifact. Tôi cũng đã tìm trên Google Drive nhưng không có file `chi-phi-thiet-ke.json` nào.

Vì thế `du-lieu/` hiện chỉ chứa **kho mẫu có sẵn trong mã nguồn**, tức Dự án Long Biên, phân kỳ I. Mã nguồn còn nhắc tới kho **M7 Đan Phượng**, nhưng kho đó chỉ có trong trình duyệt của bạn.

Để đưa dữ liệu thật vào phiên làm việc:
1. Mở artifact trên đúng trình duyệt bạn hay dùng, bấm **Lưu .json**.
2. Tải file đó lên Google Drive hoặc gửi vào phiên làm việc.
3. Chạy `node scripts/xuat-du-lieu.js <file>.json`, rồi chép file vào `du-lieu/`.

## Căn cứ tra bảng

| Nội dung | Văn bản | Bảng dùng trong app |
|---|---|---|
| Định mức thiết kế | TT 38/2026/TT-BXD, Phụ lục VIII | 2.3 (BCNCKT) · 2.4 (BCKTKT, TMĐT < 40 tỷ) · 2.7/2.8 dân dụng · 2.9/2.10 công nghiệp · 2.15/2.16 HTKT. Nếu thiết kế 3 bước thì TKBVTC = 55% định mức TKKT. |
| Suất vốn đầu tư | QĐ 425/QĐ-BXD ngày 30/3/2026 | B1 chung cư · B2 nhà riêng lẻ · B3–8 trường học · B15/16 y tế · B25 văn phòng · B26 đa năng/TTTM · B51 HTKT khu đô thị (triệu đ/ha, quy đổi ×0,1 ra nghìn đ/m²) |
| Hệ số vùng | QĐ 409/QĐ-BXD ngày 11/4/2025, Phần 4, Bảng 100 | 8 vùng × 8 loại công trình. Thay cho QĐ 510/2023 (0,926). Danh mục tỉnh theo địa giới trước khi hợp nhất. |

## Chuỗi tính (theo file "Tính toán chi phí thiết kế dự án.xlsx", sheet LBHN 260904)

Áp cho công trình tính theo **suất vốn** (cao tầng, TTTM, văn phòng, trường học, y tế, nhà riêng lẻ, HTKT):

```
I  = g × f × d                 CP xây dựng      (g: đ/m² sàn theo QĐ 425, f: hệ số vùng, d: m² sàn)
J  = h × d   (HTKT: h × f × d) CP thiết bị
K  = I + J ;  L = K ÷ 1,1 ÷ 10⁹ (tỷ đ, chưa VAT) → khoá nội suy m (TKCS), n (TKBVTC) trong TT 38
O  = K × m   ;  P = I × n      chi phí / tòa điển hình
hs = 1 + 0,2×(số tòa điển hình − 1) + 0,5 + 0,5×0,2×(số tòa biến thể − 1)   (hệ số nhân bản;
     hai số hạng 0,5 chỉ có khi có tòa biến thể — vd 4 tòa/1 biến thể → 1,9; 6/2 → 2,2)
T  = concept/mẫu × (1 + 0,5 nếu có biến thể)   — đơn giá, KHÔNG giảm
U  = O × hs × s ;  V = P × hs × s               — s: tỷ lệ giảm giá (CT 25%, HTKT 45%)
X  = U + TKKT + V + W  (cột "Tổng chi phí — chưa concept");   Tổng CPTK = X + T
Nhân công = tiền × 30% ;  Định biên = ROUNDUP(nhân công ÷ số tháng ÷ 43 tr)
Sản lượng = Tổng CPTK × (1 + QLTK 15%)
```

Các loại còn lại tính bằng **đơn giá**, giữ nguyên 100%:
- **Thấp tầng:** concept tính theo mẫu, TKCS và TKBVTC tính theo đ/m².
- **Cảnh quan:** tính theo đ/m² theo mức.
- **Nội thất:** trọn gói theo mức.
- **Khác:** nhập tay số tiền và chọn giai đoạn.

## Bộ đơn giá mặc định (bảng giả định ngoài QĐ 425, 10/2026)

| Hạng mục | NOXH – cận dưới | Chung – mức giữa | Điểm nhấn – cận trên |
|---|---:|---:|---:|
| Concept cao tầng / văn phòng / TTTM (đ/mẫu) | 300 tr | 350 tr | 400 tr |
| Concept trường học (đ/mẫu) | 150 tr | 250 tr | 350 tr |
| Cảnh quan concept = TKBVTC (đ/m²) | 12.000 | 18.500 | 25.000 |
| Nội thất concept / TKBVTC (trọn gói) | 200 / 400 tr | 300 / 600 tr | 600 / 900 tr |

- **Thấp tầng:**

  | Loại | Concept (đ/mẫu) | TKCS (đ/m²) | TKBVTC (đ/m²) | HSBH (đ/m²) |
  |---|---:|---:|---:|---:|
  | Liền kề | 85 tr | 3.028 | 8.650 | 306.000 |
  | Biệt thự đơn lập | 45 tr | 3.591 | 10.260 | 477.000 |
  | Biệt thự song lập | 34,56 tr | 3.591 | 10.260 | 477.000 |

- **Cảnh quan:** cảnh quan tuyến phố tính bằng 40% đơn giá cùng mức. Cảnh quan đặc biệt là 50.000 đ/m².
- **Tham số chung:**
  - Lương trung bình 43 tr/tháng, tỷ lệ nhân công 30%.
  - Hệ số công trình lặp lại 20%, hệ số mẫu biến thể 50%.
  - Tiến độ: concept 2 tháng, TKCS 4 tháng, TKKT 5 tháng, TKBVTC 6 tháng.
  - Nhân sự thiết kế hiện có: 14 người.
- **Mức giá tự gợi ý theo tên:** tên có NOXH, TĐC hoặc tái định cư thì lấy mức cận dưới. Tên có "điểm nhấn" hoặc landmark thì lấy mức cận trên.

## Các quyết định đã chốt trong những phiên trước

| Ngày | Quyết định |
|---|---|
| 10/9/2026 | Một giá trị L dùng chung làm khoá tra cho cả TKCS và TKBVTC, giống file gốc. |
| 2/10/2026 | Tỷ lệ bộ môn lấy theo file "TỶ LỆ BỘ MÔN.pptx". Phòng Cảnh quan và phòng Nội thất giữ trọn tiền hạng mục của mình. Các dòng KT/KC/MEP trong bảng của hai phòng này là vai trò bên trong phòng. |
| 2/10/2026 | Nhóm "công trình tạm dân dụng": cột Hồ sơ trong file gốc cộng ra 103%, app chuẩn hoá về 100%. Ba loại không có trong bảng gốc được gán mặc định: công trình công cộng → trường học, nhà riêng lẻ → thấp tầng thô, Khác → cao tầng. |
| 2/10/2026 | Ở mục HTKT phần công trình, dòng "Kiến trúc 38%" là kiến trúc sư cảnh quan, nên tiền về phòng Cảnh quan. |
| 6/10/2026 | Nội thất tính **trọn gói theo mức**, không nhân diện tích. Mốc do lãnh đạo giao: NOXH 200–400 tr, chung 300–600 tr, điểm nhấn 600–900 tr. |
| 7/10/2026 | Tỷ lệ giảm giá **chỉ áp cho phần tính theo định mức** (TKCS, TKKT, TKBVTC). Phần tính bằng đơn giá (concept, thấp tầng, cảnh quan, nội thất) giữ 100%. Bỏ khoản nhân 30% vào đơn giá cảnh quan của file gốc. |
| 10/2026 | Chuyển sang bảng giá ba mức (NOXH, chung, điểm nhấn), thêm cảnh quan tuyến phố 40% và chi phí QLTK 15%. |
| — | Hạ tầng kỹ thuật **không nhân bản theo số tòa và không có concept**, theo file "Tính định biên NS.xlsx", sheet "Cap nhat QH LBHN", hàng 14. |
| — | Chung cư tra **Bảng 2.8** (công trình dân dụng). File gốc tra nhầm Bảng 2.10 (công trình công nghiệp). Ô Trường THCS - GD4 trong file gốc gõ nhầm 2,6863%, giá trị đúng là 2,7742%. |
| — | Định biên của dự án hoặc cả kho: **cộng phần lẻ của mọi hạng mục rồi mới làm tròn lên một lần cho mỗi bộ môn.** Nếu làm tròn ở từng hạng mục, kho M7 Đan Phượng ra 143 người thay vì 48. |
| — | Tắt một khoản chi phí của một hạng mục (lưu ở `it.tat`): khoản đó không vào tổng và không ra Excel, nhưng giá trị gốc vẫn được giữ. |
| — | File Excel xuất ra giữ đúng 35 cột A..AI của file gốc, có công thức sống, kèm sheet "Bộ môn". Báo cáo khổ A4 là một đầu ra riêng, in hoặc lưu PDF. |

## Kết quả kho mẫu — Dự án Long Biên, phân kỳ I, Hà Nội (vùng 7)

Kho có 27 hạng mục với tổng 2.688.072 m² sàn:
- 13 tòa cao tầng.
- 11 trường học.
- 1 trạm y tế.
- 1 hạng mục cảnh quan.
- 1 hạng mục HTKT nội khu rộng 51,5 ha.

| Chỉ tiêu | Giá trị (đ) |
|---|---:|
| Concept | 7.155.827.500 |
| TKCS | 23.896.829.460 |
| TKBVTC | 143.508.078.214 |
| Tổng chưa concept (X) | 167.404.907.674 |
| **Tổng CPTK (gồm concept)** | **174.560.735.174** |
| QLTK 15% | 26.184.110.276 |
| **Sản lượng (TK + QLTK)** | **200.744.845.450** |
| Tổng mức đầu tư ước theo suất vốn | 30.533.101.193.565 |

Theo bộ môn:

| Bộ môn | Sản lượng (đ) | Tỷ trọng | Định biên (người) |
|---|---:|---:|---:|
| Kiến trúc | 72.928.027.921 | 41,8% | 104 |
| Kết cấu | 50.048.557.015 | 28,7% | 64 |
| MEP | 41.826.297.513 | 24,0% | 54 |
| PCCC | 6.792.307.602 | 3,9% | 9 |
| HTKT | 2.698.711.566 | 1,5% | 4 |
| Cảnh quan | 266.833.557 | 0,2% | 1 |
| **Tổng** | **174.560.735.174** | 100% | **236** |

Nếu cộng thẳng cột ĐB (đã làm tròn ở từng hạng mục) thì ra 279 người.

**Đối chiếu với file Excel gốc** (ép hệ số vùng cũ 0,926 để chỉ kiểm phần tra bảng):
- Tỷ lệ TKCS khớp 26/26 hạng mục.
- Tỷ lệ TKBVTC khác 14/26 hạng mục, đều do hai lỗi của file gốc đã nêu ở trên.

| Mốc | X (chưa concept) | ĐB |
|---|---:|---:|
| File gốc (QĐ 510 + Bảng 2.10) | 180.546.850.174 | 281 |
| Đổi TKBVTC sang Bảng 2.8, giữ 0,926 | 163.967.777.555 | 277 |
| Thêm hệ số vùng QĐ 409 (vùng 7) | 167.404.907.674 | 279 |

## Tài liệu liên quan

- **Google Drive:**
  - `MDI_CPTK LBHN và M7DP` (Google Sheet).
  - `MDI_Chi phi thiet ke.xlsx`.
  - `Cách tính toán CPTK theo DMNN.xlsx`.
- **Artifact cùng hệ:**
  - *TMB Quy Hoạch*: gửi sang công cụ này file `.json` có `"loai": "tmb-sang-cptk"`. Khi mở, app chỉ thêm hoặc cập nhật đúng một dự án.
  - *Sản lượng VTK*: dùng chung bảng tỷ lệ bộ môn.
- **File gốc người dùng cung cấp:**
  - "Tính toán chi phí thiết kế dự án.xlsx" (sheet LBHN 260904).
  - "Tính định biên NS.xlsx".
  - "TỶ LỆ BỘ MÔN.pptx".
