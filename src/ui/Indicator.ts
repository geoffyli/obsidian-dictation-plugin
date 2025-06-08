// Indicator.ts
// UI component to show a microphone icon at the cursor position when dictation is active

import { Plugin } from "obsidian";
import { getActiveDocument } from "src/ObsidianUtils";

export class DictationIndicator {
	private plugin: Plugin;
	private indicatorEl: HTMLElement | null = null;
	private cachedDocument: Document | null = null;
	
	constructor(plugin: Plugin) {
		this.plugin = plugin;
	}
	private indicatorSize = 24;
	private bgColor = "var(--interactive-accent)";
	private strokeColor = "#FFF";
	private currentType: "recording" | "processing" | null = null;
	private recordingIndicatorHTML = `
            <svg width="${this.indicatorSize}" height="${this.indicatorSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="20" height="20" rx="6" fill="${this.bgColor}"/>
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" stroke="${this.strokeColor}" stroke-width="2" fill="${this.bgColor}"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="${this.strokeColor}" stroke-width="2"/>
                <line x1="12" x2="12" y1="19" y2="22" stroke="${this.strokeColor}" stroke-width="2"/>
            </svg>
        `;
	private processingIndicatorHTML = `
            <svg width="${this.indicatorSize}" height="${this.indicatorSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="dictation-icon-spin">
                <rect x="2" y="2" width="20" height="20" rx="6" fill="${this.bgColor}"/>
                <g>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" stroke="${this.strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                </g>
            </svg>
        `;

	// callback for indicator click
	onStopRecording?: () => void;

	show(indicatorType: "recording" | "processing") {
		if (this.indicatorEl) {
			// Update to the processing type and SVG
			this.currentType = indicatorType;
			this.indicatorEl.innerHTML = this.processingIndicatorHTML;
			this.indicatorEl.classList.toggle("processing");
			return;
		}
		// Cache the document when first showing the indicator
		this.cachedDocument = getActiveDocument(this.plugin);
		
		// Construct the processing indicator element
		this.currentType = indicatorType;
		this.indicatorEl = this.cachedDocument.createElement("div");
		this.indicatorEl.className = "dictation-indicator";
		this.indicatorEl.innerHTML = this.recordingIndicatorHTML;
		this.indicatorEl.classList.toggle("processing");
		this.indicatorEl.style.position = "absolute";
		this.indicatorEl.style.zIndex = "9999";
		this.indicatorEl.style.pointerEvents = "auto";
		this.indicatorEl.style.transition = "opacity 0.2s";
		this.indicatorEl.style.opacity = "1";
		
		this.cachedDocument.body.appendChild(this.indicatorEl);
		this.positionAtCursor();
		this.cachedDocument.addEventListener("selectionchange", this.positionAtCursor);
		this.indicatorEl.addEventListener("click", this.handleClick);
	}

	hide() {
		if (this.indicatorEl && this.cachedDocument) {
			// Remove event listener from the cached document
			this.cachedDocument.removeEventListener(
				"selectionchange",
				this.positionAtCursor
			);
			this.indicatorEl.removeEventListener("click", this.handleClick);
			if (this.indicatorEl.parentNode) {
				this.indicatorEl.parentNode.removeChild(this.indicatorEl);
			}
			this.indicatorEl = null;
			this.currentType = null;
			this.cachedDocument = null;
		}
	}

	private handleClick = async () => {
		if (this.currentType === "recording" && this.onStopRecording) {
			await this.onStopRecording();
		}
	};

	private positionAtCursor = () => {
		if (!this.cachedDocument) return;
		const targetWindow = this.cachedDocument.defaultView || window;
		const selection = targetWindow.getSelection();
		if (!selection || selection.rangeCount === 0) return;
		const range = selection.getRangeAt(0);
		let rect: DOMRect | null = null;
		if (!range.collapsed) {
			rect = range.getBoundingClientRect();
		} else {
			// Insert a temporary span to get the caret position
			const tempSpan = this.cachedDocument.createElement("span");
			tempSpan.textContent = "\u200b";
			range.insertNode(tempSpan);
			rect = tempSpan.getBoundingClientRect();
			tempSpan.parentNode?.removeChild(tempSpan);
			// Restore selection
			selection.removeAllRanges();
			selection.addRange(range);
		}
		if (rect && this.indicatorEl) {
			// Center the indicator horizontally above the cursor, with a small gap
			const gap = 8; // px, space between cursor and indicator
			this.indicatorEl.style.left = `${
				rect.left +
				targetWindow.scrollX +
				rect.width / 2 -
				this.indicatorSize / 2
			}px`;
			this.indicatorEl.style.top = `${
				rect.top + targetWindow.scrollY - this.indicatorSize - gap
			}px`;
		}
	};
}

