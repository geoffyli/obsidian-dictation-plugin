import axios from "axios";
import Dictation from "main";
import { Notice, MarkdownView } from "obsidian";

export class Transcriber {
	private plugin: Dictation;

	constructor(plugin: Dictation) {
		this.plugin = plugin;
	}

	async sendAudioData(blob: Blob, fileName: string): Promise<void> {
		if (this.plugin.settings.debugMode) {
			new Notice(`Sending audio data size: ${blob.size / 1000} KB`);
		}

		if (!this.plugin.settings.apiKey) {
			new Notice(
				"API key is missing. Please add your API key in the settings."
			);
			return;
		}

		const formData = new FormData();
		formData.append("file", blob, fileName);
		formData.append("model", this.plugin.settings.model);
		formData.append("language", this.plugin.settings.language);
		if (this.plugin.settings.prompt)
			formData.append("prompt", this.plugin.settings.prompt);

		try {
			if (this.plugin.settings.debugMode) {
				new Notice("Parsing audio data:" + fileName);
			}
			const response = await axios.post(
				this.plugin.settings.apiUrl,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
						Authorization: `Bearer ${this.plugin.settings.apiKey}`,
					},
				}
			);

			// Determine if a new file should be created
			// Insert the transcription at the cursor position
			const editor =
				this.plugin.app.workspace.getActiveViewOfType(
					MarkdownView
				)?.editor;
			if (editor) {
				const cursorPosition = editor.getCursor();
				editor.replaceRange(response.data.text, cursorPosition);

				// Move the cursor to the end of the inserted text
				const newPosition = {
					line: cursorPosition.line,
					ch: cursorPosition.ch + response.data.text.length,
				};
				editor.setCursor(newPosition);
			}

			new Notice("Audio parsed successfully.");
		} catch (err) {
			console.error("Error parsing audio:", err);
			new Notice("Error parsing audio: " + err.message);
		}
	}
}
