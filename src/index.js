// #endregion 
//                                                                                        TEMPORAL SHIFT
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
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
}; // Same token set, but driven off UTC getters. Used by formatInTZ, since the
// output of toTZ() is a "shifted" Date meant to be read with UTC getters only.
const UTC_TOKENS = {
    YYYY: d => String(d.getUTCFullYear()),
    YY: d => String(d.getUTCFullYear()).slice(-2),
    MM: d => String(d.getUTCMonth() + 1).padStart(2, '0'),
    M: d => String(d.getUTCMonth() + 1),
    DD: d => String(d.getUTCDate()).padStart(2, '0'),
    D: d => String(d.getUTCDate()),
    HH: d => String(d.getUTCHours()).padStart(2, '0'),
    H: d => String(d.getUTCHours()),
    hh: d => String(d.getUTCHours() % 12 || 12).padStart(2, '0'),
    h: d => String(d.getUTCHours() % 12 || 12),
    mm: d => String(d.getUTCMinutes()).padStart(2, '0'),
    m: d => String(d.getUTCMinutes()),
    ss: d => String(d.getUTCSeconds()).padStart(2, '0'),
    A: d => d.getUTCHours() < 12 ? 'AM' : 'PM',
    a: d => d.getUTCHours() < 12 ? 'am' : 'pm',
    dd: d => ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d.getUTCDay()],
    ddd: d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()],
    dddd: d => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getUTCDay()],
    MMM: d => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()],
    MMMM: d => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][d.getUTCMonth()],
};
const FORMAT = {
    full: { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
    dm: { month: 'short', day: 'numeric' },
    dmy: { year: 'numeric', month: 'short', day: 'numeric' },
    dmyw: { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' },
    t: { hour: '2-digit', minute: '2-digit' },
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
// #endregion 
//                                                                      core parse / format / arithmetic
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
export function parse(input, tz) {
    if (input instanceof Date)
        return tz ? toTZ(input, tz) : new Date(input);
    if (typeof input === 'number')
        return new Date(input);
    const d = new Date(input);
    if (!isNaN(d.getTime()))
        return tz ? toTZ(d, tz) : d;
    throw new Error(`temporalShift.parse: cannot parse "${input}"`);
} /** Non-throwing variant of parse(). Returns null instead of throwing on bad input. */
export function tryParse(input, tz) {
    try {
        return parse(input, tz);
    }
    catch {
        return null;
    }
}
export function format(date, template) {
    const keys = Object.keys(TOKENS).sort((a, b) => b.length - a.length);
    let out = template;
    for (const k of keys)
        out = out.split(k).join(TOKENS[k](date));
    return out;
} /** Like format(), but reads the date with UTC getters — pair with toTZ()'s output. */
function formatUTC(date, template) {
    const keys = Object.keys(UTC_TOKENS).sort((a, b) => b.length - a.length);
    let out = template;
    for (const k of keys)
        out = out.split(k).join(UTC_TOKENS[k](date));
    return out;
} /** Format an absolute instant as wall-clock time in `tz`, in one call. */
export function formatInTZ(date, template, tz) {
    return formatUTC(toTZ(date, tz), template);
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
// #endregion 
//                                                                                              timezone
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
/* ─────────────────────────  ─────────────────────────
 * No Temporal dependency, so this computes real offsets via Intl and shifts
 * the Date's underlying timestamp. The result is only safe to read with
 * getUTC*() methods (or formatInTZ/formatUTC) — NOT getHours()/getDate(),
 * which fall back to the *system's* local timezone, not `tz`.
 */
function tzOffsetMinutes(date, tz) {
    const dtf = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hourCycle: 'h23',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    const parts = Object.fromEntries(dtf.formatToParts(date).map(p => [p.type, p.value]));
    const asUTC = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute), Number(parts.second));
    return (asUTC - date.getTime()) / 60000;
} /** Offset in minutes such that (local wall time) = (UTC) + offset. */
export function tzOffset(tz, date = new Date()) {
    return tzOffsetMinutes(date, tz);
} /** Shift `date` so its UTC getters read as wall-clock time in `tz`. Read with getUTC*() only. */
export function toTZ(date, tz) {
    return new Date(date.getTime() + tzOffsetMinutes(date, tz) * 60000);
} /** Inverse of toTZ: given a Date whose UTC fields are a wall-clock time meant for `tz`, return the real instant. */
export function fromTZ(date, tz) {
    let guess = date.getTime();
    // Two passes resolves almost all DST-boundary cases; a Temporal migration removes this entirely.
    for (let i = 0; i < 2; i++) {
        const offset = tzOffsetMinutes(new Date(guess), tz);
        guess = date.getTime() - offset * 60000;
    }
    return new Date(guess);
}
export function localTZ() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
// #endregion 
//                                                                                    ranges / conflicts
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
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
export function isDateInRange(date, range) {
    return date >= range.start && date <= range.end;
}
// #endregion 
//                                                                           relative / natural language
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
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
    const inMatch = s.match(/^in\s+(\d+(?:\.\d+)?)\s+(\w+)$/);
    if (inMatch) {
        const amount = parseFloat(inMatch[1]);
        const unit = UNITS[inMatch[2]];
        if (unit)
            return add(d, amount, unit);
    }
    const agoMatch = s.match(/^(\d+(?:\.\d+)?)\s+(\w+)\s+ago$/);
    if (agoMatch) {
        const amount = parseFloat(agoMatch[1]);
        const unit = UNITS[agoMatch[2]];
        if (unit)
            return add(d, -amount, unit);
    }
    const nextMatch = s.match(/^next\s+(\w+)(?:\s+at\s+(\d+)(?::(\d+))?\s*(am|pm)?)?$/);
    if (nextMatch) {
        const day = WEEKDAYS[nextMatch[1]];
        if (day !== undefined) {
            const diffDaysAhead = (day - d.getDay() + 7) % 7 || 7;
            d.setDate(d.getDate() + diffDaysAhead);
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
    // "at 9am", "at 14:30" — FIX: roll to tomorrow only if the resolved time
    // has already passed *relative to `from`*, not compared against itself.
    const atMatch = s.match(/^at\s+(\d+)(?::(\d+))?\s*(am|pm)?$/);
    if (atMatch) {
        let h = parseInt(atMatch[1]);
        const m = parseInt(atMatch[2] ?? '0');
        if (atMatch[3] === 'pm' && h < 12)
            h += 12;
        if (atMatch[3] === 'am' && h === 12)
            h = 0;
        const result = new Date(d);
        result.setHours(h, m, 0, 0);
        if (result <= from)
            result.setDate(result.getDate() + 1);
        return result;
    }
    const monthDayMatch = s.match(/^(\w+)\s+(\d+)(?:\s+(\d{4}))?$/);
    if (monthDayMatch) {
        const mo = MONTHS[monthDayMatch[1]];
        if (mo !== undefined) {
            d.setMonth(mo, parseInt(monthDayMatch[2]));
            if (monthDayMatch[3])
                d.setFullYear(parseInt(monthDayMatch[3]));
            d.setHours(0, 0, 0, 0);
            return d;
        }
    }
    const rel = s.match(/^(in\s+)?(\d+)\s+(minute|hour|day|week|month|year)s?\s*(ago)?$/);
    if (rel) {
        const amt = parseInt(rel[2]);
        const unit = rel[3];
        return rel[4] ? sub(d, amt, unit) : add(d, amt, unit);
    }
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
export function tryParseNatural(input, from = new Date()) {
    try {
        return parseNatural(input, from);
    }
    catch {
        return null;
    }
}
// #endregion 
//                                                                                     recurrence / load
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
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
export function isTravelDay(eventA, eventB) {
    if (!eventA.city || !eventB.city)
        return false;
    return eventA.city.toLowerCase() !== eventB.city.toLowerCase() && isSameDay(eventA.start, eventB.start);
}
// #endregion 
//                                                                                  comparisons / basics
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
export function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
export function isSameWeek(a, b) { return isSameDay(startOf(a, 'week'), startOf(b, 'week')); }
export function isSameMonth(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth(); }
export function isSameHour(a, b) { return isSameDay(a, b) && a.getHours() === b.getHours(); }
export function isSameMinute(a, b) { return isSameHour(a, b) && a.getMinutes() === b.getMinutes(); }
export function isWeekend(date) { const d = date.getDay(); return d === 0 || d === 6; }
export function isLeapYear(year) { return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0; }
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
    const diffDaysBack = (day - weekStartsOn + 7) % 7;
    result.setDate(result.getDate() - diffDaysBack);
    return result;
}
export function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
export function addMonths(d, n) { const r = new Date(d); r.setMonth(r.getMonth() + n); return r; }
export function subMonths(d, n) { const r = new Date(d); r.setMonth(r.getMonth() - n); return r; }
export function diffDays(a, b) { return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86400000); }
export function getDaysBetween(a, b) { return Math.abs(diffDays(a, b)); }
export function getWeekNumber(d) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const y = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - y.getTime()) / 86400000) + 1) / 7);
}
export function getWeekOfMonth(date, weekStartsOn = 0) {
    const firstWeekStart = startOfWeek(startOfMonth(date), weekStartsOn);
    return Math.floor(diffDays(firstWeekStart, date) / 7) + 1;
}
export function getDaysInWeek(date, weekStartsOn = 0) {
    const start = startOfWeek(date, weekStartsOn);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}
export function getMonthName(date, locale = 'en-US', format = 'long') {
    return new Intl.DateTimeFormat(locale, { month: format }).format(date);
}
export function getDayName(date, locale = 'en-US', format = 'long') {
    return new Intl.DateTimeFormat(locale, { weekday: format }).format(date);
}
export function getWeekDays(weekStartsOn, locale) {
    const base = new Date(2024, 0, 7 + weekStartsOn);
    return Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(addDays(base, i)));
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
} /* ───────────────────────── ISO / locale strings ───────────────────────── */
// #endregion 
//                                                                      calendar grid / picker selection
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
const ISO_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;
export function parseISO(str) {
    if (!ISO_RE.test(str))
        throw new Error(`temporalShift.parseISO: "${str}" is not a valid ISO 8601 string`);
    const d = new Date(str);
    if (isNaN(d.getTime()))
        throw new Error(`temporalShift.parseISO: invalid ISO string "${str}"`);
    return d;
}
export function formatISO(date, opts = {}) {
    const iso = date.toISOString();
    return opts.dateOnly ? iso.slice(0, 10) : iso;
}
export function toLocalString(date, opts = FORMAT.full, locale = 'en-US') {
    return date.toLocaleString(locale, opts);
}
// #endregion 
//                                                                      disabled-date matching (unified)
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
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
    if (matcher.before && d < matcher.before)
        return true;
    if (matcher.after && d > matcher.after)
        return true;
    if (matcher.dayOfWeek?.includes(d.getDay()))
        return true;
    if (matcher.dates?.some(x => isSameDay(x, d)))
        return true;
    if (matcher.fn?.(d))
        return true;
    return false;
}
// #endregion 
//                                                                      calendar grid / picker selection
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
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
export function sortDates(dates, order = 'asc') {
    const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
    return order === 'asc' ? sorted : sorted.reverse();
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
            if (excludeDisabled && matchesDisabled(d, disabled))
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
// #endregion 
//                                                                                            DEPRECATED
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
/** @deprecated use getMonthGrid(new Date(year, month, 1), weekStartsOn, true) — kept as a thin alias. */
export function buildMonth(year, month, weekStartsOn) {
    return getMonthGrid(new Date(year, month, 1), weekStartsOn, true);
}
/** @deprecated alias of matchesDisabled — kept for backward compatibility. */
export const isDateDisabled = matchesDisabled;
// #endregion 
