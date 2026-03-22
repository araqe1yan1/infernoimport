// 1. ПЕРЕМЕННАЯ ДЛЯ КУРСА
let currentUsdRate = 1;

document.addEventListener("DOMContentLoaded", () => {
    // Подгружаем порты
    fetch('database.json')
        .then(res => res.json())
        .then(data => populateSelects(data))
        .catch(err => console.error('Ошибка:', err));

    // Подгружаем курс (и больше не пытаемся записать его в удаленный HTML)
    fetch('https://api.frankfurter.app/latest?from=EUR&to=USD')
        .then(res => res.json())
        .then(data => {
            currentUsdRate = data.rates.USD;
            console.log("Успешно загружен курс:", currentUsdRate);
        })
        .catch(err => console.error('Ошибка курса:', err));
});

function populateSelects(db) {
    const copart = document.getElementById("shipping"), iaai = document.getElementById("largeshipping");
    const addOpts = (select, ports) => {
        select.innerHTML = '<option value="" disabled selected>Ընտրեք նավահանգիստը</option>';
        if (ports) ports.forEach(p => {
            let opt = document.createElement("option");
            opt.value = p.shipping; opt.textContent = p.name; opt.dataset.hskich = p.hskich;
            select.appendChild(opt);
        });
    };
    addOpts(copart, db.copart);
    addOpts(iaai, db.iaai);
}

function mynewfunction() {
    const auction = document.getElementById("auction").value;
    document.getElementById("shipping").hidden = auction !== "copart";
    document.getElementById("largeshipping").hidden = auction !== "iaai";
}

function calculateCosts() {
    const val = id => parseFloat(document.getElementById(id).value) || 0;
    
    // ВНИМАНИЕ: мы убрали поиск "usd" отсюда, берем курс из памяти
    const price = val("price"), year = val("year"), engine = val("engine");
    const kurs = currentUsdRate; 
    
    const auction = document.getElementById("auction").value;
    const activeSel = document.getElementById(auction === "copart" ? "shipping" : "largeshipping");

    if (activeSel.selectedIndex <= 0) return alert("Խնդրում ենք ընտրել նավահանգիստը!");

    const opt = activeSel.options[activeSel.selectedIndex];
    const shipping = (parseInt(opt.value) || 0) + 15;
    const hskich = parseInt(opt.dataset.hskich) || 0;

    const fobCopart = [[549,355],[699,380],[799,405],[899,425],[999,440],[1199,480],[1299,500],[1399,515],[1499,530],[1599,555],[1699,570],[1799,590],[1999,610],[2399,645],[2499,680],[2999,715],[3499,760],[3999,810],[4499,870],[4999,895],[5999,920],[6499,990],[6999,1010],[7999,1045],[9999,1105],[11499,1155],[11999,1165],[12499,1180],[14999,1195]];
    const fobIaai = [[549,370],[599,380],[699,395],[799,420],[899,440],[999,455],[1199,495],[1299,515],[1399,530],[1499,545],[1599,570],[1699,585],[1799,605],[1999,625],[2199,660],[2399,695],[2499,730],[2999,775],[3499,825],[3999,885],[4499,910],[4999,935],[5999,960],[6999,1005],[7999,1025],[8499,1120],[9999,1140],[11499,1170],[11999,1180],[12499,1195],[14999,1210]];
    
    let fobRates = auction === 'copart' ? fobCopart : fobIaai;
    let baseFob = fobRates.find(r => price <= r[0]);
    let fob = price >= 15000 ? (price * 0.06) + (auction === 'copart' ? 305 : 320) : (baseFob ? baseFob[1] : 0);

    const inv1 = (price + fob + hskich) / kurs;
    let ras = 0, bnap1 = ((price + fob) / kurs), maqs = inv1 * 0.2, aah = 0, bnap = 0;

    if (year >= 2022) {
        aah = (inv1 + maqs) * 0.15;
        bnap = inv1 * 0.02;
        bnap1 *= 0.02;
    } else if (year >= 2018) {
        let k = engine <= 1 ? 0.36 : engine <= 1.5 ? 0.4 : engine <= 1.8 ? 0.36 : engine <= 3 ? 0.44 : 0.8;
        maqs = Math.max(maqs, k * 1000 * engine);
        aah = (inv1 + maqs) * 0.2;
        let percent = year >= 2020 ? 0.04 : 0.06;
        bnap = inv1 * percent;
        bnap1 *= percent;
    }
    ras = Math.round((maqs + aah + bnap) * kurs);

    // --- Модификаторы (Электро / Sublot) ---
    const isElec = document.getElementById("myCheck").checked;
    const isSublot = document.getElementById("myCheck1").checked;
    
    let shipCost = shipping + (isSublot || isElec ? 300 : 200);
    let orgCost = isElec && !isSublot ? 110 : 220;
    let finalRas = isElec && !isSublot ? Math.round(bnap1) : ras;
    let kom = 250;
    // Налог (shah) полностью удален из вычислений
    let one = Math.round(price + fob);

    // --- Обновление интерфейса ---
    const setUI = (id, v) => document.getElementById(id).innerHTML = v + "$";
    setUI("dem", price);
    setUI("dem1", fob);
    setUI("dem2", shipCost);
    setUI("dem3", orgCost);
    setUI("dem4", finalRas);
    setUI("dem5", kom); // Теперь это 6-я строка (Комиссия)
    setUI("dem6", price + fob + shipCost + orgCost + finalRas + kom); // Итог (без налога)
    setUI("dem7", one); // Платеж 1 дня
    setUI("dem8", shipCost + orgCost); // Платеж 45 дней
    setUI("dem9", Math.round(finalRas + kom)); // Платеж 3 дней (без налога)
}

document.getElementById('screenshot-btn').addEventListener('click', () => {
    html2canvas(document.getElementById('screenshot-target')).then(canvas => {
        canvas.toBlob(blob => {
            navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
                .then(() => alert('Сքրինշոթը պահպանվեց! (Скриншот сохранен)'))
                .catch(err => console.error('Ошибка: ', err));
        });
    });
});
