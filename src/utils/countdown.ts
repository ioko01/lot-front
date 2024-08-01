import moment from "moment"

export const countdown = (open: string, close: string, tomorrow = false) => {

    let thisDate = moment(new Date(Date.now()).toUTCString())

    let day = thisDate.format("DD")
    let month = thisDate.format("MM")
    let year = thisDate.format("YYYY")

    if (tomorrow) {
        day = thisDate.add(1, 'days').get('date').toString()
        month = thisDate.format("MM")
        year = thisDate.format("YYYY")
    }

    // `
    // open 06:00
    // now 00:12
    // close 00:10
    // `

    let thisDateNotomorrow = moment(new Date(Date.now()).toUTCString())

    let day2 = thisDateNotomorrow.format("DD")
    let month2 = thisDateNotomorrow.format("MM")
    let year2 = thisDateNotomorrow.format("YYYY")

    const closeLotto = new Date(`${year}-${month}-${day} ${close}:00`)
    const closeLotto2 = new Date(`${year2}-${month2}-${day2} ${close}:00`)
    const openLotto = new Date(`${year2}-${month2}-${day2} ${open}:00`)
    const now = new Date().getTime();
    let distance: number = 0;
    if (now < openLotto!.getTime()) {
        if (now < closeLotto2!.getTime() && tomorrow) {
            distance = closeLotto2!.getTime() - now;
        } else {
            distance = now - openLotto!.getTime()
        }
    } else if (now >= openLotto!.getTime()) {
        distance = closeLotto!.getTime() - now;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor(
        (distance % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds }
}

export const countdownDate = (openDate: string, closeDate: string) => {

    let open = moment(new Date(openDate).toUTCString())
    let close = moment(new Date(closeDate).toUTCString())
    let thisDate = moment(new Date(Date.now()).toUTCString())
    let duration: moment.Duration = moment.duration(close.diff(open))
    if (thisDate > open) {
        duration = moment.duration(close.diff(thisDate))
    }
    let days = duration.days()
    let hours = duration.hours()
    let minutes = duration.minutes()
    let seconds = duration.seconds()

    return { days, hours, minutes, seconds }
}