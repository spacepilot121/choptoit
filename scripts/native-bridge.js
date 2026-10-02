import {Filesystem, Directory, Encoding} from '@capacitor/filesystem';
import {Share} from '@capacitor/share';
import {App} from '@capacitor/app';

App.addListener('appStateChange', ({isActive}) => {
  if (!isActive) { window.ChopSuspend?.(); window.ChopAudio?.suspend(); }
});

window.ChopNativeAPI = {
  async exportSave(json) {
    const path='choptoit-save.json';
    await Filesystem.writeFile({path,data:json,directory:Directory.Cache,encoding:Encoding.UTF8});
    const {uri}=await Filesystem.getUri({path,directory:Directory.Cache});
    await Share.share({title:'Chop To It! save backup',files:[uri],dialogTitle:'Save a copy of your story'});
  }
};
