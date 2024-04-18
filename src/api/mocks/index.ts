import { setupWorker } from "msw/browser";

import { env } from "@/env";

import { getDailyRevenueInPeriodMock } from "./get-daily-revenue-in-period";
import { getDaysOrdersAmountMock } from "./get-day-orders-amount";
import { getMonthCanceledOrdersAmountMock } from "./get-month-canceled-orders-amount";
import { getMonthOrdersAmountMock } from "./get-month-orders-amount";
import { getMonthRevenueMock } from "./get-month-revenue";
import { getPopularProductsMock } from "./get-popupar-products";
import { registerRestaurantMock } from "./register-restaurant";
import { signInMock } from "./sign-in";

export const worker = setupWorker(
	signInMock,
	registerRestaurantMock,
	getDaysOrdersAmountMock,
	getMonthOrdersAmountMock,
	getMonthCanceledOrdersAmountMock,
	getMonthRevenueMock,
	getDailyRevenueInPeriodMock,
	getPopularProductsMock,
);

export async function enableMSW() {
	if (env.MODE !== "test") {
		return;
	}

	await worker.start();
}
