const TOKENS = {
    YYYY: d => String(d.getFullYear()),
    YY: d => String(d.getFullYear()).slice(-2),
    MM: d => String(d.getMonth() + 1).padStart(2, '0'),
    M: d => String(d.getMonth() + 1),
    DD: d => String(d.getDate()).padStart(2, '0'),
    D: d => String(d.getDate()),
    HH: d => String(d.getHours()).padStart(2, '0'),
    H: d => String(d.getHours()),
    hh: d => String(d.getHours() % 12 || 12).padStart(2, '0'),
    h: d => String(d.getHours() % 12 || 12),
    mm: d => String(d.getMinutes()).padStart(2, '0'),
    m: d => String(d.getMinutes()),
    ss: d => String(d.getSeconds()).padStart(2, '0'),
    A: d => d.getHours() < 12 ? 'AM' : 'PM',
    a: d => d.getHours() < 12 ? 'am' : 'pm',
    dd: d => ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d.getDay()],
    ddd: d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()],
    dddd: d => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()],
    MMM: d => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()],
    MMMM: d => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][d.getMonth()],
};
const FORMAT = {
    full: { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", },
    dm: { month: "short", day: "numeric", },
    dmy: { year: "numeric", month: "short", day: "numeric", },
    dmyw: { weekday: "short", year: "numeric", month: "short", day: "numeric", },
    t: { hour: "2-digit", minute: "2-digit", }
};
const UNITS = {
    ms: 'millisecond', millisecond: 'millisecond', milliseconds: 'millisecond',
    s: 'second', sec: 'second', second: 'second', seconds: 'second',
    m: 'minute', min: 'minute', minute: 'minute', minutes: 'minute',
    h: 'hour', hr: 'hour', hour: 'hour', hours: 'hour',
    d: 'day', day: 'day', days: 'day',
    w: 'week', week: 'week', weeks: 'week',
    mo: 'month', month: 'month', months: 'month',
    y: 'year', yr: 'year', year: 'year', years: 'year',
};
const WEEKDAYS = {
    sunday: 0, sun: 0,
    monday: 1, mon: 1,
    tuesday: 2, tue: 2,
    wednesday: 3, wed: 3,
    thursday: 4, thu: 4,
    friday: 5, fri: 5,
    saturday: 6, sat: 6,
};
const MONTHS = {
    january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2,
    april: 3, apr: 3, may: 4, june: 5, jun: 5,
    july: 6, jul: 6, august: 7, aug: 7, september: 8, sep: 8,
    october: 9, oct: 9, november: 10, nov: 10, december: 11, dec: 11,
};
export function parse(input, tz) {
    if (input instanceof Date)
        return tz ? toTZ(input, tz) : new Date(input);
    if (typeof input === 'number')
        return new Date(input);
    const d = new Date(input);
    if (!isNaN(d.getTime()))
        return tz ? toTZ(d, tz) : d;
    throw new Error(`temporalShift.parse: cannot parse "${input}"`);
}
export function format(date, template) {
    const keys = Object.keys(TOKENS).sort((a, b) => b.length - a.length);
    let out = template;
    for (const k of keys)
        out = out.split(k).join(TOKENS[k](date));
    return out;
}
export function add(date, amount, unit) {
    const d = new Date(date);
    switch (unit) {
        case 'millisecond':
            d.setMilliseconds(d.getMilliseconds() + amount);
            break;
        case 'second':
            d.setSeconds(d.getSeconds() + amount);
            break;
        case 'minute':
            d.setMinutes(d.getMinutes() + amount);
            break;
        case 'hour':
            d.setHours(d.getHours() + amount);
            break;
        case 'day':
            d.setDate(d.getDate() + amount);
            break;
        case 'week':
            d.setDate(d.getDate() + amount * 7);
            break;
        case 'month':
            d.setMonth(d.getMonth() + amount);
            break;
        case 'year':
            d.setFullYear(d.getFullYear() + amount);
            break;
    }
    return d;
}
export function sub(date, amount, unit) {
    return add(date, -amount, unit);
}
export function diff(a, b, unit) {
    const ms = a.getTime() - b.getTime();
    switch (unit) {
        case 'millisecond': return ms;
        case 'second': return ms / 1_000;
        case 'minute': return ms / 60000;
        case 'hour': return ms / 3600000;
        case 'day': return ms / 86400000;
        case 'week': return ms / 604800000;
        case 'month': return (a.getFullYear() - b.getFullYear()) * 12 + (a.getMonth() - b.getMonth());
        case 'year': return a.getFullYear() - b.getFullYear();
    }
}
export function startOf(date, unit) {
    const d = new Date(date);
    switch (unit) {
        case 'minute':
            d.setSeconds(0, 0);
            break;
        case 'hour':
            d.setMinutes(0, 0, 0);
            break;
        case 'day':
            d.setHours(0, 0, 0, 0);
            break;
        case 'week': {
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() - d.getDay());
            break;
        }
        case 'month':
            d.setDate(1);
            d.setHours(0, 0, 0, 0);
            break;
    }
    return d;
}
export function endOf(date, unit) {
    const d = new Date(date);
    switch (unit) {
        case 'minute':
            d.setSeconds(59, 999);
            break;
        case 'hour':
            d.setMinutes(59, 59, 999);
            break;
        case 'day':
            d.setHours(23, 59, 59, 999);
            break;
        case 'week': {
            d.setHours(23, 59, 59, 999);
            d.setDate(d.getDate() + (6 - d.getDay()));
            break;
        }
        case 'month': {
            d.setMonth(d.getMonth() + 1, 0);
            d.setHours(23, 59, 59, 999);
            break;
        }
    }
    return d;
}
export function toTZ(date, tz) {
    return new Date(date.toLocaleString('en-US', { timeZone: tz }));
}
export function fromTZ(date, tz) {
    const local = new Date(date.toLocaleString('en-US', { timeZone: tz }));
    const delta = date.getTime() - local.getTime();
    return new Date(date.getTime() + delta);
}
export function tzOffset(tz, date = new Date()) {
    const utc = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const local = new Date(date.toLocaleString('en-US', { timeZone: tz }));
    return (local.getTime() - utc.getTime()) / 60000;
}
export function localTZ() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
export function overlaps(a, b) {
    return a.start < b.end && a.end > b.start;
}
export function getOverlap(a, b) {
    if (!overlaps(a, b))
        return null;
    return {
        start: a.start > b.start ? a.start : b.start,
        end: a.end < b.end ? a.end : b.end,
    };
}
export function findConflicts(events) {
    const out = [];
    for (let i = 0; i < events.length; i++) {
        for (let j = i + 1; j < events.length; j++) {
            const overlap = getOverlap(events[i], events[j]);
            if (overlap)
                out.push({ a: events[i], b: events[j], overlap });
        }
    }
    return out;
}
export function relative(date, from = new Date()) {
    const ms = date.getTime() - from.getTime();
    const abs = Math.abs(ms);
    const past = ms < 0;
    const MINUTE = 60000;
    const HOUR = 3600000;
    const DAY = 86400000;
    const WEEK = 604800000;
    const MONTH = 2592000000;
    const YEAR = 31536000000;
    let label;
    if (abs < MINUTE)
        label = 'just now';
    else if (abs < HOUR)
        label = `${Math.round(abs / MINUTE)}m`;
    else if (abs < DAY)
        label = `${Math.round(abs / HOUR)}h`;
    else if (abs < WEEK)
        label = `${Math.round(abs / DAY)}d`;
    else if (abs < MONTH)
        label = `${Math.round(abs / WEEK)}w`;
    else if (abs < YEAR)
        label = `${Math.round(abs / MONTH)}mo`;
    else
        label = `${Math.round(abs / YEAR)}y`;
    if (label === 'just now')
        return label;
    return past ? `${label} ago` : `in ${label}`;
}
export function parseNatural(input, from = new Date()) {
    const s = input.trim().toLowerCase();
    const d = new Date(from);
    const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const MONTHS_LONG = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const MONTHS_SHORT = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    if (s === 'today')
        return startOf(d, 'day');
    if (s === 'tomorrow')
        return startOf(add(d, 1, 'day'), 'day');
    if (s === 'yesterday')
        return startOf(sub(d, 1, 'day'), 'day');
    if (s === 'now')
        return d;
    // "next week" / "last week" / "next month" / "last month" / "next quarter"
    if (s === 'next week')
        return startOf(add(d, 1, 'week'), 'week');
    if (s === 'last week')
        return startOf(sub(d, 1, 'week'), 'week');
    if (s === 'next month')
        return startOf(add(d, 1, 'month'), 'month');
    if (s === 'last month')
        return startOf(sub(d, 1, 'month'), 'month');
    if (s === 'next quarter')
        return startOf(add(d, 3, 'month'), 'month');
    if (s === 'last quarter')
        return startOf(sub(d, 3, 'month'), 'month');
    if (s === 'this week')
        return startOf(d, 'week');
    if (s === 'this month')
        return startOf(d, 'month');
    // "next monday" / "last friday"
    const nextDay = s.match(/^(next|last)\s+(\w+)$/);
    if (nextDay) {
        const dir = nextDay[1] === 'next' ? 1 : -1;
        const idx = DAYS.indexOf(nextDay[2]);
        if (idx !== -1) {
            const cur = d.getDay();
            let delta = (idx - cur + 7) % 7 || 7;
            if (dir === -1)
                delta = delta === 7 ? 0 : delta - 7;
            return startOf(add(d, dir * Math.abs(delta), 'day'), 'day');
        }
    }
    // "in 2 hours", "in 30 minutes"
    const inMatch = s.match(/^in\s+(\d+(?:\.\d+)?)\s+(\w+)$/);
    if (inMatch) {
        const amount = parseFloat(inMatch[1]);
        const unit = UNITS[inMatch[2]];
        if (unit)
            return add(d, amount, unit);
    }
    // "2 hours ago", "30 minutes ago"
    const agoMatch = s.match(/^(\d+(?:\.\d+)?)\s+(\w+)\s+ago$/);
    if (agoMatch) {
        const amount = parseFloat(agoMatch[1]);
        const unit = UNITS[agoMatch[2]];
        if (unit)
            return add(d, -amount, unit);
    }
    // "every day at 9am", "next monday at 3pm"
    const nextMatch = s.match(/^next\s+(\w+)(?:\s+at\s+(\d+)(?::(\d+))?\s*(am|pm)?)?$/);
    if (nextMatch) {
        const day = WEEKDAYS[nextMatch[1]];
        if (day !== undefined) {
            //  const d: any = new Date(d)
            const diff = (day - d.getDay() + 7) % 7 || 7;
            d.setDate(d.getDate() + diff);
            if (nextMatch[2]) {
                let h = parseInt(nextMatch[2]);
                const m = parseInt(nextMatch[3] ?? '0');
                if (nextMatch[4] === 'pm' && h < 12)
                    h += 12;
                if (nextMatch[4] === 'am' && h === 12)
                    h = 0;
                d.setHours(h, m, 0, 0);
            }
            return d;
        }
    }
    // "at 9am", "at 14:30"
    const atMatch = s.match(/^at\s+(\d+)(?::(\d+))?\s*(am|pm)?$/);
    if (atMatch) {
        // const d: any = new Date(d)
        let h = parseInt(atMatch[1]);
        const m = parseInt(atMatch[2] ?? '0');
        if (atMatch[3] === 'pm' && h < 12)
            h += 12;
        if (atMatch[3] === 'am' && h === 12)
            h = 0;
        d.setHours(h, m, 0, 0);
        if (d <= d)
            d.setDate(d.getDate() + 1);
        return d;
    }
    // "january 15", "jan 15 2026"
    const monthDayMatch = s.match(/^(\w+)\s+(\d+)(?:\s+(\d{4}))?$/);
    if (monthDayMatch) {
        const mo = MONTHS[monthDayMatch[1]];
        if (mo !== undefined) {
            // const d: any = new Date(d)
            d.setMonth(mo, parseInt(monthDayMatch[2]));
            if (monthDayMatch[3])
                d.setFullYear(parseInt(monthDayMatch[3]));
            d.setHours(0, 0, 0, 0);
            return d;
        }
    }
    // "in 3 days" / "3 days ago" / "2 weeks ago" / "in 1 hour"
    const rel = s.match(/^(in\s+)?(\d+)\s+(minute|hour|day|week|month|year)s?\s*(ago)?$/);
    if (rel) {
        const amt = parseInt(rel[2]);
        const unit = rel[3];
        return rel[4] ? sub(d, amt, unit) : add(d, amt, unit);
    }
    // "march 15" / "mar 15" / "15 march"
    for (let i = 0; i < 12; i++) {
        const long = MONTHS_LONG[i];
        const short = MONTHS_SHORT[i];
        const mDay1 = s.match(new RegExp(`^(${long}|${short})\\s+(\\d{1,2})(?:st|nd|rd|th)?$`));
        const mDay2 = s.match(new RegExp(`^(\\d{1,2})(?:st|nd|rd|th)?\\s+(${long}|${short})$`));
        const match = mDay1 || mDay2;
        if (match) {
            const day = parseInt(mDay1 ? match[2] : match[1]);
            const out = new Date(d);
            out.setMonth(i, day);
            out.setHours(0, 0, 0, 0);
            return out;
        }
    }
    const native = new Date(input);
    if (!isNaN(native.getTime()))
        return native;
    throw new Error(`temporalShift.parseNatural: cannot parse "${input}"`);
}
export function expandRecurring(event, viewStart, viewEnd) {
    const { start, end, rrule } = event;
    const duration = end.getTime() - start.getTime();
    const { freq, interval = 1, count, until, byDay, byMonthDay } = rrule;
    const results = [];
    let cursor = new Date(start);
    let n = 0;
    while (cursor <= viewEnd) {
        if (count !== undefined && n >= count)
            break;
        if (until && cursor > until)
            break;
        if (cursor >= viewStart) {
            const passDay = !byDay || byDay.includes(cursor.getDay());
            const passMonDay = !byMonthDay || byMonthDay.includes(cursor.getDate());
            if (passDay && passMonDay) {
                results.push({ start: new Date(cursor), end: new Date(cursor.getTime() + duration) });
                n++;
            }
        }
        switch (freq) {
            case 'daily':
                cursor = add(cursor, interval, 'day');
                break;
            case 'weekly':
                cursor = add(cursor, interval, 'week');
                break;
            case 'monthly':
                cursor = add(cursor, interval, 'month');
                break;
            case 'yearly':
                cursor = add(cursor, interval, 'year');
                break;
        }
    }
    return results;
}
export function weekLoad(events, weekStart) {
    const wEnd = endOf(weekStart, 'week');
    return events.reduce((total, e) => {
        if (!overlaps(e, { start: weekStart, end: wEnd }))
            return total;
        const s = e.start < weekStart ? weekStart : e.start;
        const en = e.end > wEnd ? wEnd : e.end;
        return total + (en.getTime() - s.getTime()) / 60000;
    }, 0);
}
export function snapToSlot(date, minutes) {
    const d = new Date(date);
    const m = d.getMinutes();
    d.setMinutes(Math.round(m / minutes) * minutes, 0, 0);
    return d;
}
export function durationLabel(ms) {
    const m = Math.round(ms / 60000);
    if (m < 60)
        return `${m}m`;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem ? `${h}h ${rem}m` : `${h}h`;
}
export function isTravelDay(eventA, eventB) { if (!eventA.city || !eventB.city)
    return false; return eventA.city.toLowerCase() !== eventB.city.toLowerCase() && isSameDay(eventA.start, eventB.start); }
export function isSameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
export function isSameWeek(a, b) { return isSameDay(startOf(a, 'week'), startOf(b, 'week')); }
export function isSameMonth(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth(); }
export function isWeekend(date) { const d = date.getDay(); return d === 0 || d === 6; }
export function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
export function clamp(date, min, max) { if (date < min)
    return min; if (date > max)
    return max; return date; }
export function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
export function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
export function endOfMonth(d) { return new Date(d.getFullYear(), d.getMonth() + 1, 0); }
export function startOfWeek(d, weekStartsOn) {
    const result = new Date(d);
    const day = result.getDay();
    const diff = (day - weekStartsOn + 7) % 7;
    result.setDate(result.getDate() - diff);
    return result;
}
export function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
export function addMonths(d, n) { const r = new Date(d); r.setMonth(r.getMonth() + n); return r; }
export function subMonths(d, n) { const r = new Date(d); r.setMonth(r.getMonth() - n); return r; }
export function diffDays(a, b) { return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86400000); }
export function getWeekNumber(d) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const y = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - y.getTime()) / 86400000) + 1) / 7);
}
export function getWeekDays(weekStartsOn, locale) {
    const base = new Date(2024, 0, 7 + weekStartsOn);
    return Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(addDays(base, i)));
}
export function getMonthGrid(month, weekStartsOn, fixedWeeks) {
    const first = startOfMonth(month);
    const last = endOfMonth(month);
    const dow = (first.getDay() - weekStartsOn + 7) % 7;
    const start = new Date(first);
    start.setDate(start.getDate() - dow);
    const weeks = [];
    const cur = new Date(start);
    while (cur <= last || (fixedWeeks && weeks.length < 6)) {
        const week = [];
        for (let i = 0; i < 7; i++) {
            week.push(new Date(cur));
            cur.setDate(cur.getDate() + 1);
        }
        weeks.push(week);
        if (cur > last && (!fixedWeeks || weeks.length >= 6))
            break;
    }
    return weeks;
}
export function getQuarter(date) { return Math.floor(date.getMonth() / 3); }
export function quarterStart(year, quarter) { return new Date(year, quarter * 3, 1); }
export function quarterEnd(year, quarter) { return endOfMonth(new Date(year, quarter * 3 + 2, 1)); }
export function getLocaleWeekStart() {
    try {
        const locale = Intl.DateTimeFormat().resolvedOptions().locale;
        const sundayLocales = ['en-US', 'en-CA', 'en-AU', 'zh', 'ja', 'ko', 'ar', 'he', 'fa'];
        return sundayLocales.some(l => locale.startsWith(l.split('-')[0])) ? 0 : 1;
    }
    catch {
        return 0;
    }
}
export function ToLocalString(v = FORMAT.full) {
    return new Date(v).toLocaleString("en-US", v);
}
export function isDateDisabled(date, disabled) {
    if (!disabled)
        return false;
    if (Array.isArray(disabled))
        return disabled.some(d => isSameDay(d, date));
    if (disabled.before && date < disabled.before)
        return true;
    if (disabled.after && date > disabled.after)
        return true;
    if (disabled.dayOfWeek?.includes(date.getDay()))
        return true;
    if (disabled.dates?.some(d => isSameDay(d, date)))
        return true;
    if (disabled.fn?.(date))
        return true;
    return false;
}
export function resolveSelection(date, mode, current, min, max, excludeDisabled, disabled) {
    if (mode === 'single')
        return date;
    if (mode === 'multi') {
        const prev = current ?? [];
        const exists = prev.findIndex(d => isSameDay(d, date));
        if (exists >= 0)
            return prev.filter((_, i) => i !== exists);
        if (max && prev.length >= max)
            return prev;
        return [...prev, date];
    }
    if (mode === 'week') {
        const ws = startOfWeek(date, getLocaleWeekStart());
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = addDays(ws, i);
            if (excludeDisabled && isDateDisabled(d, disabled))
                continue;
            days.push(d);
        }
        return { from: days[0], to: days[days.length - 1] };
    }
    if (mode === 'month')
        return { from: startOfMonth(date), to: endOfMonth(date) };
    if (mode === 'quarter') {
        const q = getQuarter(date);
        return { from: quarterStart(date.getFullYear(), q), to: quarterEnd(date.getFullYear(), q) };
    }
    if (mode === 'year')
        return { from: new Date(date.getFullYear(), 0, 1), to: new Date(date.getFullYear(), 11, 31) };
    if (mode === 'range' || mode === 'range-min') {
        const prev = current;
        if (!prev?.from || (prev.from && prev.to))
            return { from: date, to: null };
        const from = prev.from;
        if (date < from)
            return { from: date, to: from };
        if (mode === 'range-min' && min) {
            const minEnd = addDays(from, min - 1);
            if (date < minEnd)
                return { from, to: null };
        }
        return { from, to: date };
    }
    return date;
}
export function isDaySelected(date, mode, selected) {
    if (!selected)
        return false;
    if (mode === 'single')
        return isSameDay(date, selected);
    if (mode === 'multi')
        return selected.some(d => isSameDay(d, date));
    if (['range', 'range-min', 'week', 'month', 'quarter', 'year'].includes(mode)) {
        const r = selected;
        if (!r?.from)
            return false;
        if (isSameDay(date, r.from))
            return true;
        if (r.to && isSameDay(date, r.to))
            return true;
        if (r.from && r.to && date > r.from && date < r.to)
            return true;
    }
    return false;
}
export function isRangeStart(date, mode, selected) {
    if (!['range', 'range-min', 'week', 'month', 'quarter', 'year'].includes(mode))
        return false;
    const r = selected;
    return !!r?.from && isSameDay(date, r.from);
}
export function isRangeEnd(date, mode, selected) {
    if (!['range', 'range-min', 'week', 'month', 'quarter', 'year'].includes(mode))
        return false;
    const r = selected;
    return !!r?.to && isSameDay(date, r.to);
}
export function isRangeMiddle(date, mode, selected) {
    if (!['range', 'range-min', 'week', 'month', 'quarter', 'year'].includes(mode))
        return false;
    const r = selected;
    if (!r?.from || !r?.to)
        return false;
    return date > r.from && date < r.to;
}
export function defaultFormatters(locale) {
    return {
        formatDay: (d) => String(d.getDate()),
        formatWeekday: (d) => new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d),
        formatMonthCaption: (d) => new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(d),
        formatYearCaption: (d) => String(d.getFullYear()),
        formatWeekNumber: (n) => String(n),
    };
}
export function matchesDisabled(d, matcher) {
    if (!matcher)
        return false;
    if (Array.isArray(matcher))
        return matcher.some(m => matchesDisabled(d, m));
    if (typeof matcher === 'function')
        return matcher(d);
    if (matcher instanceof Date)
        return isSameDay(d, matcher);
    if ('from' in matcher) {
        const from = startOfDay(matcher.from);
        const to = matcher.to ? startOfDay(matcher.to) : from;
        const day = startOfDay(d);
        return day >= from && day <= to;
    }
    return false;
}
export function buildMonth(year, month, weekStartsOn) {
    const firstDay = new Date(year, month, 1);
    const start = startOf(firstDay, 'week');
    const weeks = [];
    let cursor = new Date(start);
    cursor.setDate(cursor.getDate() - cursor.getDay() + weekStartsOn);
    if (cursor > firstDay)
        cursor.setDate(cursor.getDate() - 7);
    for (let w = 0; w < 6; w++) {
        const week = [];
        for (let d = 0; d < 7; d++) {
            week.push(new Date(cursor));
            cursor.setDate(cursor.getDate() + 1);
        }
        weeks.push(week);
        if (cursor.getMonth() !== month && w >= 3)
            break;
    }
    return weeks;
}
/** ───────── NEED TO DO ──────────────── */
export function isDateInRange(date, range) {
}
export function sortDates(dates) {
}
export function parseISO(str) {
}
export function formatISO(date) {
}
export function isLeapYear(year) {
}
export function getDaysBetween(year) {
}
export function isSameHour(year) {
}
export function isSameMinute(year) {
}
export function getWeekOfMonth(year) {
}
export function getDaysInWeek(year) {
}
export function getMonthName(year) {
}
export function getDayName(year) {
}
