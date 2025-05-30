// Indicator.ts
// UI component to show a microphone icon at the cursor position when dictation is active

export class DictationIndicator {
    private indicatorEl: HTMLElement | null = null;

    show() {
        if (this.indicatorEl) return; // Already shown
        this.indicatorEl = document.createElement('div');
        this.indicatorEl.className = 'dictation-indicator';
        this.indicatorEl.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="12" fill="#222" opacity="0.7"/>
                <path d="M12 17c1.66 0 3-1.34 3-3v-4a3 3 0 10-6 0v4c0 1.66 1.34 3 3 3zm5-3v-1a1 1 0 10-2 0v1a5 5 0 01-10 0v-1a1 1 0 10-2 0v1c0 3.07 2.13 5.64 5 6.32V21h2v-1.68c2.87-.68 5-3.25 5-6.32z" fill="#fff"/>
            </svg>
        `;
        this.indicatorEl.style.position = 'absolute';
        this.indicatorEl.style.zIndex = '9999';
        this.indicatorEl.style.pointerEvents = 'none';
        this.indicatorEl.style.transition = 'opacity 0.2s';
        this.indicatorEl.style.opacity = '1';
        document.body.appendChild(this.indicatorEl);
        this.positionAtCursor();
        document.addEventListener('selectionchange', this.positionAtCursor);
    }

    hide() {
        if (this.indicatorEl) {
            document.body.removeChild(this.indicatorEl);
            this.indicatorEl = null;
            document.removeEventListener('selectionchange', this.positionAtCursor);
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
            const tempSpan = document.createElement('span');
            tempSpan.textContent = '\u200b';
            range.insertNode(tempSpan);
            rect = tempSpan.getBoundingClientRect();
            tempSpan.parentNode?.removeChild(tempSpan);
            // Restore selection
            selection.removeAllRanges();
            selection.addRange(range);
        }
        if (rect && this.indicatorEl) {
            this.indicatorEl.style.left = `${rect.left + window.scrollX}px`;
            this.indicatorEl.style.top = `${rect.top + window.scrollY - 28}px`;
        }
    }
}

// Add some basic styles for the indicator (can be moved to CSS)
const style = document.createElement('style');
style.textContent = `
.dictation-indicator {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    opacity: 0.9;
}
`;
document.head.appendChild(style);
