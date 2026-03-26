let tanglungDropdown = document.getElementById('tanglung-dropdown');
let tanglungDissapear = document.querySelectorAll('.tanglung-dissapear');
let thongtang = document.querySelectorAll('.thongtang');

let tangtretInput = document.querySelector('.tangtret-input');
let tanglungInput = document.querySelector('.tanglung-input');
let thongtangInput = document.querySelector('.thongtang-input');
let tangthuongInput = document.querySelector('.tangthuong-input');
let tumInput = document.querySelector('.tum-input');
let santhuongInput = document.querySelector('.st-chk-box-input');

let isSyncingTangThuong = false;

let tangtretBtnDec = document.querySelector('.tangtret-btn-dec');
let tangtretBtnInc = document.querySelector('.tangtret-btn-inc');
let tanglungBtnDec = document.querySelector('.tanglung-btn-dec');
let tanglungBtnInc = document.querySelector('.tanglung-btn-inc');



function setupRow(row) {
    const input = row.querySelector('.qty');
    const incBtn = row.querySelector('.input-inc');
    const decBtn = row.querySelector('.input-dec');
    const percentEl = row.querySelector('.input-percent');
    const resultEl = row.querySelector('.result');
    const heMaiSelect = row.classList.contains('he-mai') ? row.querySelector('select') : null;
    const heSoNghiengEl = row.querySelector('.he-so-nghieng');

    if (!input || !percentEl || !resultEl) return;

    function updateRow() {
        const value = Number(input.value) || 0;
        let percent = 0;
        let heSoNghieng = 1;

        if (heMaiSelect) {
            let displayPercent = '50%';

            if (heMaiSelect.value === 'mai-be-tong') {
                percent = 0.5;
                heSoNghieng = 1;
                displayPercent = '50%';
            } else if (heMaiSelect.value === 'mai-ton') {
                percent = 0.35;
                heSoNghieng = 1;
                displayPercent = '35%';
            } else if (heMaiSelect.value === 'mai-ngoi') {
                percent = 0.5;
                heSoNghieng = 1.4;
                displayPercent = '50%';
            } else if (heMaiSelect.value === 'mai-duc') {
                percent = 0.7;
                heSoNghieng = 1.4;
                displayPercent = '70%';
            }

            if (heSoNghiengEl) {
                heSoNghiengEl.style.display = heSoNghieng > 1 ? '' : 'none';
            }

            const percentLabelNode = Array.from(percentEl.childNodes)
                .find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '');
            if (percentLabelNode) {
                percentLabelNode.textContent = `\n                                ${displayPercent}\n                                `;
            }
        } else {
            const percentText = percentEl.textContent || '';
            const percentMatch = percentText.match(/-?\d+(\.\d+)?/);
            percent = percentMatch ? Number(percentMatch[0]) / 100 : 0;
        }

        const result = value * percent * heSoNghieng;

        resultEl.textContent = result.toFixed(1);
        updateTotal(); // 👈 update sum every time
    }

    incBtn?.addEventListener('click', () => {
        input.value = Number(input.value) + 1;
        updateRow();
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    decBtn?.addEventListener('click', () => {
        input.value = Math.max(0, Number(input.value) - 1);
        updateRow();
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    function bindManualInputUpdate() {
        // Keep result in sync while typing or after field blur/spinner changes.
        ['input', 'keyup', 'change'].forEach(eventName => {
            input.addEventListener(eventName, updateRow);
        });
    }

    bindManualInputUpdate();
    heMaiSelect?.addEventListener('change', updateRow);

    updateRow(); // initial run
}

tanglungDropdown.addEventListener("change", () => {
    let choice = tanglungDropdown.value;
    if (choice === "khongcotanglung") {
        thongtang.forEach(function (row) {
            row.style.display = "none";
        })

        tanglungDissapear.forEach(function (cell) {
            cell.style.display = "none";
        })
        updateTotal();
    } else {
        thongtang.forEach(function (row) {
            row.style.display = "table-row";
        })

        tanglungDissapear.forEach(function (cell) {
            cell.style.display = "table-cell";
        })
        updateTotal();
    }

});

function updateThirdValue() {
    let first = Number(tangtretInput.value);
    let second = Number(tanglungInput.value);
    thongtangInput.value = first - second;
}

/** tangthuong stays independent; sân thượng = tangthuong − tum (min 0). Updates dt-tum + st-chk-box-dt. */
// function updateTangThuongValue() {
//     if (!tangthuongInput || !tumInput || !santhuongInput) return;

//     const tangValue = Number(tangthuongInput.value) || 0;
//     const tumValue = Number(tumInput.value) || 0;
//     const sanThuongValue = Math.max(0, tangValue - tumValue);
//     santhuongInput.value = sanThuongValue;

//     const tumPercentText = document.querySelector('.heso-tum')?.textContent || '0%';
//     const tumPercent = (Number(tumPercentText.match(/-?\d+(\.\d+)?/)?.[0]) || 0) / 100;
//     const tumResultEl = document.querySelector('.dt-tum');
//     if (tumResultEl) {
//         tumResultEl.textContent = (tumValue * tumPercent).toFixed(1);
//     }

//     const sanThuongPercentText = document.querySelector('.st-chk-box-heso')?.textContent || '0%';
//     const sanThuongPercent = (Number(sanThuongPercentText.match(/-?\d+(\.\d+)?/)?.[0]) || 0) / 100;
//     const sanThuongResultEl = document.querySelector('.st-chk-box-dt');
//     if (sanThuongResultEl) {
//         sanThuongResultEl.textContent = (sanThuongValue * sanThuongPercent).toFixed(1);
//     }

//     tumInput.dispatchEvent(new Event('input', { bubbles: true }));
//     santhuongInput.dispatchEvent(new Event('input', { bubbles: true }));

//     updateTotal();
// }

function updateTangThuongValue() {
    if (!tangthuongInput || !tumInput || !santhuongInput) return;
    if (isSyncingTangThuong) return;
    isSyncingTangThuong = true;

    const tangValue = Number(tangthuongInput.value) || 0;
    const tumValue = Number(tumInput.value) || 0;

    // sân thượng = tầng thượng - Tum (clamp >= 0)
    const sanThuongValue = Math.max(0, tangValue - tumValue);
    santhuongInput.value = sanThuongValue;

    // Trigger only the dependent "Có sân thượng" row recalculation.
    // Tum row is already recalculated by its own +/- handler.
    santhuongInput.dispatchEvent(new Event('input', { bubbles: true }));
    updateTotal();

    isSyncingTangThuong = false;
}


function setupMongNenSync() {
    const mongNenRow = document.querySelector('.mong-nen');
    if (!mongNenRow || !tangtretInput) return;

    const mongNenInput = mongNenRow.querySelector('.mong-nen-input');
    const mongNenSelect = mongNenRow.querySelector('select');
    const mongNenCheckbox = mongNenRow.querySelector('input[type="checkbox"]');
    const mongNenPercentEl = mongNenRow.querySelector('.input-percent');
    const mongNenResultEl = mongNenRow.querySelector('.result');

    if (!mongNenInput || !mongNenSelect || !mongNenCheckbox || !mongNenPercentEl || !mongNenResultEl) return;

    function updateMongNen() {
        const tangTretValue = Number(tangtretInput.value) || 0;
        mongNenInput.value = tangTretValue;

        let basePercent = mongNenSelect.value === 'mong-don' ? 30 : 50;
        if (mongNenCheckbox.checked) {
            basePercent += 15;
        }

        const result = tangTretValue * (basePercent / 100);
        mongNenPercentEl.textContent = `${basePercent}%`;
        mongNenResultEl.textContent = result.toFixed(1);
        updateTotal();
    }

    tangtretInput.addEventListener('input', updateMongNen);
    mongNenSelect.addEventListener('change', updateMongNen);
    mongNenCheckbox.addEventListener('change', updateMongNen);
    updateMongNen();
}

function setupHamBasementToggle() {
    const hamRow = document.querySelector('.ham');
    const basementForm = document.getElementById('basementCheckbox');
    if (!hamRow || !basementForm) return;

    const hamSelect = hamRow.querySelector('select');
    if (!hamSelect) return;
    const hamToggleTargets = document.querySelectorAll('.ham-btn, .heso-ham, .dt-ham, .radio-chk-box');
    const hamQtyInput = hamRow.querySelector('.qty');
    const hamPercentEl = hamRow.querySelector('.heso-ham');
    const hamResultEl = hamRow.querySelector('.dt-ham');
    const depthRadios = document.querySelectorAll('input[type="radio"][name="depth"]');

    function updateHamResult() {
        if (!hamQtyInput || !hamPercentEl || !hamResultEl) return;
        const qty = Number(hamQtyInput.value) || 0;
        const percentMatch = (hamPercentEl.textContent || '').match(/-?\d+(\.\d+)?/);
        const percent = percentMatch ? Number(percentMatch[0]) / 100 : 0;
        hamResultEl.textContent = (qty * percent).toFixed(1);
    }

    function updateHamDepthPercent() {
        if (!hamPercentEl) return;
        const checked = document.querySelector('input[type="radio"][name="depth"]:checked');
        const depthValue = checked?.value;

        if (depthValue === '1.2-1.8') {
            hamPercentEl.textContent = '170%';
        } else if (depthValue === 'gt1.8') {
            hamPercentEl.textContent = '200%';
        } else {
            hamPercentEl.textContent = '150%';
        }

        updateHamResult();
        updateTotal();
    }

    function updateBasementVisibility() {
        const isKhongCoHam = hamSelect.value === 'khong-co-ham';
        basementForm.style.display = hamSelect.value === 'co-ham' ? 'none' : '';
        hamToggleTargets.forEach(el => {
            el.style.display = isKhongCoHam ? 'none' : '';
        });
        updateHamDepthPercent();
        updateTotal();
    }

    hamSelect.addEventListener('change', updateBasementVisibility);
    depthRadios.forEach(radio => radio.addEventListener('change', updateHamDepthPercent));
    updateBasementVisibility();
}

function setupSanThuongToggle() {
    // "Có sân thượng" checkbox is inside the `.co-san-thuong` row in index.html
    const checkbox = document.querySelector('.co-san-thuong input[type="checkbox"].st-chk-box')
        || document.querySelector('input[type="checkbox"].st-chk-box');
    const tangThuongTargets = document.querySelectorAll('.heso-tangthuong, .dt-tangthuong');
    const tumRow = document.querySelector('tr.tum');
    // Hide the "Sân thượng" numeric part (value, heso, dt) when unchecked.
    const stChungTargets = document.querySelectorAll(
        '.st-chk-box-value, .st-chk-box-heso, .st-chk-box-dt'
    );
    const tangThuongLabel = document.querySelector('.tang-thuong td');
    const soTangDropdown = document.getElementById('floor-count');

    if (!checkbox || tangThuongTargets.length === 0) return;

    const originalLabel = 'Tầng thượng = Tum + Sân Thượng';

    function updateLabelText() {
        if (!tangThuongLabel) return;

        if (checkbox.checked) {
            tangThuongLabel.textContent = originalLabel;
            return;
        }

        const n = soTangDropdown ? soTangDropdown.value : '';
        tangThuongLabel.textContent = n ? `Tầng ${n}` : 'Tầng';
    }

    function updateSanThuongVisibility() {
        const isChecked = checkbox.checked;

        // When checked: hide "tầng thượng" cells (heso + dt) and show "Tum" + "Sân thượng".
        // When unchecked: show "tầng thượng" cells and hide "Tum" + "Sân thượng".
        tangThuongTargets.forEach(el => {
            el.style.display = isChecked ? 'none' : '';
        });

        if (tumRow) tumRow.style.display = isChecked ? '' : 'none';
        stChungTargets.forEach(el => {
            el.style.display = isChecked ? '' : 'none';
        });
        updateLabelText();
        updateTotal();
    }

    checkbox.addEventListener('change', updateSanThuongVisibility);
    updateSanThuongVisibility();
    // Expose for other visibility controllers (e.g. floor-count changes)
    window.__applySanThuongVisibility = updateSanThuongVisibility;

    soTangDropdown?.addEventListener('change', () => {
        if (checkbox.checked) return;
        updateLabelText();
        updateTotal();
    });
}

function setupFloorCountVisibility() {
    const soTangDropdown = document.getElementById('floor-count');
    if (!soTangDropdown || !tangtretInput) return;

    const tangtretRow = tangtretInput.closest('tr');
    const tanglungRow = document.querySelector('tr.tanglung');
    const thongtangRow = document.querySelector('tr.thongtang');

    const allExtraRows = document.querySelectorAll(
        'tr.tanglung, tr.thongtang, tr.floor-2, tr.floor-3, tr.floor-4, tr.floor-5, tr.floor-6, tr.floor-7, tr.tang-thuong, tr.tum, tr.co-san-thuong'
    );

    function setRowsVisible(rows, visible) {
        rows.forEach(row => {
            if (!row) return;
            row.style.display = visible ? '' : 'none';
        });
    }

    function applyVisibility() {
        const n = Number(soTangDropdown.value) || 1;

        // Ground floor always visible
        if (tangtretRow) tangtretRow.style.display = '';

        // Default: hide everything extra
        allExtraRows.forEach(row => {
            row.style.display = 'none';
        });

        // Apply rules:
        // 1: show only ground floor
        if (n === 1) {
            updateTotal();
            return;
        }

        // >= 2: always show the "tầng thượng" block rows
        const tangThuongRows = document.querySelectorAll('tr.tang-thuong, tr.tum, tr.co-san-thuong');
        tangThuongRows.forEach(row => {
            row.style.display = '';
        });

        // Re-apply "Có sân thượng" checkbox rules (tum must stay hidden when unchecked)
        if (typeof window.__applySanThuongVisibility === 'function') {
            window.__applySanThuongVisibility();
        }

        // 2: show lửng block
        if (n === 2) {
            if (tanglungRow) tanglungRow.style.display = '';
            if (thongtangRow) thongtangRow.style.display = '';
            if (typeof window.__applySanThuongVisibility === 'function') {
                window.__applySanThuongVisibility();
            } else {
                updateTotal();
            }
            return;
        }

        // 3..7: show floors 2..(n-1). (tầng trệt is floor 1; tầng thượng is the last floor block)
        for (let i = 2; i <= n - 1; i++) {
            const floorRow = document.querySelector(`tr.floor-${i}`);
            if (floorRow) floorRow.style.display = '';
        }

        if (typeof window.__applySanThuongVisibility === 'function') {
            window.__applySanThuongVisibility();
        } else {
            updateTotal();
        }
    }

    soTangDropdown.addEventListener('change', applyVisibility);
    applyVisibility(); // initial
}

tangtretInput.addEventListener("input", () => {
    updateThirdValue();
    updateTotal();
});

tanglungInput.addEventListener("input", () => {
    updateThirdValue();
    updateTotal();
});

thongtangInput.addEventListener("input", () => {
    updateThirdValue();
    updateTotal();
});

tangthuongInput?.addEventListener("input", updateTangThuongValue);
tangthuongInput?.addEventListener("change", updateTangThuongValue);
tumInput?.addEventListener("input", updateTangThuongValue);
tumInput?.addEventListener("change", updateTangThuongValue);
let donGia = document.querySelectorAll(".don-gia-sum");

function formatNumberWithCommas(value, fractionDigits = 1) {
    const number = Number(value) || 0;
    return number.toLocaleString("en-US", {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
    });
}

function updateDonGiaThanhTien() {
    const donGiaRows = document.querySelectorAll(".don-gia tbody tr");
    donGiaRows.forEach(row => {
        const unitPriceInput = row.querySelector('input[type="number"]');
        const areaEl = row.querySelector(".don-gia-sum");
        const thanhTienEl = row.querySelector(".thanh-tien");
        if (!unitPriceInput || !areaEl || !thanhTienEl) return;

        const unitPrice = Number(unitPriceInput.value) || 0;
        const areaText = (areaEl.textContent || "").replace(/,/g, "");
        const area = parseFloat(areaText) || 0;
        const thanhTien = unitPrice * area;

        thanhTienEl.textContent = `${formatNumberWithCommas(thanhTien)} VND`;
    });
}

function setupDonGiaThanhTien() {
    const donGiaRows = document.querySelectorAll(".don-gia tbody tr");
    donGiaRows.forEach(row => {
        const unitPriceInput = row.querySelector('input[type="number"]');
        if (!unitPriceInput) return;
        unitPriceInput.addEventListener("input", updateDonGiaThanhTien);
        unitPriceInput.addEventListener("change", updateDonGiaThanhTien);
    });
    updateDonGiaThanhTien();
}


function updateTotal() {
    const rows = document.querySelectorAll(".row-sum"); // ✅ only valid rows
    const sumEl = document.querySelector(".sum");

    let total = 0;

    const isVisible = (el) => {
        if (!el) return false;
        if (typeof el.getClientRects === "function") return el.getClientRects().length > 0;
        // Fallback for older browsers
        return el.offsetWidth > 0 || el.offsetHeight > 0;
    };

    rows.forEach(row => {
        if (!isVisible(row)) return;

        const lastCell = row.querySelector(".area"); // numeric cell
        if (!lastCell || !isVisible(lastCell)) return;

        // Handle whitespace and potential commas from user input
        const text = (lastCell.textContent || "").trim().replace(",", ".");
        const number = parseFloat(text);

        if (!isNaN(number)) {
            total += number;
        }
    });

    const totalText = `${formatNumberWithCommas(total)} m<span class="unit-exp">2</span>`;
    sumEl.innerHTML = totalText;
    donGia.forEach(item => {
        item.innerHTML = totalText;
    });
    updateDonGiaThanhTien();
}

document.querySelectorAll(".calc-row").forEach(setupRow);
setupMongNenSync();
setupHamBasementToggle();
setupSanThuongToggle();
setupFloorCountVisibility();
setupDonGiaThanhTien();
updateTangThuongValue();
updateTotal();