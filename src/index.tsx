import React, { useState, useEffect, useCallback, createRef, RefObject } from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { Calendar, CalendarDate } from 'calendar-base';
import useCalendarClickDrag from './Hooks/useCalendarClickDrag';
import { v4 as uuidv4 } from 'uuid';


const useStyles = makeStyles(() =>
    createStyles({
		root: (props: any) => ({
            flexGrow: 1,
			maxWidth: props.maxWidth ?? '100%'
        }),
        paper: {
            height: 140,
        },
    }),
);


type Month = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export interface IMaterialCalendarProps {
    year: number;
    month: Month;
	events: CalendarEvent[];
	addEventHandler: (event: CalendarEvent) => void;
	removeEventHandler: (event: CalendarEvent) => void;
    maxWidth?: string | number;
};

export class CalendarEvent {
	id: string;
	name: string;
	startDate: Date;
	endDate: Date;
	allDayEvent: boolean;

	constructor(id: string, name: string, startDate: Date, endDate: Date, allDayEvent: boolean = true) {
		this.id = id;
		this.name = name;

		if (startDate > endDate) {
			this.startDate = endDate;
			this.endDate = startDate;
		} else {
			this.startDate = startDate;
			this.endDate = endDate;
		}

		this.allDayEvent = allDayEvent;
	}
}

const MaterialCalendar: React.FC<IMaterialCalendarProps> = ({year, month, events, addEventHandler, maxWidth}) => {
    const classes = useStyles({ maxWidth });
    const [monthDays, setMonthDays] = useState<(false | CalendarDate)[]>([]);
	const [newEventStartDay, setNewEventStartDay] = useState<number | null>(null);
	const [newEventEndDay, setNewEventEndDay] = useState<number | null>(null);
	const [dayRefs, setDayRefs] = useState<RefObject<HTMLDivElement>[]>([]);

	const clickDayHandler = useCallback((event: Event, day: number) => {
		if (event.type === 'mousedown') {
			event.preventDefault();

			setNewEventStartDay(day);
			setNewEventEndDay(day);
		} else if (event.type === 'mouseup' && newEventStartDay !== null && newEventEndDay !== null) {
			if (monthDays[newEventStartDay] === false || monthDays[newEventEndDay] === false) return;

			event.preventDefault();

			// Create calendar event
			const sd = monthDays[newEventStartDay] as CalendarDate;
			const ed = monthDays[newEventEndDay] as CalendarDate;
			let startDate = new Date(sd.year, sd.month, sd.day);
			let endDate = new Date(ed.year, ed.month, ed.day);
			const calendarEvent = new CalendarEvent(uuidv4(), `Event ${events.length + 1}`, startDate, endDate);

			// Add the calendar event
			addEventHandler(calendarEvent);

			setNewEventStartDay(null);
			setNewEventEndDay(null);
		} else if (event.type === 'mouseenter' && newEventStartDay !== null) {
			event.preventDefault();

			setNewEventEndDay(day);
		}
	}, [newEventStartDay, newEventEndDay, setNewEventStartDay, setNewEventEndDay, addEventHandler, events, addEventHandler]);

	useCalendarClickDrag(dayRefs, clickDayHandler);

    useEffect(() => {
        const cal = new Calendar({siblingMonths: true, weekStart: 1});
		const monthCalendar = cal.getCalendar(Math.round(year), Math.max(Math.min(month, 11), 0));
        setMonthDays(monthCalendar);

		// Update the references
		setDayRefs([...Array(monthCalendar.length)].map(() => createRef()));
    }, [year, month]);

    const getWeekGrid = (week: number) => {
        if (monthDays.length < (week + 1) * 7) return;

        return (
            <>
                {[...Array(7).keys()].map(wd => {
					const dayIdx = week * 7 + wd;
                    const weekDay = monthDays[dayIdx];

                    return (
                        <Grid key={dayIdx} item xs className={classes.paper} ref={dayRefs[dayIdx]}>
							{weekDay ? weekDay.day : ''}
                        </Grid>
                    );
                })}
            </>
        );
    };

    const getMonthGrid = () => {
        const weeks = Math.ceil(monthDays.length / 7);

        return (
            <>
                {[...Array(weeks).keys()].map(week => (
                    <Grid key={week} container justify="center" spacing={1}>
                        {getWeekGrid(week)}
                    </Grid>
                ))}
            </>
        );
    };

    return (
		<Grid container className={classes.root} spacing={2}>
			<Grid item xs={12}>
				{getMonthGrid()}
			</Grid>
		</Grid>
    );
}

export default React.memo(MaterialCalendar);

