/*
static getEaster is from: https://gist.github.com/johndyer/0dffbdd98c2046f41180c051f378f343
*/

class DateService {
  static makeDateArray(date) {
    return [date.getFullYear(), date.getMonth(), date.getDate()];
  }
  //konwertuje datę z formatu date na tablicę
  static isDatesMatch(firstDate, secondDate) {
    if (
      firstDate[0] === secondDate[0] &&
      firstDate[1] === secondDate[1] &&
      firstDate[2] === secondDate[2]
    ) {
      return true;
    } else {
      return false;
    }
  }
  //sprawdza, czy pierwsza data jest taka sama jak druga
  static getYears(startDate, endDate) {
    let startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    let years = [startYear];
    while (startYear !== endYear) {
      startYear++;
      years.push(startYear);
    }
    return years;
  }
  //zwraca tablicę z latami, które obejmuje podany przedział dat w formacie date
  static addDaysToDate(date, days) {
    return new Date(date.valueOf() + days * 86400000);
  }
  //dodaje określoną liczbę dni do daty w formacie date
  static getDates(startDate, endDate) {
    let days = [];
    let currentDate = startDate;
    while (
      !this.isDatesMatch(
        this.makeDateArray(currentDate),
        this.makeDateArray(endDate)
      )
    ) {
      days.push(this.makeDateArray(currentDate));
      currentDate = this.addDaysToDate(currentDate, 1);
    }
    if (days[days.length - 1] !== currentDate) {
      days.push(this.makeDateArray(currentDate));
    }
    return days;
  }
  //zwraca wszystkie dni z podanego przedziału w formacie date w formie tablic
  static checkIfContainsDates(element, datesToCheck, fixed) {
    let isContains = false;
    datesToCheck.forEach(e => {
      if (this.isDatesMatch(fixed ? e.date : e, element)) {
        isContains = true;
      }
    });
    return isContains;
  }
}

class BigHolidays {
  static constantDays(year) {
    return [
      [year, 0, 1],
      [year, 0, 6],
      [year, 4, 1],
      [year, 4, 3],
      [year, 7, 15],
      [year, 10, 1],
      [year, 10, 11],
      [year, 11, 25],
      [year, 11, 26]
    ];
  }
  //zwraca dni wolne od pracy bez świąt ruchomych w formie tablic
  static getEaster(year) {
    const f = Math.floor,
      G = year % 19,
      C = f(year / 100),
      H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
      I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
      J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
      L = I - J,
      month = 3 + f((L + 40) / 44),
      day = L + 28 - 31 * f(month / 4);
    return [year, month, day];
  }
  //zwraca datę wielkanocy dla danego roku w formie tablicy
  static getSecondEaster(year) {
    const easter = new Date(this.getEaster(year)),
      secondEaster = DateService.addDaysToDate(easter, 1);
    return [year, secondEaster.getMonth(), secondEaster.getDate()];
  }
  //zwraca drugi dzień świąt wielkanocnych w formie tablicy
  static getCorpusChristi(year) {
    let corpusChristi = DateService.addDaysToDate(
      new Date(this.getEaster(year)),
      50
    );
    while (corpusChristi.getDay() !== 0) {
      corpusChristi = DateService.addDaysToDate(corpusChristi, 1);
    }
    while (corpusChristi.getDay() !== 4) {
      corpusChristi = DateService.addDaysToDate(corpusChristi, 1);
    }
    return [year, corpusChristi.getMonth(), corpusChristi.getDate()];
  }
  //zwraca datę bożego ciała w formie tablicy
  static getBigHolidays(year) {
    return [
      ...this.constantDays(year),
      this.getSecondEaster(year),
      this.getCorpusChristi(year)
    ];
  }
}

class PublicHolidays {
  static isSpecificDay(date, numOfDay) {
    const day = date.getDay();
    return day === numOfDay && true;
  }
  static getSpecificDayOfTheWeek(year, numOfDay) {
    let day = new Date(year, 0, 1);
    let specificDays = [];
    while (year === day.getFullYear()) {
      if (this.isSpecificDay(day, numOfDay)) {
        specificDays.push([day.getFullYear(), day.getMonth(), day.getDate()]);
      }
      day = DateService.addDaysToDate(day, 1);
    }
    return specificDays;
  }
  static checkIfHolidayIsSaturday(year) {
    const saturdays = this.getSpecificDayOfTheWeek(year, 6);
    const holidays = BigHolidays.getBigHolidays(year);
    let fixedHolidays = [];
    holidays.forEach(holiday => {
      fixedHolidays.push({
        date: holiday,
        satHoliday: DateService.checkIfContainsDates(holiday, saturdays) && true
      });
    });
    return fixedHolidays;
    //święta duże, z zaznaczeniem czy są w sobotę czy nie;
  }
  static getPublicHolidaysFromSpecificYear(year) {
    const holidays = this.checkIfHolidayIsSaturday(year),
      saturdays = this.getSpecificDayOfTheWeek(year, 6),
      sundays = this.getSpecificDayOfTheWeek(year, 0);
    let allHolidays = [...holidays];
    saturdays.forEach(saturday => {
      if (!DateService.checkIfContainsDates(saturday, holidays, true)) {
        allHolidays.push({ date: saturday, satHoliday: false });
      }
    });
    sundays.forEach(sunday => {
      if (!DateService.checkIfContainsDates(sunday, holidays, true)) {
        allHolidays.push({ date: sunday, satHoliday: false });
      }
    });
    return allHolidays;
  }
  //zwraca tablicę dni ustawowo wolnych od pracy dla danego roku w formie tablic
  static getHolidays(startDate, endDate) {
    const years = DateService.getYears(startDate, endDate);
    let holidays = [];
    years.forEach(e =>
      holidays.push(...this.getPublicHolidaysFromSpecificYear(e))
    );
    return holidays;
  }
  //zwraca wszystkie dni ustatawowo wolne od pracy z podanego przedziału czasowego
}

class WorkingHours {
  static getWorkingDays(dates, holidays) {
    let workingDays = [];
    dates.forEach(date => {
      if (!DateService.checkIfContainsDates(date, holidays, true)) {
        workingDays.push(date);
      }
    });
    return workingDays;
  }
  static getExtraDays(dates, holidays) {
    let extraDays = 0;
    holidays.forEach(holiday => {
      if (
        DateService.checkIfContainsDates(holiday.date, dates) &&
        holiday.satHoliday
      ) {
        extraDays++;
      }
    });
    return extraDays;
  }
  static getWorkingHours(startDate, endDate) {
    const dates = DateService.getDates(startDate, endDate);
    const holidays = PublicHolidays.getHolidays(startDate, endDate);
    const workingDays = this.getWorkingDays(dates, holidays);
    const extraDays = this.getExtraDays(dates, holidays);
    return (workingDays.length - extraDays) * 8;
  }
}

function printOutput(text) {
  document.getElementById("output").innerHTML = text;
}

function makeResetVisible(action) {
  document.getElementById("reset").style.display = action ? "inline" : "none";
}

function getOutputAnimationArray(number) {
  let numbers = [number];
  for (let i = 0; i < number; i++) {
    numbers.push(numbers[numbers.length - 1] - 1);
  }
  return numbers.reverse();
}

function printOutputAnimation(number) {
  const animationArray = getOutputAnimationArray(number);
  const animationTime = 300;
  const interval = Math.round(animationTime / animationArray.length);
  let i = number > animationTime ? number - animationTime : 0;
  const animation = window.setInterval(() => {
    printOutput(animationArray[i]);
    if (animationArray[i] === number) {
      window.clearInterval(animation);
      makeResetVisible(true);
    } else {
      i++;
    }
  }, interval);
}

function handleCountButton() {
  const startValue = document.getElementById("first-date").value,
    endValue = document.getElementById("second-date").value;
  if (startValue && endValue) {
    const startDate = new Date(startValue),
      endDate = new Date(endValue);
    if (endDate.valueOf() >= startDate.valueOf()) {
      printOutputAnimation(WorkingHours.getWorkingHours(startDate, endDate));
    } else {
      printOutput("");
    }
  }
}

function handleResetButton() {
  document.getElementById("first-date").value = "";
  document.getElementById("second-date").value = "";
  document.getElementById("output").innerHTML = "";
  makeResetVisible(false);
}
