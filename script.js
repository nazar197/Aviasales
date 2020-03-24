/* Данные */ 

// Элементы формы
const formSearch = document.querySelector('.form-search'),
  inputCitiesFrom = formSearch.querySelector('.input__cities-from'),
  dropdownCitiesFrom = formSearch.querySelector('.dropdown__cities-from'),
  inputCitiesTo = formSearch.querySelector('.input__cities-to'),
  dropdownCitiesTo = formSearch.querySelector('.dropdown__cities-to'),
  inputDateDepart = formSearch.querySelector('.input__date-depart'),
  buttonSearch = formSearch.querySelector('.button__search'),
  cheapestTicket = document.getElementById('cheapest-ticket'),
  otherCheapTickets = document.getElementById('other-cheap-tickets');

const 
  // Получаем данные с сервера 
  CITIES_API = 'http://api.travelpayouts.com/data/ru/cities.json',
  // Получаем данные с файла
  // CITIES_API = 'data/cities.json',
  PROXY = 'https://cors-anywhere.herokuapp.com/',
  API_KEY = '81f67e92f1c6bf62ab4047b1fbcfef4a',
  // Получение минимальных цен на перелет для указанных даты вылета и городов вылета и назначения
  CALENDAR = 'http://min-prices.aviasales.ru/calendar_preload',
	MAX_COUNT = 7;  // количество карточек самых дешевых билетов

let citiesArray = [];

/* /Данные */ 

/* Функции */ 

/**
 * Запрос на получение данных
 * Принимает адрес запроса и колбэк-функцию.
 * Запрашивает данные по адресу url и, в случае успеха,
 * передает полученные данные в колбэк
*/
const getData = (url, callback, reject = console.error) => {
  // Создаем объект на основе API XMLHttpRequest, встроенный в браузер
  const request = new XMLHttpRequest();
  
  // Указываем тип запроса и url-адрес(куда будем отправлять)
  request.open('GET', url);

  // Обработчик события, чтобы не пропустить ответ
  request.addEventListener('readystatechange', () => {
    if(request.readyState !== 4) return;
    
    request.status === 200 ? callback(request.response) : reject(request.status);
  });

  // Выполнить запрос
  request.send();
};

/**
 * Отображение городов, живой поиск
 * Принимает инпут и список. Получает данные с инпута, 
 * фильтрует массив городов по введенных буквах и 
 * наполняет выпадающий список значениями из отфильтрованного массива
 */
const showCitiesList = (input, list) => {
  list.textContent = '';

  if (input.value !== '') {
    cheapestTicket.style.display = 'none';
		otherCheapTickets.style.display = 'none';

    const filterCity = citiesArray.filter((item) => {
      const fixItem = item.name.toLowerCase();
      return fixItem.startsWith(input.value.toLowerCase());
    });

    // Выпадающий список с подходящими значениями 
    filterCity.forEach((item) => {
      const li = document.createElement('li');
      li.classList.add('dropdown__city');
      li.textContent = item.name;
      list.append(li);
    });

  }
};

/**
 * Выбор города из выпадающего списка с автозаполнением поля ввода
 * Принимает объект события, инпут и список.
 * Проверет, происходит ли клик по элементу списка, 
 * добавляет название выбранного города в инпут,
 * обнуляет список
 */
const selectCity = (event, input, list) => {
  const target = event.target;
  if (target.tagName.toLowerCase() === 'li') {
    input.value = target.textContent;
    list.textContent = '';
  }
};

/**
 * Проверить не совпадают ли инпуты направлений
 * Принимает инпуты городов отправления и прибытия.
 * Проверет не пусты ли они,
 * иначе отключаем кнопку и меняем ее цвет
 */
const compareCities = (departureCity, arrivalCity) => {
  if (departureCity.value !== '' || arrivalCity.value !== '') {

    if (departureCity.value === arrivalCity.value) {
      buttonSearch.disabled = true;
      buttonSearch.style.backgroundColor = '#666666';
      buttonSearch.style.boxShadow = '0 1px 0 0 #434343, 0 2px 6px 0 rgba(0, 0, 0, .15)';
      alert('Упс... Введены одинаковые города!\nПожалуйста, смените одно с направлений!');
    } else {
      buttonSearch.disabled = false;
      buttonSearch.style.backgroundColor = '#f57c00';
      buttonSearch.style.boxShadow = '0 1px 0 0 #d84d00, 0 2px 6px 0 rgba(0, 0, 0, .15)';
    }

  }
};

/**
 * Отображает название городов
 * Принимает код города, а 
 * возвращает его название
 */
const getNameCity = (code) => {
	const objCity = citiesArray.find(item => item.code === code);
	return objCity.name;
};

/**
 * Отображение количества пересадок
 */
const getChanges = (num) => {
  if (num) {
    return num === 1 ? `С ${num} пересадкой` : `С ${num} пересадками`;
  }
  else {
    return 'Без пересадок';
  }
};

/**
 * Отображение даты полета
 */
const getDate = (date) => {
	return new Date(date).toLocaleDateString('ru-Ru', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		timeZoneName: 'short'
	});
};

/**
 * Формирует ссылку для покупки билета на сайте Aviasales
 */
const getLinkAviasales = (data) => {
	let link = 'https://www.aviasales.ru/search/';
	link += data.origin;

	const date = new Date(data.depart_date);
	const day = date.getDate();
	link += day < 10 ? '0' + day : day;
	const month = date.getMonth() + 1;
	link += month < 10 ? '0' + month : month;

  link += data.destination;
  // к-во пассажиров
	link += '211';   // 2 взрослых(страше 12 лет) + 1 ребенок(от 2 до 12) + 1 ребенок(до 2 лет)

	return link;
};

/**
 * Отображение дешевых полетов на текущий день
 */
const createCard = (data) => {
  const ticket = document.createElement('article');
  ticket.classList.add('ticket');

  // Верстка карточки-билета
  let deep = '';

  if (data) {
    deep = `
    <h3 class="agent">${data.gate}</h3>
    <div class="ticket__wrapper">
      <div class="left-side">
      <a href="${getLinkAviasales(data)}" target="_blank" class="button button__buy">Купить
          за ${data.value}₽</a>
      </div>
      <div class="right-side">
        <div class="block-left">
          <div class="city__from">Вылет из города
            <span class="city__name">${getNameCity(data.origin)}</span>
          </div>
          <div class="date">${getDate(data.depart_date)}</div>
        </div>

        <div class="block-right">
          <div class="changes">${getChanges(data.number_of_changes)}</div>
          <div class="city__to">Город назначения:
            <span class="city__name">${getNameCity(data.destination)}</span>
          </div>
        </div>
      </div>
    </div>
    `;
  } else {
    deep = '<h3>К сожалению на текущую дату билетов не нашлось!</h3>';
  }

  ticket.insertAdjacentHTML('afterbegin', deep);

  return ticket;
};

/**
 * Отображение дешевых полетов на текущий день
 */
const renderCheapDay = cheapFlight => {
  cheapestTicket.style.display = 'block';
  cheapestTicket.innerHTML = '<h2>Самый дешевый билет на выбранную дату</h2>';

  const ticket = createCard(cheapFlight[0]);
  cheapestTicket.append(ticket); 
};

/**
 * Отображение дешевых полетов на текущий год
 * Сортирует полеты по цене(от меньшей к большей)
 */
const renderCheapYear = cheapFlights => {
  otherCheapTickets.style.display = 'block';
  otherCheapTickets.innerHTML = '<h2>Самые дешевые билеты на другие даты</h2>';

  cheapFlights.sort((a, b) => a.value - b.value);
  for (let i = 0; i < cheapFlights.length && i < MAX_COUNT; i++) {
		const ticket = createCard(cheapFlights[i]);
		otherCheapTickets.append(ticket);
	}
};

/**
 * Парсинг дешевых полетов
 */
const renderCheap = (data, date) => {

  const cheapFlightsYear = JSON.parse(data).best_prices;
  
  const cheapFlightDay = cheapFlightsYear.filter(item => item.depart_date === date);
  
  renderCheapDay(cheapFlightDay);
  renderCheapYear(cheapFlightsYear);
};

/* /Функции */ 

/* Обработчики событий */ 

// Ввести: Откуда
inputCitiesFrom.addEventListener('input', () => {
  showCitiesList(inputCitiesFrom, dropdownCitiesFrom);
  compareCities(inputCitiesFrom, inputCitiesTo);
});

// Ввести: Куда
inputCitiesTo.addEventListener('input', () => {
  showCitiesList(inputCitiesTo, dropdownCitiesTo);
  compareCities(inputCitiesFrom, inputCitiesTo);
});

// Выпадающий список для поля - Откуда
dropdownCitiesFrom.addEventListener('click', (event) => {
  selectCity(event, inputCitiesFrom, dropdownCitiesFrom);
  compareCities(inputCitiesFrom, inputCitiesTo);
});

// Выпадающий список для поля - Куда
dropdownCitiesTo.addEventListener('click', (event) => {
  selectCity(event, inputCitiesTo, dropdownCitiesTo);
  compareCities(inputCitiesFrom, inputCitiesTo);
});

/**
 * Обработчик формы принимает объект события. 
 * Формирует обьект с данными полета, и заносит их в запрос.
 * Полученные данные отправляет на парсинг.
 * Проверяет корректно введены названия городов, или нет;
 * уведомляет пользователя, что на введенное направление нет рейсов
 */
formSearch.addEventListener('submit', (event) => {
  // Чтобы браузер не перезагружал страницу и данные не терялись 
  event.preventDefault();

  const formData = {
    from: citiesArray.find(item => inputCitiesFrom.value === item.name),
    to: citiesArray.find(item => inputCitiesTo.value === item.name),
    when: inputDateDepart.value
  }

  // Проверить названия городов на корректность
  if(formData.from && formData.to){
    const requestData = 
      `?depart_date=${formData.when}&origin=${formData.from.code}` + 
      `&destination=${formData.to.code}&one_way=true`;

    getData(CALENDAR+requestData, 
      (response) => {
        renderCheap(response, formData.when);
      }, (error) => {
        alert('В этом направлении нет рейсов!');
        console.log('Ошибка: ', error);
      }
    );
  } else {
    alert('Ошибка в названии города!');
  }

});

/* /Обработчики событий */ 

/* Вызовы функций */ 

// Прокси для получение данных с сервера 
getData(PROXY + CITIES_API, data => {
  citiesArray = JSON.parse(data).filter(item => item.name);

  // Отсортировать названия направлений по алфавиту
  citiesArray.sort((a, b) => {
    if (a.name > b.name) {
      return 1;
    }
    if (a.name < b.name) {
      return -1;
    }
    return 0;
  });

});

// Получение данных с файла 
// getData(CITIES_API, data => 
//   citiesArray = JSON.parse(data).filter(item => item.name));

/* /Вызовы функций */ 