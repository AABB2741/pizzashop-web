import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowRight, X } from "lucide-react";
import { Search } from "lucide-react";
import { useState } from "react";

import { approveOrder } from "@/api/approve-order";
import { cancelOrder } from "@/api/cancel-order";
import { deliverOrder } from "@/api/deliver-order";
import { dispatchOrder } from "@/api/dispatch-order";
import { GetOrdersResponse } from "@/api/get-orders";
import { OrderStatus } from "@/components/order-status";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { TableCell, TableRow } from "@/components/ui/table";

import { OrderDetails } from "./order-details";

interface OrderTableRowProps {
	order: {
		orderId: string;
		createdAt: string;
		status:
			| "pending"
			| "canceled"
			| "processing"
			| "delivering"
			| "delivered";
		customerName: string;
		total: number;
	};
}

export function OrderTableRow({ order }: OrderTableRowProps) {
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
	const queryClient = useQueryClient();

	function updateOrderStatusOnCache(orderId: string, status: OrderStatus) {
		const ordersListCache = queryClient.getQueriesData<GetOrdersResponse>({
			queryKey: ["orders"],
		});

		ordersListCache.forEach(([cacheKey, cacheData]) => {
			if (!cacheData) {
				return;
			}

			queryClient.setQueryData<GetOrdersResponse>(cacheKey, {
				...cacheData,
				orders: cacheData.orders.map((order) => {
					if (order.orderId === orderId) {
						return {
							...order,
							status,
						};
					} else return order;
				}),
			});
		});
	}

	const { mutateAsync: cancelOrderFn, isPending: isCancelingOrder } =
		useMutation({
			mutationFn: cancelOrder,
			async onSuccess(_data, { orderId }) {
				updateOrderStatusOnCache(orderId, "canceled");
			},
		});

	const { mutateAsync: approveOrderFn, isPending: isApprovingOrder } =
		useMutation({
			mutationFn: approveOrder,
			async onSuccess(_data, { orderId }) {
				updateOrderStatusOnCache(orderId, "processing");
			},
		});
	const { mutateAsync: deliverOrderFn, isPending: isDispatchingOrder } =
		useMutation({
			mutationFn: deliverOrder,
			async onSuccess(_data, { orderId }) {
				updateOrderStatusOnCache(orderId, "delivered");
			},
		});
	const { mutateAsync: dispatchOrderFn, isPending: isDeliveringOrder } =
		useMutation({
			mutationFn: dispatchOrder,
			async onSuccess(_data, { orderId }) {
				updateOrderStatusOnCache(orderId, "delivering");
			},
		});

	return (
		<TableRow>
			<TableCell>
				<Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
					<DialogTrigger asChild>
						<Button variant="outline" size="xs">
							<Search className="h-3 w-3" />
							<span className="sr-only">Detalhes do pedido</span>
						</Button>
					</DialogTrigger>

					<OrderDetails
						orderId={order.orderId}
						open={isDetailsOpen}
					/>
				</Dialog>
			</TableCell>
			<TableCell className="font-mono text-xs font-medium">
				{order.orderId}
			</TableCell>
			<TableCell className="text-muted-foreground">
				{formatDistanceToNow(order.createdAt, {
					locale: ptBR,
					addSuffix: true,
				})}
			</TableCell>
			<TableCell>
				<OrderStatus status={order.status} />
			</TableCell>
			<TableCell className="font-medium">{order.customerName}</TableCell>
			<TableCell className="font-medium">
				{(order.total / 100).toLocaleString("pt-BR", {
					style: "currency",
					currency: "BRL",
				})}
			</TableCell>
			<TableCell>
				{order.status === "pending" && (
					<Button
						variant="outline"
						size="xs"
						disabled={isApprovingOrder}
						onClick={() =>
							approveOrderFn({ orderId: order.orderId })
						}
					>
						<ArrowRight className="mr-2 h-3 w-3" />
						Aprovar
					</Button>
				)}

				{order.status === "processing" && (
					<Button
						variant="outline"
						size="xs"
						disabled={isDeliveringOrder}
						onClick={() =>
							dispatchOrderFn({ orderId: order.orderId })
						}
					>
						<ArrowRight className="mr-2 h-3 w-3" />
						Em entrega
					</Button>
				)}

				{order.status === "delivering" && (
					<Button
						variant="outline"
						size="xs"
						disabled={isDispatchingOrder}
						onClick={() =>
							deliverOrderFn({ orderId: order.orderId })
						}
					>
						<ArrowRight className="mr-2 h-3 w-3" />
						Entregue
					</Button>
				)}
			</TableCell>
			<TableCell>
				<Button
					disabled={
						!["pending", "processing"].includes(order.status) ||
						isCancelingOrder
					}
					variant="ghost"
					size="xs"
					onClick={() => cancelOrderFn({ orderId: order.orderId })}
				>
					<X className="mr-2 h-3 w-3" />
					Cancelar
				</Button>
			</TableCell>
		</TableRow>
	);
}
