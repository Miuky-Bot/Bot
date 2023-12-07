import moment from 'moment';

export default {
  name: 'formatDate',
  execute(dateTimestamp, { language, format = false }) {
    const inTime = dateTimestamp;
    const now = moment();
    const end = moment(dateTimestamp);

    const years = now.diff(end, 'years');
    end.add(years, 'years');
    const months = now.diff(end, 'months');
    end.add(months, 'months');
    const days = now.diff(end, 'days');
    end.add(days, 'days');
    const hours = now.diff(end, 'hours');
    end.add(hours, 'hours');
    const minutes = now.diff(end, 'minutes');
    end.add(minutes, 'minutes');
    const seconds = now.diff(end, 'seconds');
    end.add(seconds, 'seconds');

    const Time = [];
    if (years) {
      Time.push(
        years > 1
          ? `${years} ${language.date.years}`
          : `${years} ${language.date.year}`
      );
    }
    if (months) {
      Time.push(
        months > 1
          ? `${months} ${language.date.months}`
          : `${months} ${language.date.month}`
      );
    }
    if (days) {
      Time.push(
        days > 1
          ? `${days} ${language.date.days}`
          : `${days} ${language.date.day}`
      );
    }
    if (hours) {
      Time.push(
        hours > 1
          ? `${hours} ${language.date.hours}`
          : `${hours} ${language.date.hour}`
      );
    }
    if (minutes) {
      Time.push(
        minutes > 1
          ? `${minutes} ${language.date.minutes}`
          : `${minutes} ${language.date.minute}`
      );
    }
    if (seconds) {
      Time.push(
        seconds > 1
          ? `${seconds} ${language.date.seconds}`
          : `${seconds} ${language.date.second}`
      );
    }

    const endSlice = Time.slice(0, 3);
    const endTime = endSlice
      .map((m, i) => {
        if (i === endSlice.length - 2) return `${m} ${language.date.separator}`;
        else if (i !== endSlice.length - 1) return `${m},`;
        else return m;
      })
      .slice(0, 3);

    return format
      ? `${endTime.join(' ')}\n<t:${Math.round(inTime / 1000)}:d>`
      : endTime.join(' ');
  },
};
