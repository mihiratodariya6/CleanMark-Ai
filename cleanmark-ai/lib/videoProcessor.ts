import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

export class VideoProcessor {
  private ffmpeg: FFmpeg;
  private onProgress: (stage: string, progress: number) => void;

  constructor(onProgress: (stage: string, progress: number) => void) {
    this.ffmpeg = new FFmpeg();
    this.onProgress = onProgress;
  }

  async load() {
    this.onProgress('Initializing AI Engine', 0);
    await this.ffmpeg.load({
      coreURL: `https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js`,
      wasmURL: `https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm`,
    });

    this.ffmpeg.on('progress', ({ progress }) => {
      const percentage = Math.round(progress * 100);
      this.onProgress('Removing Watermark Seamlessly', 10 + Math.floor(percentage * 0.8));
    });
  }

  async processVideo(file: File, maskCoords: {x: number, y: number, w: number, h: number}): Promise<Blob> {
    try {
      this.onProgress('Preparing Video', 10);
      const inputName = 'input.mp4';
      const outputName = 'output.mp4';

      await this.ffmpeg.writeFile(inputName, await fetchFile(file));

      let { x, y, w, h } = maskCoords;
      if (w < 4) w = 4;
      if (h < 4) h = 4;

      const filter = `delogo=x=${x}:y=${y}:w=${w}:h=${h}`;

      this.onProgress('Processing AI Inpainting', 15);

      // THE ULTIMATE ENCODING FIX:
      // -c:v libx264 : વિડીયો કોડેક H.264 સેટ કરે છે (બધા ડિવાઇસ સપોર્ટ કરે છે)
      // -pix_fmt yuv420p : કલર ફોર્મેટ સેટ કરે છે (વિન્ડોઝ મીડિયા પ્લેયર માટે ફરજિયાત છે)
      // -c:a aac : ઓડિયોને સ્ટાન્ડર્ડ ફોર્મેટમાં કન્વર્ટ કરે છે
      
      await this.ffmpeg.exec([
        '-i', inputName,
        '-vf', filter,
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-preset', 'fast', // ultrafast ક્યારેક કરપ્ટ ફાઈલ બનાવે છે, 'fast' સેફ છે
        '-crf', '23',
        '-c:a', 'aac', // ઓડિયોને કોપી કરવાને બદલે કન્વર્ટ કરો, જેથી એરર ના આવે
        outputName
      ]);

      this.onProgress('Finalizing Video', 95);
      
      const data = await this.ffmpeg.readFile(outputName);

      this.onProgress('Done', 100);
      
      this.ffmpeg.deleteFile(inputName);
      try { this.ffmpeg.deleteFile(outputName); } catch(e){}

      return new Blob([data], { type: 'video/mp4' });

    } catch (error) {
      console.error("FFmpeg Processing failed:", error);
      throw new Error("Failed to process video. Please try again.");
    }
  }
}