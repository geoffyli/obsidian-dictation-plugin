import Dictation from "main";
import { Notice, MarkdownView } from "obsidian";
import OpenAI from "openai";

export class Transcriber {
	private plugin: Dictation;
	private openai: OpenAI | null = null;
	constructor(plugin: Dictation) {
		this.plugin = plugin;
		try {
			this.openai = new OpenAI({
				apiKey: this.plugin.settings.apiKey,
				dangerouslyAllowBrowser: true, // Allow browser usage
			});
		} catch (error) {
			console.error("Failed to initialize OpenAI:", error);
			new Notice("Failed to initialize OpenAI: " + error.message);
			this.openai = null;
		}
	}

	async requestTranscription(
		blob: Blob,
		fileName: string
	): Promise<string | undefined> {
		if (this.plugin.settings.debugMode) {
			new Notice(`Sending audio data size: ${blob.size / 1000} KB`);
		}
		if (!this.openai) {
			new Notice(
				"OpenAI client is not initialized. Please check your API key."
			);
			return;
		}
		try {
			if (this.plugin.settings.debugMode) {
				new Notice("Parsing audio data:" + fileName);
			}

			// Convert Blob to File for OpenAI SDK
			const file = new File([blob], fileName, { type: blob.type });
			const transcription = await this.openai.audio.transcriptions.create(
				{
					file: file,
					model: this.plugin.settings.model,
					prompt: this.plugin.settings.prompt,
					response_format: "text",
				}
			);
			// Remove the \n character from the end of the transcription
			return transcription.endsWith("\n")
				? transcription.slice(0, -1)
				: transcription;
		} catch (err) {
			console.error("Error parsing audio:", err);
			new Notice("Error parsing audio: " + err.message);
		}
	}

	async insertTranscription(transcription: string): Promise<void> {
		// Try to get the currently focused element
		const activeElement = document.activeElement;
		if (
			activeElement &&
			(activeElement instanceof HTMLInputElement ||
				activeElement instanceof HTMLTextAreaElement)
		) {
			// Handle input and textarea elements
			const start = activeElement.selectionStart || 0;
			const end = activeElement.selectionEnd || 0;
			const value = activeElement.value;

			// Insert text at cursor position
			activeElement.value =
				value.substring(0, start) +
				transcription +
				value.substring(end);

			// Move cursor to end of inserted text
			const newPosition = start + transcription.length;
			activeElement.setSelectionRange(newPosition, newPosition);
			// Trigger input event to notify any listeners
			activeElement.dispatchEvent(new Event("input", { bubbles: true }));
			// Keep focus on the element
			activeElement.focus();

			if (this.plugin.settings.debugMode) {
				new Notice("Inserted transcription into input/textarea");
			}
		} else if (
			activeElement &&
			activeElement instanceof HTMLElement &&
			activeElement.contentEditable === "true"
		) {
			// Handle contentEditable elements
			const selection = window.getSelection();
			if (selection && selection.rangeCount > 0) {
				const range = selection.getRangeAt(0);
				range.deleteContents();
				const textNode = document.createTextNode(transcription);
				range.insertNode(textNode);

				// Move cursor to end of inserted text
				range.setStartAfter(textNode);
				range.setEndAfter(textNode);
				selection.removeAllRanges();
				selection.addRange(range);

				// Trigger input event
				activeElement.dispatchEvent(
					new Event("input", { bubbles: true })
				);

				if (this.plugin.settings.debugMode) {
					new Notice(
						"Inserted transcription into contentEditable element"
					);
				}
			}
		} else {
			// Fall back to MarkdownView editor
			const editor =
				this.plugin.app.workspace.getActiveViewOfType(
					MarkdownView
				)?.editor;
			if (editor) {
				const cursorPosition = editor.getCursor();
				editor.replaceRange(transcription, cursorPosition);

				// Move the cursor to the end of the inserted text
				const newPosition = {
					line: cursorPosition.line,
					ch: cursorPosition.ch + transcription.length,
				};
				editor.setCursor(newPosition);

				if (this.plugin.settings.debugMode) {
					new Notice("Inserted transcription into markdown editor");
				}
			} else {
				// If no suitable element is found, copy to clipboard as fallback
				// await navigator.clipboard.writeText(transcription);
				new Notice(
					"No text input found."
				);
			}
		}
	}
}
