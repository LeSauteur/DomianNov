/*
 * Домиан Новочеркасск — рабочие инструменты сайта (октябрь 2026).
 * Квиз-заявка, анкета кандидата, ипотечный калькулятор, фильтр демо-каталога.
 *
 * LEAD_ENDPOINT: после запуска сюда подставляется адрес приёма заявок
 * (например, небольшой серверный обработчик, который пересылает заявку
 * в Telegram офиса). Пока адрес пустой, сайт работает в демо-режиме:
 * заявка никуда не уходит, а посетитель видит, как она выглядела бы
 * в Telegram, и может сразу позвонить в офис.
 */
(() => {
  const LEAD_ENDPOINT = "";
  const OFFICE_PHONE = "+7 938 154-95-15";
  const OFFICE_TEL = "tel:+79381549515";
  const DEMO = !LEAD_ENDPOINT;

  const scriptUrl = document.currentScript?.src || "";
  const privacyHref = scriptUrl ? new URL("../../privacy.html", scriptUrl).href : "privacy.html";

  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[ch]);

  /* ---------------- Сценарии квизов ---------------- */

  const DISTRICTS = [
    "Центр и старый город",
    "Восточный и Молодёжный",
    "Донской",
    "Соцгород и Октябрьский",
    "Частный сектор: Хотунок, Новосёловка",
    "Пригород",
    "Пока не знаю"
  ];

  const CLIENT_FLOW = {
    source: "Квиз на сайте",
    title: "Новая заявка с сайта",
    steps: [
      {
        key: "task",
        label: "Задача",
        question: "Что нужно сделать?",
        options: [
          { value: "Купить", hint: "подбор и проверка" },
          { value: "Продать", hint: "оценка и продажа" },
          { value: "Снять", hint: "жильё или помещение" },
          { value: "Сдать", hint: "найти арендатора" }
        ]
      },
      {
        key: "type",
        label: "Объект",
        question: (a) => a.task === "Продать" || a.task === "Сдать" ? "Какой у вас объект?" : "Какой объект ищете?",
        options: (a) => (a.task === "Снять" || a.task === "Сдать")
          ? ["Квартира", "Дом", "Комната", "Коммерческое помещение"]
          : ["Квартира", "Новостройка", "Дом", "Участок", "Коммерция"]
      },
      {
        key: "district",
        label: "Район",
        question: (a) => a.task === "Продать" || a.task === "Сдать" ? "Где находится объект?" : "Какой район рассматриваете?",
        options: DISTRICTS
      },
      {
        key: "budget",
        label: (a) => a.task === "Продать" ? "Сроки" : a.task === "Сдать" ? "Когда сдавать" : "Бюджет",
        question: (a) => {
          if (a.task === "Продать") return "Когда планируете продажу?";
          if (a.task === "Сдать") return "Когда объект готов к сдаче?";
          if (a.task === "Снять") return "Комфортная аренда в месяц?";
          return "На какой бюджет ориентируетесь?";
        },
        options: (a) => {
          if (a.task === "Продать") return ["Как можно скорее", "В ближайшие 1–3 месяца", "Сначала узнать цену"];
          if (a.task === "Сдать") return ["Уже сейчас", "В течение месяца", "Пока изучаю вопрос"];
          if (a.task === "Снять") return ["До 20 000 ₽", "20 000 – 35 000 ₽", "Более 35 000 ₽", "Обсудим"];
          return ["До 3 млн ₽", "3 – 5 млн ₽", "5 – 8 млн ₽", "Более 8 млн ₽", "Нужна ипотека — обсудим"];
        }
      }
    ]
  };

  const CAREER_FLOW = {
    source: "Анкета «Работа агентом»",
    title: "Новый кандидат в агенты",
    steps: [
      {
        key: "experience",
        label: "Опыт",
        question: "Есть ли опыт в недвижимости?",
        options: [
          { value: "Нет, хочу начать", hint: "с нуля" },
          { value: "До 1 года" },
          { value: "1–3 года" },
          { value: "Более 3 лет" }
        ]
      },
      {
        key: "focus",
        label: "Направление",
        question: "Какое направление ближе?",
        options: ["Вторичное жильё", "Новостройки", "Дома и участки", "Коммерция и аренда", "Пока не знаю"]
      },
      {
        key: "format",
        label: "Формат",
        question: "Какой формат работы рассматриваете?",
        options: ["Полный день в офисе", "Совмещаю с другой работой", "Хочу сначала обсудить"]
      }
    ]
  };

  const FLOWS = { client: CLIENT_FLOW, career: CAREER_FLOW };

  const resolve = (v, answers) => (typeof v === "function" ? v(answers) : v);
  const normOption = (o) => (typeof o === "string" ? { value: o } : o);

  const formatPhone = (raw) => {
    let d = raw.replace(/\D/g, "");
    if (d.startsWith("8")) d = "7" + d.slice(1);
    if (d && !d.startsWith("7")) d = "7" + d;
    d = d.slice(0, 11);
    const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
    let out = d ? "+7" : "";
    if (p[0]) out += " " + p[0];
    if (p[1]) out += " " + p[1];
    if (p[2]) out += "-" + p[2];
    if (p[3]) out += "-" + p[3];
    return out;
  };

  const now = () => {
    const t = new Date();
    return `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
  };

  /* ---------------- Квиз ---------------- */

  function initQuiz(root) {
    const flow = FLOWS[root.dataset.leadQuiz] || CLIENT_FLOW;
    const total = flow.steps.length + 1;
    const state = { step: 0, answers: {} };

    root.classList.add("lq");
    root.innerHTML = `
      <div class="lq__top">
        <div class="lq__progress" role="progressbar" aria-valuemin="1" aria-valuemax="${total}" aria-label="Шаг квиза"><span></span></div>
        <p class="lq__counter"></p>
      </div>
      <div class="lq__body" aria-live="polite"></div>
    `;
    const body = root.querySelector(".lq__body");
    const bar = root.querySelector(".lq__progress");
    const counter = root.querySelector(".lq__counter");

    const setProgress = (n) => {
      bar.querySelector("span").style.width = `${Math.min(100, (n / total) * 100)}%`;
      bar.setAttribute("aria-valuenow", String(Math.min(n, total)));
      counter.textContent = n > total ? "Готово" : `Шаг ${n} из ${total}`;
    };

    const focusFirst = () => requestAnimationFrame(() => {
      const target = body.querySelector("[data-autofocus]") || body.querySelector("button, input");
      if (target && root.dataset.touched) target.focus({ preventScroll: true });
    });

    const renderStep = () => {
      const step = flow.steps[state.step];
      const options = resolve(step.options, state.answers).map(normOption);
      setProgress(state.step + 1);
      body.innerHTML = `
        <fieldset class="lq__step">
          <legend class="lq__question">${esc(resolve(step.question, state.answers))}</legend>
          <div class="lq__options ${options.length > 4 ? "lq__options--many" : ""}">
            ${options.map((o) => `
              <button type="button" class="lq__option ${state.answers[step.key] === o.value ? "is-selected" : ""}" data-value="${esc(o.value)}">
                <strong>${esc(o.value)}</strong>${o.hint ? `<small>${esc(o.hint)}</small>` : ""}
              </button>`).join("")}
          </div>
        </fieldset>
        <div class="lq__nav">
          ${state.step > 0 ? `<button type="button" class="lq__back">← Назад</button>` : `<span class="lq__note">Займёт меньше минуты</span>`}
        </div>`;
      body.querySelectorAll(".lq__option").forEach((btn) => {
        btn.addEventListener("click", () => {
          root.dataset.touched = "1";
          state.answers[step.key] = btn.dataset.value;
          btn.classList.add("is-selected");
          setTimeout(() => {
            state.step += 1;
            render();
          }, 160);
        });
      });
      body.querySelector(".lq__back")?.addEventListener("click", () => {
        state.step -= 1;
        render();
      });
      focusFirst();
    };

    const renderContact = () => {
      setProgress(total);
      body.innerHTML = `
        <form class="lq__form" novalidate>
          <p class="lq__question">Куда отправить подборку и ответ?</p>
          <div class="lq__fields">
            <label class="lq__field"><span>Имя</span><input name="name" autocomplete="given-name" required data-autofocus placeholder="Как к вам обращаться"></label>
            <label class="lq__field"><span>Телефон</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" required placeholder="+7 900 000-00-00"></label>
          </div>
          <div class="lq__channels" role="radiogroup" aria-label="Удобный способ связи">
            ${["Звонок", "WhatsApp", "Telegram"].map((c, i) => `
              <label class="lq__chip"><input type="radio" name="channel" value="${c}" ${i === 0 ? "checked" : ""}><span>${c}</span></label>`).join("")}
          </div>
          <label class="lq__consent"><input type="checkbox" name="consent" required checked><span>Согласен на обработку персональных данных по <a href="${esc(privacyHref)}" target="_blank" rel="noopener">политике конфиденциальности</a></span></label>
          <p class="lq__error" hidden></p>
          <div class="lq__submit-row">
            <button type="button" class="lq__back">← Назад</button>
            <button type="submit" class="btn lq__submit">${root.dataset.leadQuiz === "career" ? "Отправить анкету" : "Получить ответ"}</button>
          </div>
        </form>`;
      const form = body.querySelector("form");
      const phone = form.elements.phone;
      phone.addEventListener("input", () => { phone.value = formatPhone(phone.value); });
      body.querySelector(".lq__back").addEventListener("click", () => {
        state.step -= 1;
        render();
      });
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const error = form.querySelector(".lq__error");
        const name = form.elements.name.value.trim();
        const digits = phone.value.replace(/\D/g, "");
        let message = "";
        if (!name) message = "Напишите, как к вам обращаться.";
        else if (digits.length !== 11) message = "Проверьте номер телефона — нужно 11 цифр.";
        else if (!form.elements.consent.checked) message = "Нужно согласие на обработку данных.";
        if (message) {
          error.textContent = message;
          error.hidden = false;
          return;
        }
        error.hidden = true;
        state.answers.name = name;
        state.answers.phone = phone.value;
        state.answers.channel = form.elements.channel.value;

        if (!DEMO) {
          const submit = form.querySelector(".lq__submit");
          submit.disabled = true;
          submit.textContent = "Отправляем…";
          try {
            await fetch(LEAD_ENDPOINT, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ source: flow.source, page: location.pathname, ...state.answers })
            });
          } catch (e) {
            /* при ошибке посетитель всё равно видит телефон офиса */
          }
        }
        state.step += 1;
        render();
        root.dispatchEvent(new CustomEvent("lead:sent", { bubbles: true, detail: { ...state.answers } }));
      });
      focusFirst();
    };

    const telegramPreview = () => {
      const rows = flow.steps.map((s) => [resolve(s.label, state.answers), state.answers[s.key]]);
      rows.push(["Имя", state.answers.name], ["Телефон", state.answers.phone], ["Связь", state.answers.channel]);
      return `
        <div class="tg-preview" aria-label="Пример уведомления в Telegram">
          <div class="tg-preview__head">
            <span class="tg-preview__avatar" aria-hidden="true">ДН</span>
            <div><strong>Домиан НЧ · заявки</strong><small>бот офиса</small></div>
          </div>
          <div class="tg-preview__bubble">
            <p class="tg-preview__title">🔔 ${esc(flow.title)}</p>
            <dl>${rows.map(([k, v]) => `<div><dt>${esc(k)}:</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
            <p class="tg-preview__meta">Источник: ${esc(flow.source)}<time>${now()}</time></p>
          </div>
        </div>`;
    };

    const renderDone = () => {
      setProgress(total + 1);
      const isCareer = root.dataset.leadQuiz === "career";
      body.innerHTML = `
        <div class="lq__done">
          <p class="lq__done-mark" aria-hidden="true">✓</p>
          <p class="lq__question">${esc(state.answers.name)}, спасибо!</p>
          <p class="lq__done-text">${isCareer
            ? "Анкета собрана. Руководитель офиса свяжется с вами, чтобы договориться о знакомстве."
            : "Заявка собрана. Специалист офиса свяжется с вами удобным способом и уточнит детали."}
            Если удобнее — позвоните прямо сейчас: <a href="${OFFICE_TEL}">${OFFICE_PHONE}</a>.</p>
          ${DEMO ? `
            <div class="lq__demo">
              <p class="lq__demo-label">Демо-режим · так заявка придёт в Telegram офиса</p>
              ${telegramPreview()}
              <p class="lq__demo-note">Сейчас данные никуда не отправляются. После подключения заявка будет приходить в Telegram офиса за секунды и сохраняться в таблице заявок.</p>
            </div>` : ""}
          <button type="button" class="lq__restart">Пройти заново</button>
        </div>`;
      body.querySelector(".lq__restart").addEventListener("click", () => {
        state.step = 0;
        state.answers = {};
        render();
      });
      root.dataset.touched = "1";
      requestAnimationFrame(() => body.querySelector(".lq__question")?.setAttribute("tabindex", "-1"));
    };

    const render = () => {
      if (state.step < flow.steps.length) renderStep();
      else if (state.step === flow.steps.length) renderContact();
      else renderDone();
    };

    root.leadQuiz = {
      preset(key, value) {
        state.answers = { [key]: value };
        state.step = flow.steps.findIndex((s) => s.key === key) + 1;
        root.dataset.touched = "1";
        render();
      }
    };

    render();
  }

  /* ---------------- Ипотечный калькулятор ---------------- */

  const rub = (n) => `${Math.round(n).toLocaleString("ru-RU")} ₽`;
  const money = (n) => Math.round(Number(n) || 0).toLocaleString("ru-RU");

  function initMortgage(root) {
    const f = (name) => root.querySelector(`[name="${name}"]`);
    const out = (name) => root.querySelector(`[data-out="${name}"]`);
    const price = f("price");
    const down = f("down");
    const years = f("years");
    const rate = f("rate");
    const ranges = root.querySelectorAll("input[type=range][data-for]");

    const syncRanges = () => {
      ranges.forEach((r) => {
        const target = f(r.dataset.for);
        r.value = parse(target);
        const pct = ((r.value - r.min) / (r.max - r.min)) * 100;
        r.style.setProperty("--fill", `${Math.max(0, Math.min(100, pct))}%`);
      });
    };

    const parse = (input) => Number(String(input.value).replace(/[^\d.,]/g, "").replace(",", ".")) || 0;

    const calc = () => {
      const P = parse(price);
      const D = Math.min(parse(down), P);
      const n = Math.max(1, Math.round(parse(years))) * 12;
      const r = parse(rate) / 100 / 12;
      const loan = Math.max(0, P - D);
      const pay = r > 0 ? loan * (r * (1 + r) ** n) / ((1 + r) ** n - 1) : loan / n;
      const total = pay * n;
      out("pay").textContent = loan > 0 ? rub(pay) : "—";
      out("loan").textContent = rub(loan);
      out("over").textContent = rub(Math.max(0, total - loan));
      out("total").textContent = rub(total + D);
      out("income").textContent = loan > 0 ? rub(pay / 0.5) : "—";
      out("downpct").textContent = P > 0 ? `${Math.round((D / P) * 100)}% от стоимости` : "";
      const share = total > 0 ? (loan / total) * 100 : 100;
      root.querySelector("[data-bar-loan]")?.style.setProperty("width", `${share}%`);
      syncRanges();
    };

    ranges.forEach((r) => {
      r.addEventListener("input", () => {
        const target = f(r.dataset.for);
        target.value = target.dataset.money !== undefined ? money(r.value) : r.value;
        if (r.dataset.for === "price" && parse(down) > parse(price)) down.value = money(parse(price) * 0.2);
        calc();
      });
    });
    [price, down, years, rate].forEach((input) => input.addEventListener("input", calc));
    [price, down].forEach((input) => {
      input.dataset.money = "";
      input.value = money(parse(input));
      input.addEventListener("blur", () => { input.value = money(parse(input)); });
    });
    root.querySelectorAll("[data-down-pct]").forEach((btn) => {
      btn.addEventListener("click", () => {
        down.value = money(parse(price) * Number(btn.dataset.downPct) / 100);
        calc();
      });
    });
    calc();
  }

  /* ---------------- Фильтр каталога ---------------- */

  function initCatalog(root) {
    const chips = root.querySelectorAll("[data-filter]");
    const cards = root.querySelectorAll("[data-kind]");
    const count = root.querySelector("[data-catalog-count]");
    const apply = (kind) => {
      let shown = 0;
      cards.forEach((c) => {
        const on = kind === "all" || c.dataset.kind === kind;
        c.hidden = !on;
        if (on) shown += 1;
      });
      chips.forEach((ch) => ch.setAttribute("aria-pressed", String(ch.dataset.filter === kind)));
      if (count) count.textContent = `Показано: ${shown}`;
    };
    chips.forEach((ch) => ch.addEventListener("click", () => apply(ch.dataset.filter)));
    apply("all");
  }

  /* ---------------- Запуск ---------------- */

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-lead-quiz]").forEach(initQuiz);
    document.querySelectorAll("[data-mortgage]").forEach(initMortgage);
    document.querySelectorAll("[data-catalog]").forEach(initCatalog);

    // Кнопки «Продать», «Сдать» и т. п. открывают квиз сразу с нужной задачей.
    document.querySelectorAll("[data-quiz-preset]").forEach((link) => {
      link.addEventListener("click", (event) => {
        const quiz = document.querySelector('[data-lead-quiz="client"]');
        if (!quiz?.leadQuiz) return;
        event.preventDefault();
        quiz.leadQuiz.preset("task", link.dataset.quizPreset);
        quiz.closest("section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  });
})();
