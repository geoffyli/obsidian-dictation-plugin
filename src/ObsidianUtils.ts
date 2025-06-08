import { View, Plugin } from "obsidian";


export const getActiveDocument = (plugin: Plugin) => {
	// Use Obsidian's workspace API to get the active view
	const activeView = plugin.app.workspace.getActiveViewOfType(View);
	if (activeView && activeView.containerEl) {
		// Get the document from the active view's container
		const leafDocument = activeView.containerEl.ownerDocument;
		if (leafDocument) {
			console.log(
				"Transcriber: Active view document found:",
				leafDocument
			);
			return leafDocument;
		}
	}

	// Fallback: check for focused element in any window
	const activeElement = document.activeElement;
	if (activeElement) {
		console.log(
			"Transcriber: Active element found:",
			activeElement.ownerDocument || document
		);
		return activeElement.ownerDocument || document;
	}

	console.log(
		"Transcriber: No active document found, falling back to main document."
	);
	return document; // fallback to main document
}
