# CineMate -- Movie Finder

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Vite](https://img.shields.io/badge/Vite-4.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![OMDb API](https://img.shields.io/badge/OMDb_API-integrated-E50914?style=flat-square)](https://www.omdbapi.com/)
[![License: MIT](https://img.shields.io/github/license/PavelHopson/cinemate-movie-finder?style=flat-square)](LICENSE.md)
[![GitHub Pages](https://img.shields.io/badge/Demo-GitHub_Pages-181717?style=flat-square&logo=github)](https://pavelhopson.github.io/cinemate-movie-finder)

Современное одностраничное приложение (SPA) для поиска фильмов с рейтингами и описаниями. Использует OMDb API, поддерживает светлую/темную тему, избранное и оффлайн-режим.

<img width="1894" height="949" alt="CineMate главная" src="https://github.com/user-attachments/assets/a037b313-26b4-4985-8f20-6959881ffc49" />

<img width="1891" height="946" alt="CineMate карточка фильма" src="https://github.com/user-attachments/assets/be4e4050-161c-4a7b-9ed4-0166a767fde4" />

---

## Демо

**[Открыть CineMate на GitHub Pages](https://pavelhopson.github.io/cinemate-movie-finder)**

---

## Возможности

- Поиск фильмов с оптимизацией через debounce
- Переключение светлой/темной темы
- Сохранение избранных фильмов в localStorage
- Оффлайн-режим с резервными данными при недоступности API
- Адаптивный дизайн для всех устройств
- Деплой на GitHub Pages (без зависимостей от заблокированных сервисов)

---

## Технологический стек

| Технология | Назначение |
|---|---|
| **Vanilla JS (ES6+)** | Логика приложения без фреймворков |
| **HTML5 / CSS3** | Разметка и стилизация |
| **Vite** | Сборка и dev-сервер |
| **OMDb API** | Источник данных о фильмах |
| **localStorage** | Хранение избранного и настроек темы |
| **GitHub Pages** | Хостинг |

---

## Быстрый старт

### Установка

```bash
git clone https://github.com/PavelHopson/cinemate-movie-finder.git
cd cinemate-movie-finder
npm install
```

### Настройка API-ключа

1. Получите бесплатный ключ на [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx)
2. Скопируйте `.env.example` в `.env`:
   ```bash
   cp .env.example .env
   ```
3. Укажите ваш ключ в `.env`

### Запуск

```bash
npm run dev
```

Откройте в браузере: http://localhost:5173

### Сборка для продакшена

```bash
npm run build
```

### Деплой на GitHub Pages

```bash
npm run deploy
```

---

## Структура проекта

```
cinemate-movie-finder/
├── src/
│   ├── js/           # JavaScript-модули приложения
│   ├── css/          # Стили
│   └── data/         # Резервные данные для оффлайн-режима
├── index.html        # Точка входа
├── package.json
├── .env.example      # Пример переменных окружения
└── LICENSE.md
```

---

## Лицензия

Проект распространяется под лицензией MIT. Подробнее см. [LICENSE.md](LICENSE.md).

## Автор

**Павел Хопсон** — [GitHub](https://github.com/PavelHopson)
