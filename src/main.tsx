import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./app.tsx";
import { enableMSW } from "./mocks/index.ts";

enableMSW().then(() => {
	ReactDOM.createRoot(document.getElementById("root")!).render(
		<React.StrictMode>
			<App />
		</React.StrictMode>,
	);
});
