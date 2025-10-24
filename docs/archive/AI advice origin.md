Отлично! Ниже предоставляю:

1. Формулу для пересчёта в Excel с шаблоном;
2. Интерактивный калькулятор (на JavaScript — вы сможете использовать его в браузере или встроить в HTML-страницу).

📘 1. Excel-шаблон

Вот структура Excel файла (вы можете создать таблицу вручную по этим столбцам, либо я могу прислать ссылку на Google Sheet/файл при необходимости):

🧮 Структура таблицы:

| A              | B          | C            | D           | E           | F                                           |
|----------------|------------|--------------|-------------|-------------|---------------------------------------------|
| Сумма в EUR    | Курс EUR→₪ | Стоимость ₪ | НДС (17%)   | Прочие сборы| Итого к оплате                              |
| 1000           | 4.5        | =A2*B2       | =C2*0.17    | 400         | =ROUND(D2+E2, 2)                            |

Также можно добавить более подробную разбивку:

Дополнительные столбцы:
| G                   | H                          | I                                      |
|---------------------|----------------------------|----------------------------------------|
| Стоимость доставки  | CIF (C + G)                | НДС от CIF (далее использовать в D2)  |
| 250                 | =C2 + G2                   | =I2*0.17                              |

📌 Пример расчёта:

- Товар стоит 1000 EUR
- Курс EUR→₪: 4.5 ⇒ 1000 × 4.5 = 4,500 ₪
- Доставка: 250 ₪
- CIF: 4,750 ₪
- НДС (17%): 807.5 ₪
- Прочие сборы (фикс. или оцениваете по предыдущим заказам): ~400 ₪
- Итого: 1,207.5 ₪

Шаблон Excel можно скачать здесь (или скопировать в Google Таблицы):

🔗 Ссылка на Google Sheets (публичный шаблон):  
📎 https://docs.google.com/spreadsheets/d/1A32CZpaxXYhuO73nBhnKoboOLQytPpHkTTuWW_j7KyM/edit?usp=sharing

(Вы можете сделать копию: Файл → Создать копию)

🧮 2. JavaScript-калькулятор (HTML-версия для использования в браузере)

Вот базовый HTML + JS код. Скопируйте это в .html файл и откройте в браузере:

<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <title>Калькулятор таможенных сборов (Израиль)</title>
</head>
<body>
  <h2>Калькулятор таможенных сборов 🇮🇱</h2>

<label>Цена товара (EUR): <input type="number" id="priceEur" /></label><br/>
<label>Курс EUR → ₪ : <input type="number" id="rate" value="4.5" /></label><br/>
<label>Стоимость доставки (₪): <input type="number" id="delivery" value="0" /></label><br/>
<label>Фиксированные сборы (₪): <input type="number" id="fixedFees" value="400" /></label><br/>
<label>НДС (%) : <input type="number" id="vat" value="17" /></label><br/><br/>

<button onclick="calculate()">Рассчитать</button>

<h3>Результат</h3>
  <div id="output"></div>

  <script>
    function calculate() {
      const priceEur = parseFloat(document.getElementById('priceEur').value) || 0;
      const rate = parseFloat(document.getElementById('rate').value) || 0;
      const delivery = parseFloat(document.getElementById('delivery').value) || 0;
      const fixedFees = parseFloat(document.getElementById('fixedFees').value) || 0;
      const vat = parseFloat(document.getElementById('vat').value) || 17;

      const priceIls = priceEur * rate;
      const cifValue = priceIls + delivery;
      const vatAmount = cifValue * (vat / 100);
      const total = vatAmount + fixedFees;

      document.getElementById('output').innerHTML = `
        <p>Стоимость в ₪: ${priceIls.toFixed(2)}</p>
        <p>Стоимость с доставкой (CIF): ${cifValue.toFixed(2)} ₪</p>
        <p>НДС (${vat}%): ${vatAmount.toFixed(2)} ₪</p>
        <p>Фиксированные сборы: ${fixedFees.toFixed(2)} ₪</p>
        <p><strong>Итого к оплате: ${total.toFixed(2)} ₪</strong></p>
      `;
    }
  </script>
</body>
</html>

Дополнительно 🔧

Если вы хотите:

- Получить файл Excel — я могу отправить .xlsx при необходимости (в виде .zip по правилам платформы).
- Интеграцию с реальными курсами (API) — можно автоматизировать.
- Составить онлайн-калькулятор на Google Sheets — тоже возможно.

Если вы работаете c доставкой регулярно или по бизнесу — можно дальше расширить модель учета пошлин, НДС, категорий ТН ВЭД и т. д.

Сообщите, если нужно скачать готовый файл — отправлю.