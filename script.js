const formSearch = document.querySelector('.form-search'),
  inputCitiesFrom = formSearch.querySelector('.input__cities-from'),
  dropdownCitiesFrom = formSearch.querySelector('.dropdown__cities-from'),
  inputCitiesTo = formSearch.querySelector('.input__cities-to'),
  dropdownCitiesTo = formSearch.querySelector('.dropdown__cities-to'),
  inputDateDepart = formSearch.querySelector('.input__date-depart'),
  buttonSearch = formSearch.querySelector('.button__search');

const citiesArray = [
  'Киев', 'Львов', 'Днепр', 'Вроцлав', 'Варшава',
  'Москва', 'Санкт-Петербург', 'Минск', 'Одесса', 'Харьков'
];

// Отображение городов
const showCity = (input, list) => {
  list.textContent = '';

  if (input.value !== '') {
    const filterCity = citiesArray.filter((item) => {
      const fixItem = item.toLowerCase();
      // Отсеять лишние города по первой букве
      if (input.value[0].toLowerCase() == fixItem[0]){
        return fixItem.includes(input.value.toLowerCase());
      }
    });

    // Выпадающий список с подходящими значениями 
    filterCity.forEach((item) => {
      const li = document.createElement('li');
      li.classList.add('dropdown__city');
      li.textContent = item;
      list.append(li);
    });

  }
};

// Проверить не совпадают ли направления
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

// Выбор города из выпадающего списка с автозаполнением поля ввода
const selectCity = (event, input, list) => {
  const target = event.target;
  if (target.tagName.toLowerCase() === 'li') {
    input.value = target.textContent;
    list.textContent = '';
  }
}

// Ввести: Откуда
inputCitiesFrom.addEventListener('input', () => {
  showCity(inputCitiesFrom, dropdownCitiesFrom);
  compareCities(inputCitiesFrom, inputCitiesTo);
});

// Ввести: Куда
inputCitiesTo.addEventListener('input', () => {
  showCity(inputCitiesTo, dropdownCitiesTo);
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