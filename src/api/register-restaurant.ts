import { api } from "@/lib/axios";

export interface RegisterRestaurant {
	restaurantName: string;
	managerName: string;
	email: string;
	phone: string;
}

export async function registerRestaurant({
	email,
	managerName,
	phone,
	restaurantName,
}: RegisterRestaurant) {
	await api.post("/restaurants", {
		email,
		managerName,
		phone,
		restaurantName,
	});
}
