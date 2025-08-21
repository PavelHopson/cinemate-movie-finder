# CineMate — современное SPA для поиска фильмов

<img width="1894" height="949" alt="image" src="https://github.com/user-attachments/assets/a037b313-26b4-4985-8f20-6959881ffc49" />

<img width="1891" height="946" alt="image" src="https://github.com/user-attachments/assets/be4e4050-161c-4a7b-9ed4-0166a767fde4" />


CineMate — это современное одностраничное приложение (SPA) для поиска информации о фильмах с использованием **OMDb API**. Приложение адаптивное, поддерживает светлую и тёмную тему, работает с избранными фильмами и оффлайн-режимом.

---

## Функции

- 🎬 Поиск фильмов с оптимизацией через **debounce**  
- 🌙 Переключение светлой/тёмной темы  
- ❤️ Сохранение избранных фильмов в **localStorage**  
- 📡 Работает в оффлайн-режиме с резервными данными  
- 🌐 Адаптивный дизайн для всех устройств  
- 🚀 Деплой на **GitHub Pages**

---

## Используемые технологии

![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-181818?logo=javascript&logoColor=F7DF1E)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)

---

## Демо

[Смотреть онлайн на GitHub Pages](https://pavelhopson.github.io/cinemate-movie-finder)

## Repository

[Смотреть на GitHub](https://github.com/PavelHopson/cinemate-movie-finder.git)

---

## Установка и запуск

1. Клонируем репозиторий:
```bash
git clone https://github.com/PavelHopson/cinemate-movie-finder.git
cd cinemate
```
2. Устанавливаем зависимости:
```bash
npm install
```
3. Запуск сервера разработки:
```bash
npm run dev
```
Откройте в браузере http://localhost:5173
4. Сборка для продакшена:
```bash
npm run build
```
В результате появится папка dist с готовыми файлами.
Деплой на GitHub Pages
1. Обновите package.json с вашими данными репозитория:
```bash
"homepage": "https://github.com/PavelHopson/cinemate-movie-finder.git"
```
2. Устанавливаем gh-pages:
```bash
npm install gh-pages --save-dev
```
3. Добавляем скрипты деплоя в package.json:
```bash
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```
4. Деплой:
```bash
npm run deploy
```
Особенности для пользователей из России
🌐 Используется GitHub Pages вместо Vercel/Netlify (могут быть заблокированы)
💾 Включён оффлайн-режим с резервными данными
🚫 Нет зависимостей от сервисов Google
🌐 Интерфейс полностью на русском языке
При недоступности API приложение автоматически переключается на оффлайн-режим с кэшированными или резервными данными

Настройка API ключа
1. Зарегистрируйтесь для получения бесплатного ключа API на [Регистрация OMDb API](https://www.omdbapi.com/apikey.aspx)
2. Создайте файл `.env` в корневом каталоге с вашим ключом API: VITE_OMDB_API_KEY=your_api_key_here
3. Перезапустите сервер разработки

Вклад в проект
Вклад приветствуется! Создавайте issues или отправляйте pull requests.

Лицензия
![alt text](image.png)
Проект лицензирован по лицензии MIT - см. ЛИЦЕНЗИЯ Файл для получения подробной информации.

Если выдает ошибку, то в корне создайте файл vite.config.js:
```bash
import { defineConfig } from 'vite'
export default defineConfig({
  root: 'src',
  base: '/',
  build: {
    outDir: '../dist'
  }
})
```
