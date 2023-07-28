export default [
	{
		name: 'building zone does not have building set',
		buildingFromQueue: {
			id: 'test',
		},
		buildingZoneFromQueue: {
			id: 1,
			level: 0,
			buildingId: null,
		},
		queueItemsToBeConsumed: [
			{
				id: 1,
				endLevel: 1,
			},
		],
		queueItemsToNotBeConsumed: [],
	},
	{
		name: 'building zone does not have building set and there are multiple queue items',
		buildingFromQueue: {
			id: 'test',
		},
		buildingZoneFromQueue: {
			id: 1,
			level: 0,
			buildingId: null,
		},
		queueItemsToBeConsumed: [
			{
				id: 1,
				endLevel: 1,
			},
			{
				id: 2,
				endLevel: 2,
			},
			{
				id: 3,
				endLevel: 3,
			},
		],
		queueItemsToNotBeConsumed: [],
	},
	{
		name: 'building zone have building set and there is single queue item',
		buildingFromQueue: {
			id: 'test',
		},
		buildingZoneFromQueue: {
			id: 1,
			level: 1,
			buildingId: 3,
		},
		queueItemsToBeConsumed: [
			{
				id: 1,
				endLevel: 2,
			},
		],
		queueItemsToNotBeConsumed: [],
	},
	{
		name: 'building zone have building set and there are multiple queue items',
		buildingFromQueue: {
			id: 'test',
		},
		buildingZoneFromQueue: {
			id: 1,
			level: 1,
			buildingId: 3,
		},
		queueItemsToBeConsumed: [
			{
				id: 1,
				endLevel: 2,
			},
			{
				id: 2,
				endLevel: 3,
			},
			{
				id: 3,
				endLevel: 4,
			},
		],
		queueItemsToNotBeConsumed: [],
	},
	{
		name: 'all queue items are not related to selected building zone',
		buildingFromQueue: {
			id: 'test',
		},
		buildingZoneFromQueue: {
			id: 1,
			level: 1,
			buildingId: 3,
		},
		queueItemsToBeConsumed: [],
		queueItemsToNotBeConsumed: [
			{
				id: 1,
				endLevel: 1,
				buildingZoneId: 15,
			},
		],
	},
	{
		name: 'there are some queue items with different building zone',
		buildingFromQueue: {
			id: 'test',
		},
		buildingZoneFromQueue: {
			id: 1,
			level: 1,
			buildingId: 3,
		},
		queueItemsToBeConsumed: [
			{
				id: 1,
				endLevel: 2,
			},
		],
		queueItemsToNotBeConsumed: [
			{
				id: 2,
				endLevel: 1,
				buildingZoneId: 15,
			},
		],
	},
];
