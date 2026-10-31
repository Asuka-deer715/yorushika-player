import type {MediaRecord} from '../../shared/library.js';
import type {PlaybackMode} from './player.js';
/** Shared controls for playback backends; sources may have different access requirements. */
export interface PlaybackController {
 readonly current:MediaRecord|null;
 readonly queue:MediaRecord[];
 readonly media:HTMLMediaElement;
 readonly mode:PlaybackMode;
 play(item:MediaRecord,queue:MediaRecord[],position?:number):Promise<void>;
 toggle():void;
 next(direction:number,automatic?:boolean):void;
 seek(fraction:number):void;
 volume(value:number):void;
 setMode(mode:PlaybackMode):void;
}
