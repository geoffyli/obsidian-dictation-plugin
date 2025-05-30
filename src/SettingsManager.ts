import { Plugin } from "obsidian";

export interface PluginSettings {
	apiKey: string;
	apiUrl: string;
	model: string;
	prompt: string;
	language: string;
	debugMode: boolean;
}

export const DEFAULT_SETTINGS: PluginSettings = {
	apiKey: "",
	apiUrl: "https://api.openai.com/v1/audio/transcriptions",
	model: "whisper-1",
	prompt: "",
	language: "en",
	debugMode: false,
};

export class SettingsManager {
	private plugin: Plugin;

	constructor(plugin: Plugin) {
		this.plugin = plugin;
	}

	async loadSettings(): Promise<PluginSettings> {
		return Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.plugin.loadData()
		);
	}

	async saveSettings(settings: PluginSettings): Promise<void> {
		await this.plugin.saveData(settings);
	}
}
