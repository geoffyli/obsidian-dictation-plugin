import { RecordingStatus } from "./ui/StatusBar";

export async function dictate() {
	// Toggle recording state
	if (this.statusBar.status == RecordingStatus.Idle) {
		// Start recording
		await this.recorder.startRecording();
		this.statusBar.updateStatus(RecordingStatus.Recording);
		this.dictationIndicator.show("recording");
	} else if (this.statusBar.status == RecordingStatus.Recording) {
		// Stop recording and process the audio
		const audioBlob = await this.recorder.stopRecording();
		this.statusBar.updateStatus(RecordingStatus.Processing);
		this.dictationIndicator.show("processing");
		// Create a file name based on the current date and time
		const extension = this.recorder.getMimeType()?.split("/")[1];
		const fileName = `${new Date()
			.toISOString()
			.replace(/[:.]/g, "-")}.${extension}`;
		// Use audioBlob to send or save the recorded audio as needed
		await this.Transcriber.sendAudioData(audioBlob, fileName);
		this.statusBar.updateStatus(RecordingStatus.Idle);
		this.dictationIndicator.hide();
	}
}
