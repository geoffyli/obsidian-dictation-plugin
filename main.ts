import { Plugin } from "obsidian";
import { Timer } from "src/Timer";
import { Transcriber } from "src/Transcriber";
import { SettingsTab } from "src/ui/SettingsTab";
import { SettingsManager, PluginSettings } from "src/SettingsManager";
import { Recorder } from "src/Recorder";
import { RecordingStatus, StatusBar } from "src/ui/StatusBar";
import { DictationIndicator } from './src/ui/Indicator';

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

		this.addCommands();
	}

	onunload() {
		if (this.controls) {
			this.controls.close();
		}

		this.statusBar.remove();
	}

	addCommands() {
		this.addCommand({
			id: "start-stop-transcribing",
			name: "Start/stop Transcribing",
			callback: async () => {
				// Toggle recording state
				if (this.statusBar.status == RecordingStatus.Idle) {
					// Start recording
					await this.recorder.startRecording();
					this.statusBar.updateStatus(RecordingStatus.Recording);
					this.dictationIndicator.show("recording");
				} 
				else if (this.statusBar.status == RecordingStatus.Recording) {
					// Stop recording and process the audio
					const audioBlob = await this.recorder.stopRecording();
					this.statusBar.updateStatus(RecordingStatus.Processing);
					this.dictationIndicator.show("processing");
					const extension = this.recorder
						.getMimeType()
						?.split("/")[1];
					const fileName = `${new Date()
						.toISOString()
						.replace(/[:.]/g, "-")}.${extension}`;
					// Use audioBlob to send or save the recorded audio as needed
					await this.Transcriber.sendAudioData(audioBlob, fileName);
					this.statusBar.updateStatus(RecordingStatus.Idle);
					this.dictationIndicator.hide();
				}
			},
			hotkeys: [
				{
					modifiers: ["Alt"],
					key: "Q",
				},
			],
		});
	}
}
