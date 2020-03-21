/* Данные */ 

// Элементы формы
const formSearch = document.querySelector('.form-search'),
  inputCitiesFrom = formSearch.querySelector('.input__cities-from'),
  dropdownCitiesFrom = formSearch.querySelector('.dropdown__cities-from'),
  inputCitiesTo = formSearch.querySelector('.input__cities-to'),
  dropdownCitiesTo = formSearch.querySelector('.dropdown__cities-to'),
  inputDateDepart = formSearch.querySelector('.input__date-depart'),
  buttonSearch = formSearch.querySelector('.button__search');

const 
// Получаем данные с сервера 
  CITIES_API = 'http://api.travelpayouts.com/data/ru/cities.json',
// Получаем данные с файла
  // CITIES_API = 'data/cities.json',
  PROXY = 'https://cors-anywhere.herokuapp.com/',
  API_KEY = '81f67e92f1c6bf62ab4047b1fbcfef4a',
  CALENDAR = 'http://min-prices.aviasales.ru/calendar_preload';

let citiesArray = [];

/* /Данные */ 

/* Функции */ 

/**
 * Запрос на получение данных
 * Принимает адрес запроса и колбэк-функцию.
 * Запрашивает данные по адресу url и, в случае успеха,
 * передает полученные данные в колбэк
*/
const getData = (url, callback) => {
  // Создаем объект на основе API XMLHttpRequest, встроенный в браузер
  const request = new XMLHttpRequest();
  
  // Указываем тип запроса и url-адрес(куда будем отправлять)
  request.open('GET', url);

  // Обработчик события, чтобы не пропустить ответ
  request.addEventListener('readystatechange', () => {
    if(request.readyState !== 4) return;
    
    if(request.status === 200) {
      callback(request.response);
    } else {
      console.error(request.status);
    }
  });

  // Выполнить запрос
  request.send();
}

/**
 * Отображение городов, живой поиск
 * Принимает инпут и список. Получает данные с инпута, 
 * фильтрует массив городов 
 * и наполняет список данными из отфильтрованного массива
 */
const showCitiesList = (input, list) => {
  list.textContent = '';

  if (input.value !== '') {
    const filterCity = citiesArray.filter((item) => {
      const fixItem = item.name.toLowerCase();

      // Отсеять лишние города по первой букве
      if (input.value[0].toLowerCase() == fixItem[0]){
        return fixItem.includes(input.value.toLowerCase());
      }
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
}

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
 * Отображение дешевых полетов на текущий день
 */
const renderCheapDay = (cheapFlight) => {
  console.log(cheapFlight);
};

/**
 * Отображение дешевых полетов на текущий год
 */
const renderCheapYear = (cheapFlights) => {
  console.log(cheapFlights);
};

/**
 * Парсинг дешевых полетов
 */
const renderCheap = (data, date) => {

  const cheapFlightsYear = JSON.parse(data).best_prices;
  
  const cheapFlightDay = cheapFlightsYear.filter(item => item.depart_date === date);
  
  renderCheapDay(cheapFlightDay);
  renderCheapYear(cheapFlightsYear);
}


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
 * Формирует обьект с данными полета и заносит их в запрос.
 * Полученные данные отправляет на парсинг.
 * Чтобы браузер не перезагружал страницу при отправке формы 
 * и данные не терялись, - к объекту события добавлен специальный метод.
 */
formSearch.addEventListener('submit', (event) => {
  // Чтобы браузер не перезагружал страницу и данные не терялись 
  event.preventDefault();

  const formData = {
    from: citiesArray.find((item) => inputCitiesFrom.value === item.name).code,
    to: citiesArray.find((item) => inputCitiesTo.value === item.name).code,
    when: inputDateDepart.value
  }

  const requestData = 
    `?depart_date=${formData.when}&origin=${formData.from}` + 
    `&destination=${formData.to}&one_way=true`;

  getData(CALENDAR+requestData, response => renderCheap(response, formData.when));

});

/* /Обработчики событий */ 

/* Вызовы функций */ 

// Прокси для получение данных с сервера 
getData(PROXY + CITIES_API, 
  data => citiesArray = JSON.parse(data).filter(item => item.name));

// Получение данных с файла 
// getData(CITIES_API, data => citiesArray = JSON.parse(data).filter(item => item.name));

/* /Вызовы функций */ 