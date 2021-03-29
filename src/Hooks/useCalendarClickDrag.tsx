import { useState, useEffect, RefObject } from 'react';

export type handlerType = (event: Event, day: number) => void;

const useCalendarClickDrag = (refs: RefObject<HTMLElement>[], handler: handlerType) => {
	const [handlers, setHandlers] = useState<((e: Event) => void)[]>([]);

	useEffect(() => {
		setHandlers([...Array(refs.length).keys()].map(idx => (e: Event) => handler(e, idx)));
	}, [refs, handler]);

	useEffect(() => {
		if (refs.length !== handlers.length) return;

		refs.forEach((ref, idx) => {
			const node = ref.current;
			if (node) {
				node.addEventListener('mousedown', handlers[idx]);
				node.addEventListener('mouseup', handlers[idx]);
				node.addEventListener('mouseenter', handlers[idx]);
			}
		});

		return () => {
			refs.forEach((ref, idx) => {
				const node = ref.current;
				if (node) {
					node.removeEventListener('mousedown', handlers[idx]);
					node.removeEventListener('mouseup', handlers[idx]);
					node.removeEventListener('mouseenter', handlers[idx]);
				}
			});
		}
	}, [refs, handlers]);
};

export default useCalendarClickDrag;

