// Indicator.ts
// UI component to show a microphone icon at the cursor position when dictation is active

export class DictationIndicator {
	private indicatorEl: HTMLElement | null = null;
	private indicatorSize = 24;
	private bgColor = "var(--interactive-accent)";
	private strokeColor = "#FFF";
	private currentType: "recording" | "processing" | null = null;
	
	private recordingIndicator = `
            <svg width="${this.indicatorSize}" height="${this.indicatorSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="20" height="20" rx="6" fill="${this.bgColor}"/>
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" stroke="${this.strokeColor}" stroke-width="2" fill="${this.bgColor}"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="${this.strokeColor}" stroke-width="2"/>
                <line x1="12" x2="12" y1="19" y2="22" stroke="${this.strokeColor}" stroke-width="2"/>
            </svg>
        `;

	private processingIndicator = `
            <svg width="${this.indicatorSize}" height="${this.indicatorSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="spin">
                <rect x="2" y="2" width="20" height="20" rx="6" fill="${this.bgColor}"/>
                <g class="dictation-indicator-spin">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" stroke="${this.strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                </g>
            </svg>
        `;

	show(indicatorType: "recording" | "processing") {
		// If indicator already exists and we're just changing type, update it
		if (this.indicatorEl && this.currentType !== indicatorType) {
			if (indicatorType === "processing") {
				this.indicatorEl.innerHTML = this.processingIndicator;
			} else {
				this.indicatorEl.innerHTML = this.recordingIndicator;
			}
			this.currentType = indicatorType;
			return;
		}
		
		// If indicator doesn't exist, create it
		if (!this.indicatorEl) {
			this.indicatorEl = document.createElement("div");
			this.indicatorEl.className = "dictation-indicator";
			this.indicatorEl.style.position = "absolute";
			this.indicatorEl.style.zIndex = "9999";
			this.indicatorEl.style.pointerEvents = "none";
			this.indicatorEl.style.transition = "opacity 0.2s";
			this.indicatorEl.style.opacity = "1";
			
			// Set the initial indicator type
			if (indicatorType === "processing") {
				this.indicatorEl.innerHTML = this.processingIndicator;
			} else {
				this.indicatorEl.innerHTML = this.recordingIndicator;
			}
			this.currentType = indicatorType;
			
			document.body.appendChild(this.indicatorEl);
			this.positionAtCursor();
			document.addEventListener("selectionchange", this.positionAtCursor);
		}
	}

	hide() {
		if (this.indicatorEl) {
			// Remove event listener before removing the element to avoid duplicate listeners
			document.removeEventListener(
				"selectionchange",
				this.positionAtCursor
			);
			// Remove the indicator from the DOM if it is still attached
			if (this.indicatorEl.parentNode) {
				this.indicatorEl.parentNode.removeChild(this.indicatorEl);
			}
			this.indicatorEl = null;
			this.currentType = null;
		}
	}

	private positionAtCursor = () => {
		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) return;
		const range = selection.getRangeAt(0);
		let rect: DOMRect | null = null;
		if (!range.collapsed) {
			rect = range.getBoundingClientRect();
		} else {
			// Insert a temporary span to get the caret position
			const tempSpan = document.createElement("span");
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
			const gap = 6; // px, space between cursor and indicator
			this.indicatorEl.style.left = `${
				rect.left +
				window.scrollX +
				rect.width / 2 -
				this.indicatorSize / 2
			}px`;
			this.indicatorEl.style.top = `${
				rect.top + window.scrollY - this.indicatorSize - gap
			}px`;
		}
	};
}

// Add some basic styles for the indicator (can be moved to CSS)
const style = document.createElement("style");
style.textContent = `
.dictation-indicator {
    width: 28px;
    height: 28px;
    display: flex;
    border-radius: 6px;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    opacity: 1;
    background: var(--interactive-accent, #fff);
}
.dictation-indicator-spin {
    transform-origin: 50% 50%;
    animation: dictation-spin 1s linear infinite;
}
@keyframes dictation-spin {
    100% { transform: rotate(360deg); }
}
`;
document.head.appendChild(style);
