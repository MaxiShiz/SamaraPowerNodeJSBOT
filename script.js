const TelegramBot = require('node-telegram-bot-api');
const token = '5966038361:AAF_dEcs1l_3vAuL0TUCC0P5-Xj4ZcHsWR0';
const mysql = require('mysql');
const bot = new TelegramBot(token, {polling: true});
let shouldBotReact = true;

//Админ панель
const connectionadmin = mysql.createConnection({
  host: '81.200.151.250',
  user: 'gen_user',
  password: 'SamaraPower123',
  database: 'default_db',
  port: "3306"
});
const AdminID = '-1001656677431';
const adminbut = [
      [{ text: '✅ Одобрить заявку! ', callback_data: 'approve'}],
      [{ text: '❌ Отклонить заявку!', callback_data: 'reject'}],
      ];

      const adminkeybord = {
        inline_keyboard: adminbut,
      };

const websiteLink = 'https://samara-power.clients.site/';
const vkLink = 'https://vk.com/realsamarapower';
const telegramLink = 'https://t.me/samarapower1';
const backmenu = 'Вернуться к меню';

const buttonshelpst = [
  [{ text: '🖥️ Наш сайт', url: websiteLink }],
  [{ text: '📱 Группа ВКонтакте', url: vkLink }],
  [{ text: '✈️ Telegram', url: telegramLink }],
  [{ text: '\u{1F519} Вернуться к меню', callback_data: 'backmenu'}],
    ];

const keyboardhelpst = {
  inline_keyboard: buttonshelpst,
};


// Прокат Велосипедов
setInterval(checkNewBike, 5000); // Интервал проверки таблицы на новые значения
let sentMessages = {};
let bookingId;
let rentalTime, gender, rentalDate, rentalTimelock, phone, name;
let userId;

/* Логика обработки админ-клавиатуры */
bot.on('callback_query', async (query) => {

  if (query.message.chat.id === AdminID) {
    const callbackdata = query.data;
  }

  const { data, message } = query;

  if (data === 'approve') { // Нажатие на кнопку подтверждения
    const messageIdadm = sentMessages[bookingId];
    if (messageIdadm) {
      connectionadmin.query("UPDATE reservBike SET Статус = 'Одобрено' WHERE id = ?", [bookingId], (error) => {
        if (error) { // Обновление статуса в таблице
          console.error('Ошибка при обновлении данных в таблице: ', error);
        }
      });
      bot.sendMessage(AdminID, `<b>Заявка №<i>${bookingId}</i> \nБронь велосипеда</b> \nОдобрена ✅ \n\nДанные пользователя: \n` +
        `<i>Время проката:</i> ${rentalTime}\n` +
        `<i>Пол:</i> ${gender}\n` +
        `<i>Дата проката:</i> ${rentalDate}\n` +
        `<i>Время брони:</i> ${rentalTimelock}\n` +
        `<i>Телефон:</i> ${phone}\n` +
        `<i>Имя:</i> ${name}`, { parse_mode: 'HTML' }); // Отправка нового сообщения
      bot.deleteMessage(AdminID, messageIdadm); // Удаление старого сообщения
      delete sentMessages[bookingId]; // Удаление идентификатора заявки из объекта
      const statusbike = 'Одобрено';
      notifyUserbike(userId, statusbike);
    } else {
      console.error('Идентификатор сообщения не найден');
    }

  } else if (data === 'reject') { // Нажатие на кнопку отклонения
    const messageIdadm = sentMessages[bookingId];
    if (messageIdadm) {
      connectionadmin.query("UPDATE reservBike SET Статус = 'Отклонено' WHERE id = ?", [bookingId], (error) => {
        if (error) { // Обновление статуса в таблице
          console.error('Ошибка при обновлении данных в таблице: ', error);
        }
      });
      bot.sendMessage(AdminID, `<b>Заявка №<i>${bookingId}</i> \nБронь велосипеда</b> \nОтклонена ❌ \n\nДанные пользователя: \n` +
        `<i>Время проката:</i> ${rentalTime}\n` +
        `<i>Пол:</i> ${gender}\n` +
        `<i>Дата проката:</i> ${rentalDate}\n` +
        `<i>Время брони:</i> ${rentalTimelock}\n` +
        `<i>Телефон:</i> ${phone}\n` +
        `<i>Имя:</i> ${name}`, { parse_mode: 'HTML' }); // Отправка нового сообщения
      bot.deleteMessage(AdminID, messageIdadm); // Удаление старого сообщения
      delete sentMessages[bookingId]; // Удаление идентификатора заявки из объекта
      const statusbike = 'Отклонено';
      notifyUserbike(userId, statusbike);
    } else {
      console.error('Идентификатор сообщения не найден');
    }
  }
});


function notifyUserbike(chatId, statusbike) {
  let messagebikest;
  if (statusbike === 'Одобрено') {
    messagebikest = `<b>Заявка №<i>${bookingId}</i> \nБронь велосипеда</b> \nОдобрена ✅ \n\nВаши данные: \n<i>Время проката:</i> ${rentalTime} \n<i>Пол:</i> ${gender} \n<i>Дата проката:</i> ${rentalDate} \n<i>Время брони:</i> ${rentalTimelock} \n<i>Телефон:</i> ${phone} \n<i>Имя:</i> ${name} \n\nДополнительная информация:\n📞+79633693929`;
  } else if (statusbike === 'Отклонено') {
    messagebikest = `<b>Заявка №<i>${bookingId}</i> \nБронь велосипеда</b> \nОтклонена ❌ \n\nВаши данные: \n<i>Время проката:</i> ${rentalTime} \n<i>Пол:</i> ${gender} \n<i>Дата проката:</i> ${rentalDate} \n<i>Время брони:</i> ${rentalTimelock} \n<i>Телефон:</i> ${phone} \n<i>Имя:</i> ${name} \n\nДополнительная информация:\n📞+79633693929`;
  } else {
    messagebikest = 'Статус Вашей заявки: ' + statusbike;
  }
  bot.sendMessage(chatId, messagebikest, { parse_mode: 'HTML', reply_markup: keyboardhelpst });
}

function notifyUsersup(chatIdsup, statussup) {
  let messagesupst;
  if (statussup === 'Одобрено') {
    messagesupst = `<b>Заявка №<i>${bookingIdsup}</i> \nБронь SUP</b> \nОдобрена ✅ \n\nВаши данные: \n<i>Время проката:</i> ${rentalTimesup} \n<i>Дата проката:</i> ${rentalDatesup} \n<i>Время брони:</i> ${rentalTimelocksup} \n<i>Телефон:</i> ${phonesup} \n<i>Имя:</i> ${namesup} \n\nДополнительная информация:\n📞+79633693929`;
  } else if (statussup === 'Отклонено') {
    messagesupst = `<b>Заявка №<i>${bookingIdsup}</i> \nБронь SUP</b> \nОтклонена ❌ \n\nВаши данные: \n<i>Время проката:</i> ${rentalTimesup} \n<i>Дата проката:</i> ${rentalDatesup} \n<i>Время брони:</i> ${rentalTimelocksup} \n<i>Телефон:</i> ${phonesup} \n<i>Имя:</i> ${namesup} \n\nДополнительная информация:\n📞+79633693929`;
  } else {
    messagesupst = 'Статус Вашей заявки: ' + statussup;
  }
  bot.sendMessage(chatIdsup, messagesupst, { parse_mode: 'HTML', reply_markup: keyboardhelpst });
}

function checkNewBike() { // Функция проверки и оповещения о новых заявках
  const AdminID = '-1001656677431'; // ID админ-чата
  connectionadmin.query("SELECT * FROM reservBike WHERE Статус = 'Ожидание'", (error, rows) => {
    if (error) {
      console.error('Ошибка поиска для админ панели: ', error);
      return;
    } // Условия проверки таблицы

    rows.forEach((row) => { // Массив заголовков таблицы
      userId = row.user_id // ChatId юзера
      bookingId = row.id; // Порядковый номер клиента
      rentalTime = row.Время_проката; // Время проката
      gender = row.Пол; // Пол клиента
      rentalDate = row.Дата_проката; // Дата брони
      rentalTimelock = row.Время_брони; // Время брони
      phone = row.Телефон; // Телефон клиента
      name = row.Имя; // Имя клиента

      /* Условие остановки проверки */
      if (sentMessages[bookingId]) {
        return;
      }

      /* Отправка сообщения о новой заявке */
      bot.sendMessage(AdminID, `<b>Заявка №<i>${bookingId}</i></b> \nНовая заявка на бронь велосипеда! \n\nДанные пользователя: \n` +
        `<i>Время проката:</i> ${rentalTime}\n` +
        `<i>Пол:</i> ${gender}\n` +
        `<i>Дата проката:</i> ${rentalDate}\n` +
        `<i>Время брони:</i> ${rentalTimelock}\n` +
        `<i>Телефон:</i> ${phone}\n` +
        `<i>Имя:</i> ${name}`, { parse_mode: 'HTML', reply_markup: adminkeybord })
        .then((sentMessage) => {
          sentMessages[bookingId] = sentMessage.message_id; // Сохранение идентификатора отправленного сообщения
        })
        .catch((error) => {
          console.error('Ошибка при отправке сообщения: ', error);
        });
    });
  });
}


const adminbutsup = [
      [{ text: '✅ Одобрить заявку! ', callback_data: 'approvesup'}],
      [{ text: '❌ Отклонить заявку!', callback_data: 'rejectsup'}],
      ];

      const adminkeybordsup = {
        inline_keyboard: adminbutsup,
      };

// Прокат SUP
setInterval(checkNewSup, 5000); // Интервал проверки таблицы на новые значения
let sentMessagessup = {};
let bookingIdsup;
let rentalTimesup, rentalDatesup, rentalTimelocksup, phonesup, namesup;
let userIdsup;

/* Логика обработки админ-клавиатуры */
bot.on('callback_query', async (query) => {
  if (query.message.chat.id === AdminID) {
    const callbackdata = query.data;
  }

  const { data, message } = query;

  if (data === 'approvesup') { // Нажатие на кнопку подтверждения
    const messageIdadm = sentMessagessup[bookingIdsup];
    if (messageIdadm) {
      connectionadmin.query("UPDATE reservSup SET Статус = 'Одобрено' WHERE id = ?", [bookingIdsup], (error) => {
        if (error) { // Обновление статуса в таблице
          console.error('Ошибка при обновлении данных в таблице: ', error);
        }
      });
      bot.sendMessage(AdminID, `<b>Заявка №<i>${bookingIdsup}</i> \nБронь SUP</b> \nОдобрена ✅ \n\nДанные пользователя: \n` +
        `<i>Время проката:</i> ${rentalTimesup}\n` +
        `<i>Дата проката:</i> ${rentalDatesup}\n` +
        `<i>Время брони:</i> ${rentalTimelocksup}\n` +
        `<i>Телефон:</i> ${phonesup}\n` +
        `<i>Имя:</i> ${namesup}`, { parse_mode: 'HTML' }); // Отправка нового сообщения
      bot.deleteMessage(AdminID, messageIdadm); // Удаление старого сообщения
      delete sentMessagessup[bookingIdsup]; // Удаление идентификатора заявки из объекта
      const statussup = 'Одобрено';
      notifyUsersup(userIdsup, statussup);
    } else {
      console.error('Идентификатор сообщения не найден', error);
    }

  } else if (data === 'rejectsup') { // Нажатие на кнопку отклонения
    const messageIdadm = sentMessagessup[bookingIdsup];
    if (messageIdadm) {
      connectionadmin.query("UPDATE reservSup SET Статус = 'Отклонено' WHERE id = ?", [bookingIdsup], (error) => {
        if (error) { // Обновление статуса в таблице
          console.error('Ошибка при обновлении данных в таблице: ', error);
        }
      });
      bot.sendMessage(AdminID, `<b>Заявка №<i>${bookingIdsup}</i> \nБронь SUP</b> \nОтклонена ❌ \n\nДанные пользователя: \n` +
        `<i>Время проката:</i> ${rentalTimesup}\n` +
        `<i>Дата проката:</i> ${rentalDatesup}\n` +
        `<i>Время брони:</i> ${rentalTimelocksup}\n` +
        `<i>Телефон:</i> ${phonesup}\n` +
        `<i>Имя:</i> ${namesup}`, { parse_mode: 'HTML' }); // Отправка нового сообщения
      bot.deleteMessage(AdminID, messageIdadm); // Удаление старого сообщения
      delete sentMessagessup[bookingIdsup]; // Удаление идентификатора заявки из объекта
      const statussup = 'Отклонено';
      notifyUsersup (userIdsup, statussup);
    } else {
      console.error('Идентификатор сообщения не найден', error);
    }
  }
});

function checkNewSup() { // Функция проверки и оповещения о новых заявках
  const AdminID = '-1001656677431'; // ID админ-чата
  connectionadmin.query("SELECT * FROM reservSup WHERE Статус = 'Ожидание'", (error, rows) => {
    if (error) {
      console.error('Ошибка поиска для админ панели: ', error);
      return;
    } // Условия проверки таблицы

    rows.forEach((row) => { // Массив заголовков таблицы
      userIdsup = row.user_id;
      bookingIdsup = row.id; // Порядковый номер клиента
      rentalTimesup = row.Время_проката; // Время проката
      rentalDatesup = row.Дата_проката; // Дата брони
      rentalTimelocksup = row.Время_брони; // Время брони
      phonesup = row.Телефон; // Телефон клиента
      namesup = row.Имя; // Имя клиента

      /* Условие остановки проверки */
      if (sentMessagessup[bookingIdsup]) {
        return;
      }

      /* Отправка сообщения о новой заявке */
      bot.sendMessage(AdminID, `<b>Заявка №<i>${bookingIdsup}</i></b> \nНовая заявка на бронь SUP-доски! \n\nДанные пользователя: \n` +
        `<i>Время проката:</i> ${rentalTimesup}\n` +
        `<i>Дата проката:</i> ${rentalDatesup}\n` +
        `<i>Время брони:</i> ${rentalTimelocksup}\n` +
        `<i>Телефон:</i> ${phonesup}\n` +
        `<i>Имя:</i> ${namesup}`, { parse_mode: 'HTML', reply_markup: adminkeybordsup })
        .then((sentMessage) => {
          sentMessagessup[bookingIdsup] = sentMessage.message_id; // Сохранение идентификатора отправленного сообщения
        })
        .catch((error) => {
          console.error('Ошибка при отправке сообщения: ', error);
        });
    });
  });
}


  // Создание таблицы
const connectiontable = mysql.createConnection({
  host: '81.200.151.250',
  user: 'gen_user',
  password: 'SamaraPower123',
  database: 'default_db',
  port: "3306"
});

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS reservSup (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      Время_проката VARCHAR(50),
      Дата_проката VARCHAR(50),
      Время_брони VARCHAR(50),
      Телефон VARCHAR(50),
      Имя VARCHAR(50)
    )
  `;

  const addDefaultNotifiedValueQuery = `
  ALTER TABLE reservSup
  ADD COLUMN Статус VARCHAR(50) DEFAULT 'Ожидание'
`;

  connectiontable.query(createTableQuery, (err) => {
    if (err) {
      console.error('Ошибка создания таблицы: ' + err.stack);
      return;
    }

    console.log('Таблица "reservSup" успешно создана');

  });

    connectiontable.query(addDefaultNotifiedValueQuery, (err) => {
    if (err) {
      console.error('Ошибка добавления столбца: ' + err.stack);
      return;
    }

    console.log('Строка добавлена!');
  });



let userChatIdFM = [];

// Обработчик команды /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  // Создание клавиатуры с кнопками
  const keyboard = {
    reply_markup: {
      keyboard: [
        ['\u{1F527} Ремонт', '🚲 Прокат'],
        ['\u{1F4B2} Магазин', '\u{1F525} Отзывы'],
        ['\u{1F4A1} Задать вопрос']
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  };
});

//Клавиатура для любых сообщений
  const keyboardall = {
    reply_markup: {
      keyboard: [
        ['\u{1F4A1} Задать вопрос'],
        ['\u{1F519} Вернуться к меню']
        ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  }

//Ветка обратной связи и отзывов
  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;

    if (!shouldBotReact) {
      return;
    }

    const { data } = query;
    const keyboard = {
    reply_markup: {
      keyboard: [
        ['\u{1F527} Ремонт', '🚲 Прокат'],
        ['\u{1F4B2} Магазин', '\u{1F525} Отзывы'],
        ['\u{1F4A1} Задать вопрос']
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  };

  if (data === 'backmenu') {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    bot.sendMessage(chatId, 'Samara Power приветствует Вас снова \u{1F525} \nЧто Вас интересует сейчас?', keyboard)
    .then(() => {
    bot.answerCallbackQuery(query.id);
      });
    } else if (data === 'supbut') {
      const chatId = query.message.chat.id;
      const messageId = query.message.message_id;
      const buttonsharsup = [
          [{ text: '🏄‍ Забронировать SUP-доску', callback_data: 'suplock'}],
          [{ text: '\u{1F519} Вернуться к меню',  callback_data: 'backmenu'}],  
        ];

      const keyboardsharsup = {
        inline_keyboard: buttonsharsup,
      };

      bot.sendMessage(chatId, 'Вот тариф на прокат SUP-досок: \n\nСутки - 1000 рублей 🏄‍ \n\nЕсли хочешь забронировать SUP-доску, пожалуйста, нажми кнопку "Забронировать" и введи свои данные. 📝', {reply_markup: keyboardsharsup})
      .then(() => {
        bot.answerCallbackQuery(query.id);
      });
  } else if (data === 'suplock') {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const userDatasup = {};
    shouldBotReact = false;

    if (!userDatasup[chatId]) {
      userDatasup[chatId] = {};
    }

    const userData = userDatasup[chatId];

    const rentalTimesup = userDatasup.rentalTime;
    const rentalDatesup = userDatasup.rentalDate;
    const rentalTimelocksup = userDatasup.rentalTimelock;
    const phonesup = userDatasup.phone;
    const namesup = userDatasup.name;

    const websiteLink = 'https://samara-power.clients.site/';
    const vkLink = 'https://vk.com/realsamarapower';
    const telegramLink = 'https://t.me/samarapower1';
    const backmenu = 'Вернуться к меню';
    const buttonsresultsup = [
      [{ text: '🖥️ Наш сайт', url: websiteLink }],
      [{ text: '📱 Группа ВКонтакте', url: vkLink }],
      [{ text: '✈️ Telegram', url: telegramLink }],
      [{ text: '\u{1F519} Вернуться к меню', callback_data: 'backmenu'}],
      ];

      const keyboardresultsup = {
      inline_keyboard: buttonsresultsup,
      };

bot.sendMessage(chatId, 'Укажите время проката SUP-доски (например, 1 день)')
  .then(() => {
    let dataSaved = false;

    bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      if (!userDatasup[chatId]) {
        return;
      }
      if (msg.from.id !== bot.botId) {
      if (!userData.rentalTime) {
        const rentalTimesup = msg.text;
        userData.rentalTime = msg.text;

        bot.sendMessage(chatId, 'Укажите дату проката (например, 01.01.2023)');
      } else if (!userData.rentalDate) {
        const rentalDatesup = msg.text;
        userData.rentalDate = rentalDatesup;

        bot.sendMessage(chatId, 'Укажите время, в которое Вы бы хотели взять SUP-доску (например, 10:00)');
      } else if (!userData.rentalTimelock) {
        const rentalTimelocksup = msg.text;
        userData.rentalTimelock = rentalTimelocksup;

        bot.sendMessage(chatId, 'Укажите Ваш телефон');
      } else if (!userData.phone) {
        const phonesup = msg.text;
        userData.phone = phonesup;

        bot.sendMessage(chatId, 'Укажите Ваше имя');
      } else if (!userData.name) {
        const namesup = msg.text;
        userData.name = namesup;

        bot.sendMessage(chatId, `Спасибо за заполнение заявки! Ваши данные: \n\n` +
        `<i>Время проката:</i> ${userData.rentalTime} \n` +
        `<i>Дата проката:</i> ${userData.rentalDate} \n` +
        `<i>Время брони:</i> ${userData.rentalTimelock} \n` +
        `<i>Телефон:</i> ${userData.phone} \n` +
        `<i>Имя:</i> ${userData.name} \n` +
        'Ожидайте ответа по Вашей заявке!', { parse_mode: 'HTML', reply_markup: keyboardresultsup });

          const query = 'INSERT INTO reservSup (user_id, Время_проката, Дата_проката, Время_брони, Телефон, Имя) VALUES (?, ?, ?, ?, ?, ?)';
          const values = [chatId, userData.rentalTime, userData.rentalDate, userData.rentalTimelock, userData.phone, userData.name];
          const connection = mysql.createConnection({
            host: '81.200.151.250',
            user: 'gen_user',
            password: 'SamaraPower123',
            database: 'default_db',
            port: "3306"
        });
          
          connection.query(query, values, (err, result) => {
            if (err) {
              console.error('Все хуйня, Миша, ошибка данных: ' + err.stack);
              return;
            }

            console.log('Все заебись, данные в таблице');
            dataSaved = true;
            shouldBotReact = true;
          });
        }

        if (dataSaved) {
          delete userDatasup[chatId];
          return;
        }
      }
    });
  });

  } else if (data === 'bikebut') {
      const chatId = query.message.chat.id;
      const messageId = query.message.message_id;
      const buttonsharbike = [
          [{ text: '🚴 Забронировать велосипед', callback_data: 'bikelock'}],
          [{ text: '\u{1F519} Вернуться к меню',  callback_data: 'backmenu'}],
          ];

        const keyboardsharbike = {
          inline_keyboard: buttonsharbike,
        };

bot.sendMessage(chatId, 'Вот тарифы на прокат велосипедов: \n\n1 час - 250 рублей 🚴 \n2 часа - 400 рублей 🚴 \n4 часа - 600 рублей 🚴 \n8 часов - 900 рублей 🚴 \nСутки - 1200 рублей 🚴 \n\nЕсли хочешь забронировать велосипед, пожалуйста, нажми кнопку "Забронировать" и введи свои данные. 📝', { reply_markup: keyboardsharbike })
  .then(() => {
    bot.answerCallbackQuery(query.id);
  });
} else if (data === 'bikelock') {
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;
  const userDatabike = {};
  shouldBotReact = false;

  if (!userDatabike[chatId]) {
    userDatabike[chatId] = {};
  }

  const userData = userDatabike[chatId]; 

  const rentalTime = userDatabike.rentalTime;
  const gender = userDatabike.gender;
  const rentalDate = userDatabike.rentalDate;
  const rentalTimelock = userDatabike.rentalTimelock;
  const phone = userDatabike.phone;
  const name = userDatabike.name;

  const websiteLink = 'https://samara-power.clients.site/';
  const vkLink = 'https://vk.com/realsamarapower';
  const telegramLink = 'https://t.me/samarapower1';
  const backmenu = 'Вернуться к меню';
  const buttonsresult = [
    [{ text: '🖥️ Наш сайт', url: websiteLink }],
    [{ text: '📱 Группа ВКонтакте', url: vkLink }],
    [{ text: '✈️ Telegram', url: telegramLink }],
    [{ text: '\u{1F519} Вернуться к меню', callback_data: 'backmenu'}],
    ];

    const keyboardresult = {
    inline_keyboard: buttonsresult,
    };

bot.sendMessage(chatId, 'Укажите время проката велосипеда (например, 2 часа)')
  .then(() => {
    let dataSaved = false;

    bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      if (!userDatabike[chatId]) {
        return;
      }
      if (msg.from.id !== bot.botId) {
      if (!userData.rentalTime) {
        const rentalTime = msg.text;
        userData.rentalTime = msg.text;

        bot.sendMessage(chatId, 'Укажите Ваш пол (мужской/женский)');
      } else if (!userData.gender) {
        const gender = msg.text;
        userData.gender = gender;

        bot.sendMessage(chatId, 'Укажите дату проката (например, 01.01.2023)');
      } else if (!userData.rentalDate) {
        const rentalDate = msg.text;
        userData.rentalDate = rentalDate;

        bot.sendMessage(chatId, 'Укажите время, в которое Вы бы хотели взять велосипед (например, 10:00)');
      } else if (!userData.rentalTimelock) {
        const rentalTimelock = msg.text;
        userData.rentalTimelock = rentalTimelock;

        bot.sendMessage(chatId, 'Укажите Ваш телефон');
      } else if (!userData.phone) {
        const phone = msg.text;
        userData.phone = phone;

        bot.sendMessage(chatId, 'Укажите Ваше имя');
      } else if (!userData.name) {
        const name = msg.text;
        userData.name = name;

        bot.sendMessage(chatId, `Спасибо за заполнение заявки. Ваши данные: \n\n` +
        `<i>Время проката:</i> ${userData.rentalTime} \n` +
        `<i>Пол:</i> ${userData.gender} \n` +
        `<i>Дата проката:</i> ${userData.rentalDate} \n` +
        `<i>Время брони:</i> ${userData.rentalTimelock} \n` +
        `<i>Телефон:</i> ${userData.phone} \n` +
        `<i>Имя:</i> ${userData.name} \n` +
        'Ожидайте ответа по Вашей заявке!', { parse_mode: 'HTML', reply_markup: keyboardresult });

          const query = 'INSERT INTO reservBike (user_id, Время_проката, Пол, Дата_проката, Время_брони, Телефон, Имя) VALUES (?, ?, ?, ?, ?, ?, ?)';
          const values = [chatId, userData.rentalTime, userData.gender, userData.rentalDate, userData.rentalTimelock, userData.phone, userData.name];
          const connection = mysql.createConnection({
            host: '81.200.151.250',
            user: 'gen_user',
            password: 'SamaraPower123',
            database: 'default_db',
            port: "3306"
        });
          
          connection.query(query, values, (err, result) => {
            if (err) {
              console.error('Все хуйня, Миша, ошибка данных: ' + err.stack);
              return;
            }

            console.log('Все заебись, данные в таблице');
            dataSaved = true;
            shouldBotReact = true;
          });
        }

        if (dataSaved) {
          delete userDatabike[chatId];
          return;
        }
      }
    });
  });
}
});


// Обработчик входящих сообщений
bot.on('message', async (msg) => {
  if (msg.chat.id === -1001656677431) {
    return;
  }

  const chatId = msg.chat.id;
  const messageText = msg.text;

  // Отправка клавиатуры с кнопками после каждого сообщения
  const keyboard = {
    reply_markup: {
      keyboard: [
        ['\u{1F527} Ремонт', '🚲 Прокат'],
        ['\u{1F4B2} Магазин', '\u{1F525} Отзывы'],
        ['\u{1F4A1} Задать вопрос']
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  };

  if (!userChatIdFM.includes(chatId)) {
    userChatIdFM.push(chatId);
    const startmsg = [
      "Добро пожаловать в бот велопроката Samara Power \u270C",
      "Я здесь, чтобы помочь с бронированием велосипедов \u{1F6B2} предоставлением информации о ценах на ремонт и запчасти \u{1F6E0}\u{1F529} , а также отвечать на вопросы \u203C \n\nВоспользуйтесь меню или кнопкой задачи вопроса для связи с менеджером\u{1F91D}",
      "Спасибо за выбор Samara Power \u{1F525} \n\nЗадавайте вопросы, мы готовы помочь! \u{2764}"
      ];

    // Функция для отправки сообщения с задержкой
    function sendMessageWithDelay(message, delay) {
    return new Promise((resolve) => {
    setTimeout(() => {
      bot.sendMessage(chatId, message, keyboard);
      resolve();
      }, delay);
      });
    }

    // Функция для последовательной отправки сообщений из массива
    async function sendMessagesSequentially() {
      for (let i = 0; i < startmsg.length; i++) {
        const message = startmsg[i];
        const delay = 1000; // Задержка в миллисекундах

        await sendMessageWithDelay(message, delay);
      }
    }

    // Вызов функции для отправки сообщений
    sendMessagesSequentially()


  } else {
    switch (messageText) {
      case '\u{1F527} Ремонт':
        const catalogLink = 'https://samara-power.clients.site/#services';
        const websiteLinkk = 'https://samara-power.clients.site/#contacts';
        const repairmsg = '🚲 Добро пожаловать в веломастерскую <b>"Samara Power"</b>! \n\nУслуги, которые мы предоставляем: \n✅ Техническое обслуживание и регулировка велосипеда \n✅ Замена и ремонт трансмиссии, тормозов и подвески \n✅ Восстановление колес и шин \n✅ Установка и настройка дополнительного оборудования \n✅ Подбор запчастей и аксессуаров \n\nВыбирайте из широкого ассортимента наших услуг. Обращайтесь по вопросам ремонта любой сложности. \n\n💡 Загляните на наш сайт для полного каталога и актуальных предложений. \n\n❓ Если у вас есть вопросы или вам нужна помощь, обращайтесь к нам. Мы всегда рады помочь Вам!'
        const buttonrepair = [
        [{ text: '🔗 Каталог услуг', url: catalogLink}],
        [{ text: '📲 Обратная связь', url: websiteLinkk}],
        [{ text: '\u{1F519} Вернуться к меню', callback_data: 'backmenu'}],
        ];

        const keyboardrepair = {
          inline_keyboard: buttonrepair,
        };

        bot.sendMessage(chatId, repairmsg, {parse_mode: 'HTML', reply_markup: keyboardrepair});
        break;
      case '🚲 Прокат':
        const sharinmsg = '🚴‍ <b>Прокат велосипедов</b> - <i>забудьте о пробках и наслаждайтесь активным отдыхом на двух колесах!</i> \n⛵ <b>Прокат сапов</b> - <i>окунитесь в мир приключений на воде и ощутите свободу плавания!</i> \n\nВыберите, чем хотите заняться сегодня! 🚴⛵';
        const buttonshar = [
          [{ text: '🏄‍ Прокат сапов', callback_data: 'supbut'}],
          [{ text: '🚲 Прокат велосипедов', callback_data: 'bikebut'}],
          [{ text: '\u{1F519} Вернуться к меню',  callback_data: 'backmenu'}],
          ];

        const keyboardshar = {
          inline_keyboard: buttonshar,
        };

        bot.sendMessage(chatId, sharinmsg, {parse_mode: 'HTML', reply_markup: keyboardshar});
        break;
      case '\u{1F4B2} Магазин':
        const websiteLinkkk = 'https://samara-power.clients.site/#contacts';
        const catalogLinkk = 'https://samara-power.clients.site/';
        const shopmsg = '🔧 Добро пожаловать в магазин <b>"Samara Power"</b>! \n\nУ нас вы найдете: \n🚲 Качественные велосипеды \n🛠️ Запчасти для велосипедов \n🏄‍ Сапы для плавания \n\u{1F453} Различные аксессуары \n\nВыбирайте из широкого ассортимента запчастей и аксессуаров для вашего велосипеда. Или приобретайте стильные сапы для активного отдыха на воде. \n\n💡 Загляните на наш сайт для полного каталога и актуальных предложений. \n\n❓ Если у вас есть вопросы или вам нужна помощь, обращайтесь к нам. Мы всегда рады помочь Вам!'
        const buttonshop = [
        [{ text: '🔗 Каталог магазина', url: catalogLinkk}],
        [{ text: '📲 Обратная связь', url: websiteLinkkk}],
        [{ text: '\u{1F519} Вернуться к меню', callback_data: 'backmenu'}],
        ];

        const keyboardshop = {
          inline_keyboard: buttonshop,
        };

        bot.sendMessage(chatId, shopmsg, {parse_mode: 'HTML', reply_markup: keyboardshop});
        break;
      case '\u{1F4A1} Задать вопрос':
        const websiteLink = 'https://samara-power.clients.site/';
        const vkLink = 'https://vk.com/realsamarapower';
        const telegramLink = 'https://t.me/samarapower1';
        const backmenu = 'Вернуться к меню';

        const messagehelp = '<b><i>КОНТАКТНАЯ ИНФОРМАЦИЯ</i></b> \n\n📞+79633693929 \n\n📥Вы можете связаться с нами в любом удобном Вам виде!';
        const buttonshelp = [
          [{ text: '🖥️ Наш сайт', url: websiteLink }],
          [{ text: '📱 Группа ВКонтакте', url: vkLink }],
          [{ text: '✈️ Telegram', url: telegramLink }],
          [{ text: '\u{1F519} Вернуться к меню', callback_data: 'backmenu'}],
        ];

        const keyboardhelp = {
            inline_keyboard: buttonshelp,
        };

        bot.sendMessage(chatId, messagehelp, {parse_mode: 'HTML', reply_markup: keyboardhelp});
        break;
      case '\u{1F525} Отзывы':
        const reviewLink = 'https://samara-power.clients.site/#rating';
        const buttonrev = [
          [{ text: '\u{1F525} Отзывы', url: reviewLink}],
          [{ text: '\u{1F519} Вернуться к меню', callback_data: 'backmenu'}],
          ];
        const keyboardrev = {
          inline_keyboard: buttonrev,
        };
         bot.sendMessage(chatId, 'Здесь Вы можете почитать отзывы о нас, а также оставить свой и получить за эту скидку \u{1F4AA}', {reply_markup: keyboardrev});
        break;
      case '\u{1F519} Вернуться к меню':
        bot.sendMessage(chatId, 'Samara Power приветствует Вас снова \u{1F525} \nЧто Вас интересует сейчас?', keyboard);
        break;
      default:
        if (shouldBotReact) {
        bot.sendMessage(chatId, 'Я не совсем понял Вас \u{1F622} \n\nВозможно Вы хотели задать вопрос? \nПожалуйста свяжитесь с администратором, либо вернитесь в меню!', keyboardall);
        }
        break;
    }
  }
});

// Запуск бота
bot.on('polling_error', (error) => {
  console.log(error);
});

console.log('Бот запущен');
