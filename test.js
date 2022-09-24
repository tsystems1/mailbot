function stringToDate(str) {
    let dateString = str.match(/(\d+) ?(second|minute|hour|day|week|month|year|sec|min|hr|dy|wk|mo|yr|s|mo|m|h|d|w|y)s?/i);

    if (dateString) {
        const [input, value, unit] = dateString;
        let s = value;

        switch (unit) {
            case 'm':
            case 'min':
            case 'minute':
                s *= 60;
            break;

            case 'h':
            case 'hr':
            case 'hour':
                s *= 60 * 60;
            break;
            
            case 'd':
            case 'dy':
            case 'day':
                s *= 60 * 60 * 24;
            break;
            
            case 'w':
            case 'wk':
            case 'week':
                s *= 60 * 60 * 24 * 7;
            break;
            
            case 'mo':
            case 'mon':
            case 'month':
                s *= 60 * 60 * 24 * 30;
            break;
            
            case 'y':
            case 'yr':
            case 'year':
                s *= 60 * 60 * 24 * 30 * 365;
            break;

            case 's':
            case 'sec':
            case 'second':
                return s;
        }

        if (s === value) {
            return;
        }

        return s;
    }
}

console.log(stringToDate("in 1 hour silently"));