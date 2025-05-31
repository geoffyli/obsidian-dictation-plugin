import { Plugin } from "obsidian";
import { Timer } from "src/Timer";
import { Transcriber } from "src/Transcriber";
import { SettingsTab } from "src/ui/SettingsTab";
import { SettingsManager, PluginSettings } from "src/SettingsManager";
import { Recorder } from "src/Recorder";
import { StatusBar } from "src/ui/StatusBar";
import { DictationIndicator } from "./src/ui/Indicator";
import { dictate } from "./src/Dictate";

export default class Dictation extends Plugin {
	settings: PluginSettings;
	settingsManager: SettingsManager;
	timer: Timer;
	recorder: Recorder;
	Transcriber: Transcriber;
	statusBar: StatusBar;
	dictationIndicator: DictationIndicator;

	async onload() {
		// Load settings manager and settings
		this.settingsManager = new SettingsManager(this);
		this.settings = await this.settingsManager.loadSettings();

		this.addSettingTab(new SettingsTab(this.app, this));

		this.timer = new Timer();
		this.Transcriber = new Transcriber(this);
		this.recorder = new Recorder();
		this.dictationIndicator = new DictationIndicator();
		this.statusBar = new StatusBar(this);
		this.dictationIndicator.onStopRecording = dictate.bind(this);
		this.addCommands();
	}

	onunload() {
		this.statusBar.remove();
	}

	addCommands() {
		this.addCommand({
			id: "start-stop-transcribing",
			name: "Start/stop Transcribing",
			callback: dictate.bind(this),
			hotkeys: [
				{
					modifiers: ["Alt"],
					key: "Q",
				},
			],
		});
	}
}
