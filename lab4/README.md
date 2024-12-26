### Лабораторная работа №4

---

## **1. Плохой CI/CD файл**
```yaml
name: Bad CI/CD Pipeline

on: [push]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Install dependencies
        run: npm install

      - name: Build application
        run: npm run build

      - name: Deploy to production
        run: |
          ssh user@server 'cd /var/www/app && git pull && npm install && npm run build && pm2 restart app'
```

---

## **2. Хороший CI/CD файл**
```yaml
name: Good CI/CD Pipeline

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build application
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: build-artifact
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest

    steps:
      - name: Download artifact
        uses: actions/download-artifact@v3
        with:
          name: build-artifact

      - name: Deploy application
        env:
          SERVER_IP: ${{ secrets.SERVER_IP }}
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
        run: |
          echo "$SSH_PRIVATE_KEY" > private_key && chmod 600 private_key
          scp -i private_key -r dist/* user@$SERVER_IP:/var/www/app
          ssh -i private_key user@$SERVER_IP 'pm2 restart app'
```

---

## **3. Описание плохих практик и их исправлений**

### **Плохая практика 1: Отсутствие ограничения веток для запуска пайплайна**
- **Проблема:** Пайплайн запускается на любом коммите, включая черновики и тестовые изменения.
- **Исправление:** Ограничен запуск только для ветки main.
- **Результат:** Уменьшена вероятность случайного запуска в рабочей среде.

### **Плохая практика 2: Отсутствие кэширования зависимостей**
- **Проблема:** Каждый запуск устанавливает зависимости с нуля, замедляя выполнение.
- **Исправление:** Добавлено кэширование зависимостей для ускорения сборки.
- **Результат:** Сборка выполняется быстрее за счёт использования кэша.

### **Плохая практика 3: Использование npm install вместо npm ci**
- **Проблема:** npm install может привести к установке несовместимых версий зависимостей.
- **Исправление:** Заменено на npm ci для детерминированной установки зависимостей.
- **Результат:** Обеспечена консистентность зависимостей.

### **Плохая практика 4: Пропуск тестов перед сборкой**
- **Проблема:** Пайплайн не проверяет качество кода, что может привести к деплою нерабочего приложения.
- **Исправление:** Добавлен этап запуска тестов перед сборкой.
- **Результат:** Обнаружение ошибок до сборки и деплоя.

### **Плохая практика 5: Жёстко закодированные креденшалы в коде**
- **Проблема:** SSH-доступ к серверу в плохом файле реализован через открытые команды, что небезопасно.
- **Исправление:** Использованы секреты GitHub Actions для безопасного хранения данных доступа.
- **Результат:** Повышена безопасность пайплайна.

### **Плохая практика 6: Прямой деплой на сервер без артефактов**
- **Проблема:** Код собирается и компилируется непосредственно на сервере, увеличивая риск ошибок.
- **Исправление:** Добавлено сохранение сборки как артефакта и передача готовых файлов на сервер.
- **Результат:** Минимизируется риск ошибок на сервере и сокращается время деплоя.

---

## **4. Итоги работы**
Мы создали два CI/CD пайплайна: "плохой" с ошибками и "хороший" с исправлениями. Рассмотрели основные проблемы и объяснили, как их устранить для повышения безопасности, надёжности и производительности пайплайна. 🚀🎉

