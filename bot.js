const TelegramBot = require('node-telegram-bot-api');
const ytdl = require('ytdl-core');
const fs = require('fs');

// Замените 'YOUR_TELEGRAM_BOT_TOKEN' на токен вашего бота
const bot = new TelegramBot('YOUR_TELEGRAM_BOT_TOKEN', {polling: true});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const url = msg.text;

  // Проверяем, что это валидная ссылка на YouTube
  if (ytdl.validateURL(url)) {
    bot.sendMessage(chatId, 'Скачиваю видео...');

    // Получаем информацию о видео
    let info = await ytdl.getInfo(url);

    // Выбираем поток с наивысшим качеством видео
    let format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' });
        
    // Создаем поток для скачивания
    const stream = ytdl.downloadFromInfo(info, { format: format });
    const fileName = `video-${chatId}-${Date.now()}.mp4`;

    stream.pipe(fs.createWriteStream(fileName)).on('close', () => {
      bot.sendVideo(chatId, fileName).then(() => {
        // Удаляем файл после отправки
        fs.unlinkSync(fileName);
      });
    });
  } else {
    bot.sendMessage(chatId, 'Пожалуйста, отправьте валидную ссылку на YouTube.');
  }
});
