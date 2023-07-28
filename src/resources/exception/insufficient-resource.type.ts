export type InsufficientResourceType = {
	resourceId: string;
	resourceName: string;
	requiredResources: number;
	currentResources: number;
	difference: number;
};
