function getDate (addDays) {
    const date = new Date();
    date.setDate(date.getDate() + addDays);

    let year = date.getUTCFullYear();
    let month = date.getUTCMonth() + 1;
    let day = date.getUTCDate();

    month = String(month).padStart(2, '0')
    day = String(day).padStart(2, '0')

    const str = `${year}-${month}-${day}`;

    return str
}

export default {
    getDate
}