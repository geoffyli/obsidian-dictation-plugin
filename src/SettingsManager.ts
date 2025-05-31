import { Plugin } from "obsidian";

export interface PluginSettings {
	apiKey: string;
	model: string;
	prompt: string;
	debugMode: boolean;
}

export const DEFAULT_SETTINGS: PluginSettings = {
	apiKey: "",
	model: "gpt-4o-transcribe",
	prompt: "",
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
